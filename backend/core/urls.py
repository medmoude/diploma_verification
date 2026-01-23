from django.urls import path
from rest_framework.routers import DefaultRouter
from .api_views import ( 
    EtudiantViewSet, 
    FiliereViewSet, 
    VerificationViewSet,
    AnneUniversitaireViewSet,
    DiplomeViewSet,
    StructureDiplomeViewSet,
    GenerateDiplomeView,
    GenerateDiplomeByFiliereView,
    DownloadDiplomeView,
    PublicVerificationView,
    UploadDiplomeView
)

router = DefaultRouter()
router.register("etudiants", EtudiantViewSet)
router.register("diplomes", DiplomeViewSet)
router.register("structure_diplome", StructureDiplomeViewSet)
router.register("filieres", FiliereViewSet)
router.register("verifications", VerificationViewSet)
router.register("annee_universitaire", AnneUniversitaireViewSet)

urlpatterns = [
    # Diplômes generation and management
    path('diplomes/generate/<int:etudiant_id>/', GenerateDiplomeView.as_view(), name='generate-diplome'),
    path('diplomes/upload/<int:etudiant_id>/', UploadDiplomeView.as_view(), name='upload-diplome'),
    path('diplomes/download/<str:verification_uuid>/', DownloadDiplomeView.as_view(), name='download-diplome'),
    path("diplomes/generate-by-filiere/", GenerateDiplomeByFiliereView.as_view(), name="generate-by-filiere"),

    # Public verification endpoint (no auth required)
    path('verify/<str:verification_uuid>/', PublicVerificationView.as_view(), name='public-verify'),
    
    # Include all router URLs
] + router.urls
