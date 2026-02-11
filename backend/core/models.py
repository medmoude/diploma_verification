from django.db import models
from django.core.exceptions import ValidationError
from django.core.validators import RegexValidator
from django.contrib.auth.models import User
from django.conf import settings
from django.contrib.auth import get_user_model
import uuid
import random
import string
from django.utils import timezone
from datetime import timedelta


def generate_hex_uuid():
    return uuid.uuid4().hex


annee_validator = RegexValidator(
    regex=r"^\d{4}-\d{4}$",
    message="Le format doit être YYYY-YYYY (ex: 2024-2025)"
)


class Filiere(models.Model):
    code_filiere = models.CharField(max_length=30)
    nom_filiere_fr = models.CharField(max_length=255)
    nom_filiere_ar = models.CharField(max_length=255)

    def __str__(self):
        return self.code_filiere
    

    
class AnneeUniversitaire(models.Model):
    code_annee = models.CharField(
        max_length=9,
        unique=True,
        validators=[annee_validator]
    )

    def clean(self):
        start, end = self.code_annee.split("-")
        if int(end) != int(start) + 1:
            raise ValidationError(
                "L'année universitaire doit être consécutive (ex: 2024-2025)"
            )

    def __str__(self):
        return self.code_annee



class Etudiant(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, null=True, blank=True)
    nom_prenom_fr = models.CharField(max_length=50)
    nom_prenom_ar = models.CharField(max_length=255)
    matricule = models.IntegerField(unique=True, null=False, blank=False)
    email = models.EmailField(unique=True, null=True, blank=True)
    nni = models.CharField(max_length=20, unique=True, null=False, blank=False)
    date_naissance = models.DateField(null=False, blank=False)
    lieu_naissance_fr = models.CharField(max_length=100, null=False, blank=False)
    lieu_naissance_ar = models.CharField(max_length=100, null=False, blank=False)
    filiere = models.ForeignKey(Filiere, on_delete=models.CASCADE)
    mention_fr = models.CharField(max_length=100, null=False, blank=False)
    mention_ar = models.CharField(max_length=100, null=False, blank=False)

    annee_universitaire = models.ForeignKey(
        AnneeUniversitaire,
        on_delete=models.PROTECT,
        related_name="diplomes"
    )


    def __str__(self):
        return f"{self.nom_prenom_fr}"



class Diplome(models.Model):
    etudiant = models.ForeignKey(Etudiant, on_delete=models.CASCADE, related_name="Diplomes")
    numero_diplome = models.IntegerField(null=False, blank=False)
    specialite = models.ForeignKey(Filiere, on_delete=models.CASCADE)
    type_diplome = models.CharField(max_length=100)
    annee_obtention = models.IntegerField()
    fichier_pdf = models.CharField(max_length=400)   # absolute sealed path
    hash_signature = models.CharField(max_length=64, unique=True)  # SHA256 of PDF
    verification_uuid = models.CharField(max_length=32, unique=True, default=generate_hex_uuid)  # QR / verification UUID
    date_televersement = models.DateTimeField(auto_now_add=True)
    est_annule = models.BooleanField(default=False)
    annule_a = models.DateTimeField(null=True, blank=True)
    raison_annulation = models.TextField(blank=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["annee_obtention", "numero_diplome"],
                name="unique_diplome_per_year"
            )
        ]


    def get_verification_url(self):
        return f"http://localhost:3000/verify/{self.verification_uuid}/"

    def __str__(self):
        return f"{self.type_diplome} - {self.etudiant}"



class StructureDiplome(models.Model):
    # Background / border
    image_border = models.ImageField(upload_to="images/", null=False, blank=False)

    # Header logos
    image_logo_left = models.ImageField(upload_to="images/", null=False, blank=False)
    image_logo_right = models.ImageField(upload_to="images/", null=False, blank=False)

    # Header
    republique_fr = models.CharField(max_length=150, default="REPUBLIQUE ISLAMIQUE DE MAURITANIE")
    republique_ar = models.CharField(max_length=150, default="الجمهورية الإسلامية الموريتانية")
    devise_fr = models.CharField(max_length=150, default="Honneur-Fraternité-Justice")
    devise_ar = models.CharField(max_length=150, default="شرف-إخاء-عدل")

    ministere_fr = models.CharField(max_length=250)
    ministere_ar = models.CharField(max_length=250)

    groupe_fr = models.CharField(max_length=250)
    groupe_ar = models.CharField(max_length=250)

    institut_fr = models.CharField(max_length=250)
    institut_ar = models.CharField(max_length=250)

    # Diploma title
    diplome_titre_fr = models.CharField(max_length=250)
    diplome_titre_ar = models.CharField(max_length=250)

    # Legal Citations
    citations_juridiques_fr = models.TextField(help_text="Liste des décrets et lois")
    citations_juridiques_ar = models.TextField(help_text="قائمة القوانين والمراسيم")

    # Add to StructureDiplome
    label_pv_jury_fr = models.CharField(max_length=255, default="Vu le procès-verbal du jury des examens tenu en date du")
    label_pv_jury_ar = models.CharField(max_length=255, default="وبناء على محضر لجنة الامتحانات الصادر بتاريخ")
    date_pv_jury = models.DateField(null=True, blank=True)

    # Footer / signatures
    date_verification = models.DateField(null=True, blank=True)


    signataire_droit_fr = models.CharField(max_length=150)
    signataire_droit_ar = models.CharField(max_length=150)
    signataire_droit_nom = models.CharField(max_length=150)

    signataire_gauche_fr = models.CharField(max_length=150)
    signataire_gauche_ar = models.CharField(max_length=150)
    signataire_gauche_nom = models.CharField(max_length=150)

    def __str__(self):
        return "Structure du diplôme"



class Verification(models.Model):
    diplome = models.ForeignKey(Diplome, on_delete=models.SET_NULL, related_name="verifications", null=True, blank=True)
    date_verification = models.DateTimeField(auto_now_add=True)
    adresse_ip = models.GenericIPAddressField(null=True, blank=True)
    statut = models.CharField(max_length=20, choices=[("succes", "Succès"), ("echec", "Échec")])



User = get_user_model()

class PasswordHistory(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='password_history')
    password_hash = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at'] # Newest first

    def __str__(self):
        return f"{self.user.username} - {self.created_at}"
    


class EmailChangeRequest(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='email_change_request')
    new_email = models.EmailField()
    code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)

    def generate_code(self):
        self.code = str(random.randint(100000, 999999))
        self.save()



class PasswordResetRequest(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    code = models.CharField(max_length=8)
    created_at = models.DateTimeField(auto_now_add=True)

    def is_valid(self):
        # Code valid for 15 minutes
        return self.created_at >= timezone.now() - timedelta(minutes=15)

    @staticmethod
    def generate_code():
        chars = string.ascii_uppercase + string.digits
        return ''.join(random.choice(chars) for _ in range(6))



class PVJury(models.Model):
    filiere = models.ForeignKey('Filiere', on_delete=models.CASCADE)
    annee_universitaire = models.ForeignKey('AnneeUniversitaire', on_delete=models.CASCADE)
    image_pv = models.ImageField(upload_to='pvs_jury/')
    date_upload = models.DateTimeField(auto_now_add=True)
    uploaded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)

    class Meta:
        # One PV per Filiere per Year
        unique_together = ('filiere', 'annee_universitaire')

    def __str__(self):
        return f"PV {self.filiere} - {self.annee_universitaire}"