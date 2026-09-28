"""
Authentification par token (avec expiration), codes de vérification par
e-mail, permissions et limitation de débit.

Un seul écran de connexion et un seul en-tête pour tout le monde :

    Authorization: Bearer <token>

- contribuables : token AuthToken (7 jours), compte = Contribuable
- administrateurs : token DRF (12 heures), compte Django is_staff
  identifié par son ADRESSE E-MAIL

Dans les deux cas la connexion se fait en deux étapes : mot de passe,
puis code à 6 chiffres envoyé par e-mail.
"""

import logging
import secrets
from datetime import timedelta

from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import check_password
from django.core.mail import send_mail
from django.utils import timezone
from django.utils.crypto import constant_time_compare, salted_hmac
from rest_framework.authentication import BaseAuthentication, get_authorization_header
from rest_framework.authtoken.models import Token as AdminToken
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.permissions import BasePermission
from rest_framework.throttling import AnonRateThrottle

from ..models import AuthToken, Contribuable, VerificationCode

logger = logging.getLogger(__name__)

TOKEN_TTL = timedelta(days=7)          # token contribuable
ADMIN_TOKEN_TTL = timedelta(hours=12)  # token administrateur
CODE_TTL = timedelta(minutes=10)       # durée de vie d'un code e-mail
MAX_CODE_ATTEMPTS = 5                  # essais autorisés par code


# --- Authentification -----------------------------------------------------

class ContribuableTokenAuthentication(BaseAuthentication):
    """En-tête attendu : Authorization: Bearer <token>

    Retrouve d'abord un token contribuable, puis, à défaut, un token
    administrateur."""

    keyword = "Bearer"

    def authenticate(self, request):
        parts = get_authorization_header(request).split()
        if not parts or parts[0].lower() != self.keyword.lower().encode():
            return None
        if len(parts) != 2:
            raise AuthenticationFailed("En-tête Authorization invalide.")
        try:
            key = parts[1].decode()
        except UnicodeError:
            raise AuthenticationFailed("Token invalide.")

        try:
            token = AuthToken.objects.select_related("contribuable").get(key=key)
        except AuthToken.DoesNotExist:
            return self._authenticate_admin(key)

        if token.expires <= timezone.now():
            token.delete()
            raise AuthenticationFailed("Token expiré.")
        return (token.contribuable, token)

    def _authenticate_admin(self, key):
        try:
            token = AdminToken.objects.select_related("user").get(key=key)
        except AdminToken.DoesNotExist:
            raise AuthenticationFailed("Token invalide.")

        user = token.user
        if not (user.is_active and user.is_staff):
            raise AuthenticationFailed("Compte non autorisé.")
        if token.created + ADMIN_TOKEN_TTL <= timezone.now():
            token.delete()
            raise AuthenticationFailed("Token expiré.")
        return (user, token)

    def authenticate_header(self, request):
        return self.keyword


# --- Permissions ----------------------------------------------------------

class IsContribuable(BasePermission):
    """Réservé aux contribuables connectés."""

    def has_permission(self, request, view):
        return isinstance(request.user, Contribuable)


class IsStaff(BasePermission):
    """Réservé aux administrateurs (compte Django avec is_staff)."""

    def has_permission(self, request, view):
        user = request.user
        return bool(user and user.is_authenticated and getattr(user, "is_staff", False))


# --- Limitation de débit --------------------------------------------------

class AuthRateThrottle(AnonRateThrottle):
    """Limite les appels aux routes publiques sensibles (voir DEFAULT_THROTTLE_RATES)."""

    scope = "auth"


# --- Comptes (contribuable ou administrateur) -----------------------------

def find_by_email(email):
    """Retourne le contribuable si l'e-mail est unique, sinon None."""
    if not email:
        return None
    matches = list(Contribuable.objects.filter(mailing_address__iexact=email)[:2])
    return matches[0] if len(matches) == 1 else None


def find_admin_by_email(email):
    """Retourne l'administrateur (is_staff) si l'e-mail est unique, sinon None."""
    if not email:
        return None
    User = get_user_model()
    matches = list(
        User.objects.filter(email__iexact=email, is_staff=True, is_active=True)[:2]
    )
    return matches[0] if len(matches) == 1 else None


def find_account(email):
    """Contribuable d'abord, sinon administrateur. Retourne None si inconnu.

    Un administrateur doit donc utiliser une adresse e-mail différente de celle
    de tout contribuable."""
    return find_by_email(email) or find_admin_by_email(email)


def password_ok(account, password):
    if isinstance(account, Contribuable):
        return check_password(password, account.password)
    return account.check_password(password)


def _subject_filter(account):
    return {"contribuable": account} if isinstance(account, Contribuable) else {"user": account}


def _subject_email(account):
    return account.mailing_address if isinstance(account, Contribuable) else account.email


# --- Tokens ---------------------------------------------------------------

def issue_token(contribuable):
    return AuthToken.objects.create(
        key=secrets.token_hex(32),
        contribuable=contribuable,
        expires=timezone.now() + TOKEN_TTL,
    )


def issue_admin_token(user):
    """Un seul token administrateur actif à la fois."""
    AdminToken.objects.filter(user=user).delete()
    return AdminToken.objects.create(user=user)


# --- Codes de vérification par e-mail -------------------------------------

def _hash_code(code):
    return salted_hmac("users.verification", str(code)).hexdigest()


def issue_code(account, purpose):
    """Crée un code à 6 chiffres, l'envoie par e-mail, invalide les anciens codes."""
    VerificationCode.objects.filter(
        purpose=purpose, used=False, **_subject_filter(account)
    ).update(used=True)

    code = f"{secrets.randbelow(1_000_000):06d}"
    VerificationCode.objects.create(
        purpose=purpose, code_hash=_hash_code(code), **_subject_filter(account)
    )
    send_mail(
        "Votre code de vérification",
        f"Votre code est : {code}\nIl expire dans {int(CODE_TTL.total_seconds() // 60)} minutes.",
        None,  # DEFAULT_FROM_EMAIL
        [_subject_email(account)],
        fail_silently=False,
    )


def check_code(account, purpose, code):
    """Vérifie un code : valide, non expiré, non utilisé, essais limités."""
    vc = (
        VerificationCode.objects.filter(
            purpose=purpose,
            used=False,
            created__gte=timezone.now() - CODE_TTL,
            **_subject_filter(account),
        )
        .order_by("-created")
        .first()
    )
    if vc is None or vc.attempts >= MAX_CODE_ATTEMPTS:
        return False

    if not constant_time_compare(vc.code_hash, _hash_code(code)):
        vc.attempts += 1
        vc.save(update_fields=["attempts"])
        return False

    vc.used = True
    vc.save(update_fields=["used"])
    return True