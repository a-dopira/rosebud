import os

from pathlib import Path
from datetime import timedelta


def load_env(path):
    with open(path) as file:
        for line in file:
            line = line.strip()
            if not line.startswith("#"):
                key, value = line.split("=", 1)
                os.environ.setdefault(key, value)


BASE_DIR = Path(__file__).resolve().parent.parent

env_path = BASE_DIR / ".env"

load_env(env_path)

SECRET_KEY = os.getenv("SECRET_KEY")

DEBUG = bool(os.getenv("DEBUG"))

ALLOWED_HOSTS = ["*"]

CORS_ALLOWED_ORIGINS = os.getenv("CORS_ALLOWED_ORIGINS", "").split(",")

CSRF_TRUSTED_ORIGINS = os.getenv("CSRF_TRUSTED_ORIGINS", "").split(",")

CORS_ALLOW_CREDENTIALS = True

CSRF_COOKIE_SECURE = False

CSRF_COOKIE_HTTP_ONLY = False

SESSION_COOKIE_SECURE = True

CSRF_COOKIE_SAMESITE = "None"

SESSION_COOKIE_SAMESITE = "None"

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "corsheaders",
    "rest_framework",
    "django_filters",
    "rest_framework_simplejwt.token_blacklist",
    "roses.apps.RosesConfig",
    "userprofile.apps.UserprofileConfig",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "backrose.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [
            BASE_DIR / "frontend" / "build",
        ],
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

WSGI_APPLICATION = "backrose.wsgi.application"

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
}

AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]

AUTH_USER_MODEL = "userprofile.User"

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "userprofile.authenticate.CustomAuthentication",
    ),
    "DEFAULT_FILTER_BACKENDS": ("django_filters.rest_framework.DjangoFilterBackend",),
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=int(os.getenv("ACCESS_TOKEN_LIFETIME"))),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=int(os.getenv("REFRESH_TOKEN_LIFETIME"))),
    "ROTATE_REFRESH_TOKENS": bool(os.getenv("ROTATE_REFRESH_TOKENS")),
    "BLACKLIST_AFTER_ROTATION": bool(os.getenv("BLACKLIST_AFTER_ROTATION")),
    "AUTH_COOKIE": os.getenv("AUTH_COOKIE"),
    "AUTH_COOKIE_REFRESH": os.getenv("AUTH_COOKIE_REFRESH"),
    "AUTH_COOKIE_SECURE": bool(os.getenv("AUTH_COOKIE_SECURE")),
    "AUTH_COOKIE_HTTP_ONLY": bool(os.getenv("AUTH_COOKIE_HTTP_ONLY")),
    "AUTH_COOKIE_PATH": os.getenv("AUTH_COOKIE_PATH"),
    "AUTH_COOKIE_SAMESITE": os.getenv("AUTH_COOKIE_SAMESITE"),
}

LANGUAGE_CODE = "en-us"

TIME_ZONE = "Europe/Kiev"

USE_I18N = True

USE_TZ = True

STATIC_URL = "/static/"

STATICFILES_DIRS = [
    BASE_DIR / "frontend" / "build" / "static",
]

STATIC_ROOT = os.path.join(BASE_DIR, "staticfiles")

MEDIA_URL = "/media/"

MEDIA_ROOT = os.path.join(BASE_DIR, "media")

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
