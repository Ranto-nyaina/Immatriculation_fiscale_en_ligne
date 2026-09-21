import logging

from django.contrib.auth.hashers import check_password
from django.core.exceptions import ValidationError as DjangoValidationError
from django.db.models import Q
from rest_framework import generics, status
from rest_framework.decorators import (
    api_view,
    authentication_classes,
    permission_classes,
    throttle_classes,
)
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.viewsets import ReadOnlyModelViewSet

from ..models import (
    AuthToken,
    CentralRecette,
    CivismeFiscale,
    Contribuable,
    Message,
    MessagesAdmin,
    Operateur,
    TransactionView,
    VueSommeParContribuableParAnnee,
)
from .auth import (
    AuthRateThrottle,
    IsContribuable,
    IsStaff,
    check_code,
    find_by_email,
    issue_code,
    issue_token,
)
from .serializers import (
    CentralRecetteSerializer,
    CivismeFiscaleSerializer,
    ContribuableSerializer,
    MessageCreateSerializer,
    MessageSerializer,
    RegisterSerializer,
    TransactionSerializer,
    VueSommeParContribuableParAnneeSerializer,
)

logger = logging.getLogger(__name__)

MAX_NAME_DISTANCE = 2          # tolérance sur les noms (avant : 3 pour le prénom, 10 pour le nom)
MAX_PHOTO_CHARS = 2_000_000    # taille maximale d'une photo en base64


# ==========================================================================
# Utilitaires
# ==========================================================================

def levenshtein_distance(s1, s2):
    m, n = len(s1), len(s2)
    dp = [[0] * (n + 1) for _ in range(m + 1)]

    for i in range(m + 1):
        dp[i][0] = i
    for j in range(n + 1):
        dp[0][j] = j

    for i in range(1, m + 1):
        for j in range(1, n + 1):
            cost = 0 if s1[i - 1] == s2[j - 1] else 1
            dp[i][j] = min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost)

    return dp[m][n]


def names_match(given, official):
    a = (given or "").strip().lower()
    b = (official or "").strip().lower()
    return levenshtein_distance(a, b) <= MAX_NAME_DISTANCE


def GenererPRENIFetMdp(cin):
    # Le CIN doit contenir exactement 12 chiffres
    if len(cin) != 12 or not cin.isdigit():
        raise ValueError("Le CIN doit contenir exactement 12 chiffres pour générer le PRENIF.")

    # PRENIF : les 9 derniers chiffres du CIN, précédés de la somme (réduite à 1 chiffre)
    # des 3 premiers de ces 9 chiffres
    derniere_partie_cin = cin[-9:]
    somme_trois_premiers = sum(int(digit) for digit in derniere_partie_cin[:3])

    while somme_trois_premiers >= 10:
        somme_trois_premiers = sum(int(digit) for digit in str(somme_trois_premiers))

    return str(somme_trois_premiers) + derniere_partie_cin


def validate_new_password(raw):
    """Applique les validateurs du modèle (longueur, lettre + chiffre + spécial).
    Retourne un message d'erreur, ou None si le mot de passe est valide."""
    try:
        Contribuable._meta.get_field("password").run_validators(raw)
    except DjangoValidationError as e:
        return " ".join(e.messages)
    return None


# ==========================================================================
# Authentification (connexion en 2 étapes : mot de passe puis code e-mail)
# ==========================================================================

@api_view(["POST"])
@authentication_classes([])
@permission_classes([AllowAny])
@throttle_classes([AuthRateThrottle])
def login_view(request):
    """Étape 1 : vérifie e-mail + mot de passe, puis envoie un code par e-mail."""
    email = (request.data.get("email") or "").strip()
    password = request.data.get("password") or ""

    contribuable = find_by_email(email)
    # Même réponse si l'e-mail est inconnu ou le mot de passe faux
    if contribuable is None or not check_password(password, contribuable.password):
        return Response({"error": "Identifiants incorrects"}, status=status.HTTP_401_UNAUTHORIZED)

    try:
        issue_code(contribuable, "login")
    except Exception:
        logger.exception("Échec d'envoi du code de connexion")
        return Response(
            {"error": "Envoi du code impossible, réessayez plus tard."},
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )
    return Response({"message": "Code de vérification envoyé par e-mail."})


