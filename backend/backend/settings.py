from datetime import timedelta
from pathlib import Path
import os



# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

MEDIA_ROOT = os.path.join(BASE_DIR, 'media')
MEDIA_URL = '/media/'

DIPLOME_STORAGE_DIR = os.path.join(BASE_DIR, 'diplome_storage')


# Local version

DIPLOMA_CERT_PATH = os.path.join(
    BASE_DIR,
    "config_keys",
    "diploma_cert.pem"
)

DIPLOMA_PRIVATE_KEY_PATH = os.path.join(
    BASE_DIR,
    "config_keys",
    "diploma_private.key"
)


# Deployment version
# DIPLOMA_CERT_PATH = os.getenv("DIPLOMA_CERT_PATH")
# DIPLOMA_PRIVATE_KEY_PATH = os.getenv("DIPLOMA_PRIVATE_KEY_PATH")



FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/6.0/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.getenv("SECRET_KEY", "secret_key")

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = []


# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'core',
    'corsheaders',
    'rest_framework',
    'rest_framework_simplejwt'
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'csp.middleware.CSPMiddleware',
    'django_permissions_policy.PermissionsPolicyMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]


CORS_ALLOW_ALL_ORIGINS = True

REST_FRAMEWORK = {
    # 1. LOCK THE DOORS: Require login by default for everything
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    # 2. KEYS TO OPEN: Allow JWT (for Frontend) AND Session (for you in Browser)
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    )
}

ROOT_URLCONF = 'backend.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'backend.wsgi.application'


# Database
# https://docs.djangoproject.com/en/6.0/ref/settings/#databases

 # For localhost configuration
DATABASES = { 
    'default': { 
        'ENGINE': 'django.db.backends.postgresql', 
        'NAME': 'diploma_verification', # Name of your PostgreSQL database 
        'USER': 'postgres', # Username with access to the database 
        'PASSWORD': 'admin', # Password for the user 
        'HOST': 'localhost', # The database server's address (e.g., 'localhost' or an IP) 
        'PORT': '5432', # The port number (default is 5432) 
        } 
    }


# For deployed  configuration

# DATABASES = {
#     "default": {
#         "ENGINE": "django.db.backends.sqlite3",
#         "NAME": BASE_DIR / "db.sqlite3",
#     }
# }


STATIC_URL = "/static/"
STATIC_ROOT = os.path.join(BASE_DIR, "static")

STATICFILES_DIRS = [
    os.path.join(BASE_DIR, "backend", "static"),
]




# Password validation
# https://docs.djangoproject.com/en/6.0/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator", "OPTIONS": {"min_length": 8}},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]



# Internationalization
# https://docs.djangoproject.com/en/6.0/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/6.0/howto/static-files/


# JWT STUFF

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=24),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True
}


# Email Configuration
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = os.getenv('EMAIL_USER')
# IMPORTANT: This is NOT your login password. It is an "App Password".
EMAIL_HOST_PASSWORD = os.getenv('EMAIL_PASSWORD')
DEFAULT_FROM_EMAIL = EMAIL_HOST_USER


# ==========================================
# SECURITY HEADERS (commented in developpement)
# ==========================================


# # 0. REQUIRED for PythonAnywhere (Tells Django we are using HTTPS)
# SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
# #  SECURE_SSL_REDIRECT = True

# # 1. HSTS (Strict-Transport-Security)
# # Forces HTTPS. (Safe to use now that you have SSL on PythonAnywhere)
# SECURE_HSTS_SECONDS = 31536000
# SECURE_HSTS_INCLUDE_SUBDOMAINS = True
# SECURE_HSTS_PRELOAD = True

# # 2. X-Content-Type-Options
# SECURE_CONTENT_TYPE_NOSNIFF = True

# # 3. Referrer-Policy
# SECURE_REFERRER_POLICY = 'strict-origin-when-cross-origin'

# # 4. Content-Security-Policy (CSP)
# # This restricts where scripts/images can load from.
# # "self" means only files from your own domain are allowed.
# CSP_DEFAULT_SRC = ("'self'",)
# CSP_IMG_SRC = ("'self'", "data:") # 'data:' allows the base64 QR codes to show
# CSP_STYLE_SRC = ("'self'", "'unsafe-inline'") # 'unsafe-inline' allows some admin panel styles
# CSP_SCRIPT_SRC = ("'self'",)

# # 5. Permissions-Policy
# # We explicitly block hardware access for the API to get the A+
# PERMISSIONS_POLICY = {
#     'accelerometer': [],
#     'camera': [], 
#     'geolocation': [],
#     'gyroscope': [],
#     'magnetometer': [],
#     'microphone': [],
#     'payment': [],
#     'usb': [],
# }

# # 6. X-Frame-Options (Protects against Clickjacking)
# X_FRAME_OPTIONS = 'DENY'

# # 7. Cross-Origin-Opener-Policy (Isolates the window)
# SECURE_CROSS_ORIGIN_OPENER_POLICY = 'same-origin'