import json
from django.http import JsonResponse
from django.db import connection
from rest_framework import viewsets
from ..models import Genre
from ..models import Operateur
from .serializers import UserModelSerializer
from django.contrib.auth.hashers import check_password
from django.http import JsonResponse
from rest_framework.authtoken.models import Token
from django.views.decorators.csrf import csrf_exempt
from ..models import CivismeFiscale
from .serializers import CivismeFiscaleSerializer
from rest_framework import generics
from rest_framework.response import Response
from ..models import Contribuable
from django.utils import timezone
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.contrib.auth import get_user_model
from .serializers import ContribuableSerializer
from django.contrib.auth.hashers import make_password
import base64
from io import BytesIO
from django.core.files.base import ContentFile
from PIL import Image
from django.core.exceptions import ObjectDoesNotExist

from rest_framework.views import APIView
from ..models import TransactionView
from .serializers import TransactionSerializer
from django.db.models import Q

from rest_framework.views import APIView
from ..models import Message
from .serializers import MessageSerializer
from ..models import MessagesAdmin
from .serializers import MessagesAdminSerializer
from ..models import CentralRecette
from .serializers import CentralRecetteSerializer

from rest_framework.views import APIView
from ..models import VueSommeParContribuableParAnnee
from .serializers import VueSommeParContribuableParAnneeSerializer

from django.core.mail import send_mail
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import random
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import update_session_auth_hash
from rest_framework import status

class HistogrammeAPIView(APIView):
    def get(self, request):
        try:
            prenif = self.request.session.get('prenif')
            contribuable = Contribuable.objects.get(propr_prenif=prenif)
            id = contribuable.id_contribuable
            
            # Récupérer les données de la vue filtrées par l'id du contribuable
            data = VueSommeParContribuableParAnnee.objects.filter(contribuable=id)

            # Sérialisation des données
            serializer = VueSommeParContribuableParAnneeSerializer(data, many=True)

            # Retourner les données sérialisées
            return Response(serializer.data)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)



class CentralRecetteViewSet(viewsets.ModelViewSet):
    serializer_class = CentralRecetteSerializer
    def get_queryset(self):
        # Utiliser 'self.request' pour accéder à la requête
        prenif = self.request.session.get('prenif')
        
        # Assurez-vous que l'utilisateur est bien authentifié avant d'utiliser l'email
        if not prenif:
            raise PermissionDenied("Email non trouvé dans la session")
        
        # Récupérer le contribuable associé à l'email
        contribuable = Contribuable.objects.get(propr_prenif=prenif)
        
        # Retourner les transactions associées à ce contribuable
        return CentralRecette.objects.filter(id_contribuable=contribuable.id_contribuable)

@csrf_exempt
def login_view(request):
    data = json.loads(request.body)
    email = data.get('email')
    password = data.get('password')

    try:
        # Récupérer l'utilisateur basé sur l'email
        user = Contribuable.objects.get(mailing_address=email)

        # Vérifier le mot de passe en utilisant check_password
        if check_password(password, user.password):
            return JsonResponse({'message': 'Identifiants corrects', 'user': {
                'propr_name': user.propr_name,
                'last_name': user.last_name,
                'email': user.mailing_address
            }}, status=200)
        else:
            return JsonResponse({'error': 'Identifiants incorrects'}, status=401)
    except Contribuable.DoesNotExist:
        return JsonResponse({'error': 'Utilisateur non trouvé'}, status=404)
        
class CivismeFiscaleList(generics.ListAPIView):
    queryset = CivismeFiscale.objects.all()
    serializer_class = CivismeFiscaleSerializer    
    
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.video:
            instance.video.delete()  # Supprime le fichier vidéo
        instance.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class MessagesAdminList(APIView):
    def get(self, request, *args, **kwargs):
        try:
            messages = MessagesAdmin.objects.all()
            if not messages.exists():
                raise ObjectDoesNotExist

            user_data = []
            for message in messages:
                photo_base64 = f"data:image/jpeg;base64,{message.photo}" if message.photo else None
                user_data.append({
                    'propr_name': message.propr_name,
                    'last_name': message.last_name,
                    'propr_prenif': message.propr_prenif,
                    'contribuable': message.contribuable,
                    'reponses': message.reponses,
                    'date_reponse': message.date_reponse,
                    'questions': message.questions,
                    'date_question': message.date_question,
                    'photo': photo_base64,
                })

            return JsonResponse(user_data, safe=False, status=200)

        except ObjectDoesNotExist:
            return JsonResponse({"error": "Aucun message trouvé"}, status=404)


