"""
Django settings for myApp project (version corrigée).

Les secrets ne sont plus écrits dans le code : ils sont lus depuis
les variables d'environnement (fichier .env, voir .env.example).
"""

import os
from pathlib import Path

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent

# Charge le fichier .env (ignoré par Git)
load_dotenv(BASE_DIR / ".env")


def env_list(name, default=""):
    """Lit une variable d'environnement sous forme de liste séparée par des virgules."""
    return [v.strip() for v in os.environ.get(name, default).split(",") if v.strip()]


# --- Sécurité -------------------------------------------------------------

# Obligatoire : l'application refuse de démarrer si la clé est absente
SECRET_KEY = os.environ["DJANGO_SECRET_KEY"]

# False par défaut : il faut l'activer explicitement en développement
DEBUG = os.environ.get("DJANGO_DEBUG", "False") == "True"

# Ajoute l'IP locale de ta machine dans .env pour tester depuis un téléphone
ALLOWED_HOSTS = env_list("DJANGO_ALLOWED_HOSTS", "localhost,127.0.0.1")


# --- Applications ---------------------------------------------------------

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "corsheaders",
    "rest_framework",
    "rest_framework.authtoken",
    "users",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "corsheaders.middleware.CorsMiddleware",  # avant CommonMiddleware
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "myApp.urls"


# --- Django REST Framework ------------------------------------------------

# Par défaut, toute la API exige un token valide.
# Les vues de connexion et d'inscription doivent déclarer
# permission_classes = [AllowAny] (voir l'exemple dans la réponse).
# Deux types d'authentification, distingués par le mot-clé de l'en-tête :
#   Authorization: Bearer <token>  → contribuables (token avec expiration)
#   Authorization: Token <token>   → administrateurs (comptes Django is_staff)
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "users.api.auth.ContribuableTokenAuthentication",
        "rest_framework.authentication.TokenAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": (
        "rest_framework.permissions.IsAuthenticated",
    ),
    # Limite les routes publiques sensibles (connexion, code, inscription, reset)
    "DEFAULT_THROTTLE_RATES": {
        "auth": "10/min",
    },
}


# --- CORS -----------------------------------------------------------------

# Une application React Native native n'a pas besoin de CORS.
# Cette liste ne sert que si tu testes depuis un navigateur (Expo web).
CORS_ALLOWED_ORIGINS = env_list("CORS_ALLOWED_ORIGINS", "")


# --- Base de données ------------------------------------------------------

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": os.environ.get("DB_NAME", "nif"),
        "USER": os.environ.get("DB_USER", "postgres"),
        "PASSWORD": os.environ["DB_PASSWORD"],
        "HOST": os.environ.get("DB_HOST", "localhost"),
        "PORT": os.environ.get("DB_PORT", "5432"),
    }
}


# --- Templates ------------------------------------------------------------

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "myApp.wsgi.application"


# --- Validation des mots de passe -----------------------------------------

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]


# --- Internationalisation -------------------------------------------------

LANGUAGE_CODE = "fr"
TIME_ZONE = "Indian/Antananarivo"  # UTC+3 (l'ancien Etc/GMT-2 donnait UTC+2)
USE_I18N = True
USE_TZ = True


# --- Fichiers statiques ---------------------------------------------------

STATIC_URL = "static/"

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"


# --- E-mail (code de vérification) ----------------------------------------

EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
EMAIL_HOST = "smtp.gmail.com"
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = os.environ["EMAIL_HOST_USER"]
EMAIL_HOST_PASSWORD = os.environ["EMAIL_HOST_PASSWORD"]
DEFAULT_FROM_EMAIL = EMAIL_HOST_USER