# Renvoi du code : même contrôle (e-mail + mot de passe) que la connexion
send_verification_email = login_view


@api_view(["POST"])
@authentication_classes([])
@permission_classes([AllowAny])
@throttle_classes([AuthRateThrottle])
def verify_code(request):
    """Étape 2 : vérifie le code et retourne le token de session."""
    email = (request.data.get("email") or "").strip()
    code = str(request.data.get("code") or "").strip()

    contribuable = find_by_email(email)
    if contribuable is None or not check_code(contribuable, "login", code):
        return Response({"error": "Code invalide ou expiré"}, status=status.HTTP_400_BAD_REQUEST)

    token = issue_token(contribuable)
    return Response({
        "message": "Code vérifié avec succès",
        "token": token.key,
        "prenif": contribuable.propr_prenif,
        "propr_name": contribuable.propr_name,
        "last_name": contribuable.last_name,
    })


@api_view(["POST"])
def logout_view(request):
    if isinstance(request.auth, AuthToken):
        request.auth.delete()
    return Response({"message": "Déconnexion réussie"})


@api_view(["GET", "POST"])
@permission_classes([AllowAny])
def check_session(request):
    if isinstance(request.user, Contribuable):
        return Response({"isAuthenticated": True, "prenif": request.user.propr_prenif})
    return Response({"isAuthenticated": False})


# ==========================================================================
# Inscription
# ==========================================================================

class RegisterContribuable(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]
    throttle_classes = [AuthRateThrottle]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        data = serializer.validated_data
        cin = data["propr_cin"]

        if Contribuable.objects.filter(propr_cin=cin).exists():
            return Response({"message": "Vous avez déjà un compte"}, status=status.HTTP_409_CONFLICT)

        # Un seul message pour tous les échecs de vérification d'identité
        # (évite de révéler quel élément est faux)
        def mismatch():
            return Response(
                {"message": "Les informations ne correspondent pas à celles de la base."},
                status=status.HTTP_404_NOT_FOUND,
            )

        operateur = Operateur.objects.filter(propr_cin=cin).first()
        if operateur is None or operateur.propr_contact != data["propr_contact"]:
            return mismatch()
        if not (names_match(data["propr_name"], operateur.propr_name)
                and names_match(data["last_name"], operateur.last_name)):
            return mismatch()

        try:
            prenif = GenererPRENIFetMdp(cin)
        except ValueError as e:
            return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        if Contribuable.objects.filter(propr_prenif=prenif).exists():
            logger.error("Collision de PRENIF lors d'une inscription")
            return Response(
                {"message": "Impossible de générer un PRENIF, contactez le service d'aide."},
                status=status.HTTP_409_CONFLICT,
            )

        user = serializer.save(propr_prenif=prenif, birth_place="Inconnu", bank_acct_no="Aucun")

        # Pas de connexion automatique : le contribuable doit passer par
        # la connexion en 2 étapes (mot de passe + code e-mail).
        return Response({
            "message": "Inscription réussie",
            "user": {
                "email": user.mailing_address,
                "propr_prenif": user.propr_prenif,
                "propr_name": operateur.propr_name,
                "last_name": operateur.last_name,
            },
        }, status=status.HTTP_201_CREATED)


# ==========================================================================
# Mot de passe
# ==========================================================================

@api_view(["POST"])
@permission_classes([IsContribuable])
def change_password(request):
    contribuable = request.user
    current_password = request.data.get("current_password") or ""
    new_password = request.data.get("new_password") or ""

    if not check_password(current_password, contribuable.password):
        return Response({"message": "Mot de passe actuel incorrect."}, status=status.HTTP_400_BAD_REQUEST)

    error = validate_new_password(new_password)
    if error:
        return Response({"message": error}, status=status.HTTP_400_BAD_REQUEST)

    contribuable.password = new_password   # haché par Contribuable.save()
    contribuable.save()
    # Déconnecte les autres appareils
    contribuable.tokens.exclude(pk=request.auth.pk).delete()
    return Response({"message": "Mot de passe modifié avec succès!"}, status=status.HTTP_200_OK)