class RegisterContribuable(APIView):
    def post(self, request):
        cin = request.data.get('propr_cin')
        propr_name = request.data.get('propr_name')
        last_name = request.data.get('last_name')
        phone_number = request.data.get('propr_contact')
        
        # Vérifier si un contribuable existe déjà
        try:
            existing_contribuable = Contribuable.objects.get(propr_cin=cin)
            return Response({"message": "Vous avez déjà un compte"}, status=401)
        except Contribuable.DoesNotExist:
            pass  # Si l'utilisateur n'existe pas, continuer l'exécution
        
        # Vérification de l'opérateur
        try:
            operateur = Operateur.objects.get(propr_cin=cin)
        except Operateur.DoesNotExist:
            return Response({"message": "L'opérateur correspondant au C.I.N n'existe pas."}, status=404)

        if operateur.propr_contact == phone_number:
            # Calcul de la distance de Levenshtein
            long_name = levenshtein_distance(propr_name, operateur.propr_name)
            long_last_name = levenshtein_distance(last_name, operateur.last_name)

            # Vérification de la similarité des noms
            if long_name < 3 and long_last_name < 10:
                prenif = GenererPRENIFetMdp(cin)
                
                # Données par défaut à enregistrer
                default_data = {
                    'create_date': timezone.now().date(),  # Date actuelle par défaut
                    'birth_date': None,  # Valeur par défaut si non fournie
                    'birth_place': 'Inconnu',  # Valeur par défaut pour le lieu de naissance
                    'mailing_address': 'Non spécifié',  # Valeur par défaut pour l'adresse postale
                    'bank_acct_no': 'Aucun',  # Valeur par défaut pour le numéro de compte bancaire
                    'propr_prenif': prenif,
                }

                # Fusionner les données de la requête et les valeurs par défaut
                data_to_save = {**default_data, **request.data}

                # Sérialisation et sauvegarde des données
                serializer = ContribuableSerializer(data=data_to_save)
                if serializer.is_valid():
                    user = serializer.save()

                    # Enregistrer les informations de l'utilisateur dans la session
                    request.session['prenif'] = user.propr_prenif

                    return Response({
                        "message": "Inscription réussie",
                        "user": {
                            'email': user.mailing_address,
                            'propr_prenif': user.propr_prenif,
                            'propr_name': operateur.propr_name,
                            'last_name': operateur.last_name,
                        }
                    }, status=status.HTTP_201_CREATED)
                else:
                    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            else:
                return Response({"message": "Le nom ne correspond pas dans la base de données"}, status=404)
        else:
            return Response({"message": "Le contact ne correspond pas au C.I.N"}, status=404)
        
@csrf_exempt
def logout_view(request):
    # Supprimer toutes les données de la session
    request.session.flush()
    return JsonResponse({'message': 'Déconnexion réussie'}, status=200)

