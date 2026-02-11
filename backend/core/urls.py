from django.urls import path
from rest_framework.routers import DefaultRouter
from .api_views import ( 
    EtudiantViewSet, 
    FiliereViewSet, 
    VerificationViewSet,
    AnneUniversitaireViewSet,
    DiplomeViewSet,
    DiplomeAnnulationViewSet,
    DownloadDiplomeView,
    StructureDiplomeViewSet,
    GenerateDiplomeView,
    GenerateDiplomeByFiliereView,
    PublicVerificationView,
    VerifyUploadedPdfView,
    ProfileView,
    ChangePasswordView,
    VerifyEmailChangeView,
    RequestPasswordResetView,
    VerifyResetCodeView,
    FinishPasswordResetView,
    DashboardStatsView,
    UserMeView,
    PVJuryViewSet
)

router = DefaultRouter()
router.register("etudiants", EtudiantViewSet)
router.register("diplomes", DiplomeViewSet)
router.register("structure_diplome", StructureDiplomeViewSet)
router.register("filieres", FiliereViewSet)
router.register("verifications", VerificationViewSet)
router.register("annee_universitaire", AnneUniversitaireViewSet)
router.register("diplomes-annulation", DiplomeAnnulationViewSet, basename="diplome-annulation")
router.register("pvs", PVJuryViewSet)


urlpatterns = [
    # Diplômes generation and management
    path('diplomes/generate/<int:etudiant_id>/', GenerateDiplomeView.as_view(), name='generate-diplome'),
    path('diplomes/download/<str:verification_uuid>/', DownloadDiplomeView.as_view(), name='download-diplome'),

    path("diplomes/generate-by-filiere/", GenerateDiplomeByFiliereView.as_view(), name="generate-by-filiere"),

    # Public verification endpoint (no auth required)
    path('verify/<str:verification_uuid>/', PublicVerificationView.as_view(), name='public-verify'),
    path("verify-file/", VerifyUploadedPdfView.as_view(), name="verify-file"),

    # Profile and passwords
    path("profile/", ProfileView.as_view()),
    path("change-password/", ChangePasswordView.as_view()),
    path('profile/verify-email/', VerifyEmailChangeView.as_view()),
    path('password-reset/request/', RequestPasswordResetView.as_view()),
    path('password-reset/verify/', VerifyResetCodeView.as_view()),
    path('password-reset/finish/', FinishPasswordResetView.as_view()),
    path('users/me/', UserMeView.as_view(), name='user-me'),

    #Statistics and visuals for the Dashboard
    path("dashboard-stats/", DashboardStatsView.as_view()),
    
    # Include all router URLs
] + router.urls