@api_view(["POST"])
@authentication_classes([])
@permission_classes([AllowAny])
@throttle_classes([AuthRateThrottle])
def verify_user(request):
    """Mot de passe oublié, étape 1 : vérifie CIN + e-mail + numéro, envoie un code."""
    cin = request.data.get("cin")
    email = (request.data.get("email") or "").strip()
    numero = request.data.get("numero")

    if not (cin and email and numero):
        return Response({"status": "error", "message": "Champs manquants."}, status=status.HTTP_400_BAD_REQUEST)

    user = Contribuable.objects.filter(
        propr_cin=cin, mailing_address__iexact=email, propr_contact=numero
    ).first()
    if user is None:
        return Response({"status": "error", "message": "Utilisateur non trouvé !"}, status=status.HTTP_404_NOT_FOUND)

    try:
        issue_code(user, "reset")
    except Exception:
        logger.exception("Échec d'envoi du code de réinitialisation")
        return Response(
            {"status": "error", "message": "Envoi du code impossible, réessayez plus tard."},
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )
    return Response({"status": "success", "message": "Code envoyé par e-mail."})


@api_view(["POST"])
@authentication_classes([])
@permission_classes([AllowAny])
@throttle_classes([AuthRateThrottle])
def update_password(request):
    """Mot de passe oublié, étape 2 : le code reçu par e-mail est OBLIGATOIRE.
    (Avant : le CIN seul suffisait pour changer le mot de passe de n'importe qui.)"""
    cin = request.data.get("cin")
    code = str(request.data.get("code") or "").strip()
    new_password = request.data.get("newPassword") or ""

    if not cin or not code or not new_password:
        return Response({"message": "CIN, code ou mot de passe manquant."}, status=status.HTTP_400_BAD_REQUEST)

    user = Contribuable.objects.filter(propr_cin=cin).first()
    if user is None or not check_code(user, "reset", code):
        return Response({"message": "Code invalide ou expiré."}, status=status.HTTP_400_BAD_REQUEST)

    error = validate_new_password(new_password)
    if error:
        return Response({"message": error}, status=status.HTTP_400_BAD_REQUEST)

    user.password = new_password
    user.save()
    user.tokens.all().delete()   # déconnecte tous les appareils
    return Response({"message": "Mot de passe mis à jour avec succès."})


# ==========================================================================
# Profil
# ==========================================================================

@api_view(["GET"])
@permission_classes([IsContribuable])
def get_user_info(request):
    c = request.user
    return Response({
        "propr_name": c.propr_name,
        "last_name": c.last_name,
        "phone_number": c.propr_contact,
        "mailing_address": c.mailing_address,
        "propr_prenif": c.propr_prenif,
        "propr_cin": c.propr_cin,
        "photo": f"data:image/jpeg;base64,{c.photo}" if c.photo else None,
    })


@api_view(["POST"])
@permission_classes([IsContribuable])
def update_user_info(request):
    data = request.data
    propr_name = data.get("propr_name")
    last_name = data.get("last_name")
    mailing_address = data.get("mailing_address")
    phone_number = data.get("phone_number")
    photo = data.get("photo")  # base64

    if not any([propr_name, last_name, phone_number, mailing_address, photo]):
        return Response({"error": "Au moins un champ doit être modifié."}, status=status.HTTP_400_BAD_REQUEST)

    contribuable = request.user

    if photo:
        if len(photo) > MAX_PHOTO_CHARS:
            return Response({"error": "Photo trop volumineuse."}, status=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE)
        contribuable.photo = photo
        contribuable.save(update_fields=["photo"])
        return Response({"message": "Informations mises à jour avec succès"})

    operateur = Operateur.objects.filter(propr_cin=contribuable.propr_cin).first()
    if operateur is None:
        return Response({"error": "Opérateur introuvable"}, status=status.HTTP_404_NOT_FOUND)

    if (propr_name and not names_match(propr_name, operateur.propr_name)) or \
       (last_name and not names_match(last_name, operateur.last_name)):
        return Response({"message": "Le nom ne correspond pas dans la base de donnée"}, status=status.HTTP_404_NOT_FOUND)

    if operateur.propr_contact != phone_number:
        return Response({"message": "Le contact ne correspond pas au C.I.N"}, status=status.HTTP_404_NOT_FOUND)

    if propr_name:
        contribuable.propr_name = propr_name
    if last_name:
        contribuable.last_name = last_name
    if mailing_address:
        contribuable.mailing_address = mailing_address
    contribuable.propr_contact = phone_number
    contribuable.save()
    return Response({"message": "Informations mises à jour avec succès"})


