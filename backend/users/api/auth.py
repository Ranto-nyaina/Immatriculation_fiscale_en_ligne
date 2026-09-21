"""
Authentification des contribuables par token (avec expiration),
codes de vérification par e-mail, permissions et limitation de débit.

Remplace l'ancienne authentification par session (request.session['prenif']).
"""

import logging
import secrets
from datetime import timedelta

from django.core.mail import send_mail
from django.utils import timezone
from django.utils.crypto import constant_time_compare, salted_hmac
from rest_framework.authentication import BaseAuthentication, get_authorization_header
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.permissions import BasePermission
from rest_framework.throttling import AnonRateThrottle

from ..models import AuthToken, Contribuable, VerificationCode

logger = logging.getLogger(__name__)

TOKEN_TTL = timedelta(days=7)      # durée de vie d'un token
CODE_TTL = timedelta(minutes=10)   # durée de vie d'un code e-mail
MAX_CODE_ATTEMPTS = 5              # essais autorisés par code


# --- Authentification -----------------------------------------------------

class ContribuableTokenAuthentication(BaseAuthentication):
    """En-tête attendu : Authorization: Bearer <token>"""

    keyword = "Bearer"

    def authenticate(self, request):
        parts = get_authorization_header(request).split()
        if not parts or parts[0].lower() != self.keyword.lower().encode():
            return None  # laisse la main à l'authentification suivante (admin)
        if len(parts) != 2:
            raise AuthenticationFailed("En-tête Authorization invalide.")
        try:
            key = parts[1].decode()
        except UnicodeError:
            raise AuthenticationFailed("Token invalide.")

        try:
            token = AuthToken.objects.select_related("contribuable").get(key=key)
        except AuthToken.DoesNotExist:
            raise AuthenticationFailed("Token invalide.")

        if token.expires <= timezone.now():
            token.delete()
            raise AuthenticationFailed("Token expiré.")
        return (token.contribuable, token)

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


# --- Tokens ---------------------------------------------------------------

def issue_token(contribuable):
    return AuthToken.objects.create(
        key=secrets.token_hex(32),
        contribuable=contribuable,
        expires=timezone.now() + TOKEN_TTL,
    )


# --- Codes de vérification par e-mail -------------------------------------

def _hash_code(code):
    return salted_hmac("users.verification", str(code)).hexdigest()


def issue_code(contribuable, purpose):
    """Crée un code à 6 chiffres, l'envoie par e-mail, invalide les anciens codes."""
    VerificationCode.objects.filter(
        contribuable=contribuable, purpose=purpose, used=False
    ).update(used=True)

    code = f"{secrets.randbelow(1_000_000):06d}"
    VerificationCode.objects.create(
        contribuable=contribuable, purpose=purpose, code_hash=_hash_code(code)
    )
    send_mail(
        "Votre code de vérification",
        f"Votre code est : {code}\nIl expire dans {int(CODE_TTL.total_seconds() // 60)} minutes.",
        None,  # DEFAULT_FROM_EMAIL
        [contribuable.mailing_address],
        fail_silently=False,
    )


def check_code(contribuable, purpose, code):
    """Vérifie un code : valide, non expiré, non utilisé, essais limités."""
    vc = (
        VerificationCode.objects.filter(
            contribuable=contribuable,
            purpose=purpose,
            used=False,
            created__gte=timezone.now() - CODE_TTL,
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


def find_by_email(email):
    """Retourne le contribuable si l'e-mail est unique, sinon None."""
    if not email:
        return None
    matches = list(Contribuable.objects.filter(mailing_address__iexact=email)[:2])
    return matches[0] if len(matches) == 1 else None