@api_view(['POST'])
def change_password(request):
    try:
        prenif = request.session.get('prenif')
        contribuable = Contribuable.objects.get(propr_prenif=prenif)
        current_password = request.data.get('current_password')
        new_password = request.data.get('new_password')
        if check_password(current_password, contribuable.password):
            contribuable.password = new_password
            contribuable.save()
            return Response({"message": "Mot de passe modifié avec succès!"}, status=status.HTTP_200_OK)
        return Response({"message": "Mot de passe actuel incorrect."}, status=status.HTTP_400_BAD_REQUEST)

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
@csrf_exempt
def update_user_info(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            propr_name = data.get("propr_name")
            last_name = data.get("last_name")
            mailing_adrdress = data.get("mailing_address")
            phone_number = data.get("phone_number")
            photo = data.get("photo")  # Photo envoyée en base64

            # Vérification de l'existence des champs obligatoires
            if not any([propr_name, last_name, phone_number, mailing_adrdress, photo]):
                return JsonResponse({"error": "Au moins un champ doit être modifié."}, status=400)

            prenif = request.session.get('prenif')
            contribuable = Contribuable.objects.get(propr_prenif=prenif)
            cin = contribuable.propr_cin
            operateur = Operateur.objects.get(propr_cin=cin)

            # Vous pouvez vérifier les distances de Levenshtein si nécessaire, comme dans votre exemple original
            long_name = levenshtein_distance(propr_name, operateur.propr_name) if propr_name else 0
            long_last_name = levenshtein_distance(last_name, operateur.last_name) if last_name else 0
            
            if photo:
                contribuable.photo = photo  # Sauvegarde de la photo en base64

                contribuable.save()
                return JsonResponse({"message": "Informations mises à jour avec succès"}, status=200)
            
            if long_name < 3 and long_last_name < 10:
                if operateur.propr_contact == phone_number:
                    # Mise à jour sélective des champs
                    if propr_name:
                        contribuable.propr_name = propr_name
                    if last_name:
                        contribuable.last_name = last_name
                    if mailing_adrdress:
                        contribuable.mailing_address = mailing_adrdress
                    if phone_number:
                        contribuable.propr_contact = phone_number

                    contribuable.save()
                    return JsonResponse({"message": "Informations mises à jour avec succès"}, status=200)
                else:
                    return JsonResponse({"message": "Le contact ne correspond pas au C.I.N"}, status=404)
            else:
                return JsonResponse({"message": "Le nom ne correspond pas dans la base de donnée"}, status=404)

        except json.JSONDecodeError:
            return JsonResponse({"error": "Format JSON invalide."}, status=400)

        except Contribuable.DoesNotExist:
            return JsonResponse({"error": "Utilisateur non trouvé"}, status=404)

        except Exception as e:
            return JsonResponse({"error": "Erreur serveur interne"}, status=500)

def get_user_info(request):
    prenif = request.session.get('prenif')
    try:
        contribuable = Contribuable.objects.get(propr_prenif=prenif)
        photo_base64 = f"data:image/jpeg;base64,{contribuable.photo}" if contribuable.photo else None

        user_data = {
            'propr_name': contribuable.propr_name,
            'last_name': contribuable.last_name,
            'phone_number': contribuable.propr_contact,
            'mailing_address': contribuable.mailing_address,
            'propr_prenif': contribuable.propr_prenif,
            'propr_cin': contribuable.propr_cin,
            'photo': photo_base64,
        }

        return JsonResponse(user_data, status=200)

    except ObjectDoesNotExist:
        return JsonResponse({"error": "Utilisateur non trouvé"}, status=404)

def GenererPRENIFetMdp(cin):
    # Vérifiez que le CIN contient exactement 12 caractères
    if len(cin) != 12:
        raise ValueError("Le CIN doit contenir exactement 12 caractères pour générer le PRENIF et le mot de passe.")
    
    # Générer le PRENIF (Les 9 derniers chiffres du CIN et le premier est la somme des 3 premiers chiffres)
    derniere_partie_cin = cin[-9:]
    somme_trois_premiers = sum(int(digit) for digit in derniere_partie_cin[:3])

    # Si la somme est à deux chiffres, additionner encore
    while somme_trois_premiers >= 10:
        somme_trois_premiers = sum(int(digit) for digit in str(somme_trois_premiers))

    prenif = str(somme_trois_premiers) + derniere_partie_cin

    return prenif

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

@csrf_exempt
def verify_user(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        cin = data.get('cin')
        email = data.get('email')
        numero = data.get('numero')

        # Vérifiez si un utilisateur correspond aux données
        user = Contribuable.objects.filter(propr_cin=cin, mailing_address=email, propr_contact=numero).first()
        if user:
            return JsonResponse({'status': 'success', 'message': 'Utilisateur trouvé !'}, status=200)
        return JsonResponse({'status': 'error', 'message': 'Utilisateur non trouvé !'}, status=404)

    return JsonResponse({'status': 'error', 'message': 'Méthode de requête invalide !'}, status=400)

@csrf_exempt
def update_password(request):
    if request.method == "POST":
        try:
            # Charger les données JSON envoyées par le client
            data = json.loads(request.body)
            cin = data.get('cin')
            new_password = data.get('newPassword')

            # Vérifier si le CIN et le nouveau mot de passe sont présents
            if not cin or not new_password:
                return JsonResponse({'message': 'CIN ou mot de passe manquant.'}, status=400)

            # Rechercher l'utilisateur correspondant au CIN
            try:
                user = Contribuable.objects.get(propr_cin=cin)
            except Contribuable.DoesNotExist:
                return JsonResponse({'message': 'Utilisateur non trouvé.'}, status=404)

            # Mettre à jour et hacher le mot de passe
            user.password = new_password
            user.save()

            return JsonResponse({'message': 'Mot de passe mis à jour avec succès.'}, status=200)

        except json.JSONDecodeError:
            return JsonResponse({'message': 'Données invalides.'}, status=400)
        except Exception as e:
            return JsonResponse({'message': f'Erreur: {str(e)}'}, status=500)

    return JsonResponse({'message': 'Méthode non autorisée.'}, status=405)


class ChatView(APIView):
    def get(self, request):
        prenif = request.session.get('prenif')
        if not prenif:
            return Response({"error": "Utilisateur non authentifié"}, status=status.HTTP_401_UNAUTHORIZED)
        
        try:
            # Filtrer les messages par prenif
            messages = Message.objects.filter(prenif=prenif).order_by('-date_question')
            serializer = MessageSerializer(messages, many=True)
            return Response(serializer.data)
        except Contribuable.DoesNotExist:
            return Response({"error": "Utilisateur non trouvé"}, status=status.HTTP_404_NOT_FOUND)

    def post(self, request):
        prenif = request.session.get('prenif')
        if not prenif:
            return Response({"error": "Utilisateur non authentifié"}, status=status.HTTP_401_UNAUTHORIZED)
        
        try:
            # Attacher le prenif de l'utilisateur connecté au message
            data = request.data.copy()
            data['prenif'] = prenif

            serializer = MessageSerializer(data=data)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Contribuable.DoesNotExist:
            return Response({"error": "Utilisateur non trouvé"}, status=status.HTTP_404_NOT_FOUND)

class AdminChatView(APIView):
    def get(self, request):
        prenif = request.GET.get("prenif")
        if not prenif:
            return Response({"error": "Utilisateur non authentifié"}, status=status.HTTP_401_UNAUTHORIZED)

        messages = Message.objects.filter(prenif=prenif).order_by('-date_question')
        serializer = MessageSerializer(messages, many=True)
        return Response(serializer.data)

    def post(self, request):
        prenif = request.GET.get("prenif")
        if not prenif:
            return Response({"error": "Utilisateur non authentifié"}, status=status.HTTP_401_UNAUTHORIZED)

        data = request.data.copy()
        data["prenif"] = prenif  # Ajout automatique du prenif
        serializer = MessageSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@csrf_exempt
def check_session(request):
    prenif_value = request.session.get('prenif')
    if prenif_value is not None:
        return JsonResponse({'isAuthenticated': True, 'prenif': prenif_value})
    return JsonResponse({'isAuthenticated': False})

class TransactionSearchView(APIView):
    def get(self, request, *args, **kwargs):
        search_text = request.GET.get('search', '')

        # Récupérer le prenif de la session
        prenif = self.request.session.get('prenif')
            
        # Trouver le contribuable en fonction de l'email
        contribuable = Contribuable.objects.get(propr_prenif=prenif)
        id = contribuable.id_contribuable
            
        # Filtres de recherche
        transactions = TransactionView.objects.filter(contribuable=id)

        if search_text:
            transactions = transactions.filter(
                Q(n_quit__icontains=search_text) |  # Recherche sur le quit
                Q(date_paiement__icontains=search_text) |  # Recherche sur la date
                Q(montant__icontains=search_text)  # Recherche sur le montant
            )

        # Sérialiser les résultats
        serializer = TransactionSerializer(transactions, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class AdminSearchView(APIView):
    def get(self, request, *args, **kwargs):
        search_text = request.GET.get('search', '')

        if search_text:
            transactions = Contribuable.objects.filter(propr_prenif__icontains=search_text)
        else:
            transactions = Contribuable.objects.all()  # Renvoie tout si pas de recherche

        serializer = ContribuableSerializer(transactions, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)



# Stockage temporaire des codes (utilisez une base de données en production)
VERIFICATION_CODES = {}

@csrf_exempt
def send_verification_email(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        email = data.get('email')
        if not email:
            return JsonResponse({'error': 'Email non fourni'}, status=400)
        
        # Générer un code à 6 chiffres
        code = random.randint(100000, 999999)
        VERIFICATION_CODES[email] = str(code)

        # Envoyer l'email
        send_mail(
            'Votre code de vérification',
            f'Votre code est : {code}',
            'francico12ranto@gmail.com',
            [email],
            fail_silently=False,
        )
        return JsonResponse({'message': 'Code envoyé avec succès'})
    return JsonResponse({'error': 'Méthode non autorisée'}, status=405)

@csrf_exempt
def verify_code(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        email = data.get('email')
        code = data.get('code')
        if VERIFICATION_CODES.get(email) == code:
            user = Contribuable.objects.get(mailing_address=email)
            # Enregistrer les informations de l'utilisateur dans la session
            request.session['propr_name'] = user.propr_name
            request.session['last_name'] = user.last_name
            request.session['prenif'] = user.propr_prenif
            return JsonResponse({'message': 'Code vérifié avec succès', 'prenif': user.propr_prenif})
        return JsonResponse({'error': 'Code invalide'}, status=400)
    return JsonResponse({'error': 'Méthode non autorisée'}, status=405)