# ==========================================================================
# Données du contribuable connecté
# ==========================================================================

class HistogrammeAPIView(APIView):
    permission_classes = [IsContribuable]

    def get(self, request):
        data = VueSommeParContribuableParAnnee.objects.filter(
            contribuable=request.user.id_contribuable
        )
        return Response(VueSommeParContribuableParAnneeSerializer(data, many=True).data)


class CentralRecetteViewSet(ReadOnlyModelViewSet):
    """Lecture seule : un contribuable ne doit pas pouvoir créer,
    modifier ou supprimer des transactions."""

    serializer_class = CentralRecetteSerializer
    permission_classes = [IsContribuable]

    def get_queryset(self):
        return CentralRecette.objects.filter(id_contribuable=self.request.user)


class TransactionSearchView(APIView):
    permission_classes = [IsContribuable]

    def get(self, request, *args, **kwargs):
        search_text = request.GET.get("search", "")
        transactions = TransactionView.objects.filter(contribuable=request.user.id_contribuable)

        if search_text:
            transactions = transactions.filter(
                Q(n_quit__icontains=search_text)
                | Q(date_paiement__icontains=search_text)
                | Q(montant__icontains=search_text)
            )
        return Response(TransactionSerializer(transactions, many=True).data, status=status.HTTP_200_OK)


class CivismeFiscaleList(generics.ListAPIView):
    # Accessible à tout utilisateur authentifié (permission par défaut)
    queryset = CivismeFiscale.objects.all()
    serializer_class = CivismeFiscaleSerializer


class ChatView(APIView):
    permission_classes = [IsContribuable]

    def get(self, request):
        messages = Message.objects.filter(prenif=request.user.propr_prenif).order_by("-date_question")
        return Response(MessageSerializer(messages, many=True).data)

    def post(self, request):
        serializer = MessageCreateSerializer(data=request.data)
        if serializer.is_valid():
            # Le PRENIF vient du token, jamais du client
            serializer.save(prenif=request.user.propr_prenif)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ==========================================================================
# Administrateurs (compte Django is_staff + en-tête « Authorization: Token ... »)
# ==========================================================================

class MessagesAdminList(APIView):
    permission_classes = [IsStaff]

    def get(self, request, *args, **kwargs):
        messages = MessagesAdmin.objects.all()
        if not messages.exists():
            return Response({"error": "Aucun message trouvé"}, status=status.HTTP_404_NOT_FOUND)

        user_data = [{
            "propr_name": m.propr_name,
            "last_name": m.last_name,
            "propr_prenif": m.propr_prenif,
            "contribuable": m.contribuable,
            "reponses": m.reponses,
            "date_reponse": m.date_reponse,
            "questions": m.questions,
            "date_question": m.date_question,
            "photo": f"data:image/jpeg;base64,{m.photo}" if m.photo else None,
        } for m in messages]
        return Response(user_data)


class AdminChatView(APIView):
    permission_classes = [IsStaff]

    def get(self, request):
        prenif = request.GET.get("prenif")
        if not prenif:
            return Response({"error": "Paramètre prenif manquant"}, status=status.HTTP_400_BAD_REQUEST)
        messages = Message.objects.filter(prenif=prenif).order_by("-date_question")
        return Response(MessageSerializer(messages, many=True).data)

    def post(self, request):
        prenif = request.GET.get("prenif")
        if not prenif:
            return Response({"error": "Paramètre prenif manquant"}, status=status.HTTP_400_BAD_REQUEST)
        data = request.data.copy()
        data["prenif"] = prenif
        serializer = MessageSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AdminSearchView(APIView):
    permission_classes = [IsStaff]

    def get(self, request, *args, **kwargs):
        search_text = request.GET.get("search", "")
        if search_text:
            contribuables = Contribuable.objects.filter(propr_prenif__icontains=search_text)
        else:
            contribuables = Contribuable.objects.all()
        # ContribuableSerializer n'expose plus le mot de passe
        return Response(ContribuableSerializer(contribuables, many=True).data, status=status.HTTP_200_OK)