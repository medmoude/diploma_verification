from django.db import models
from django.core.exceptions import ValidationError
from django.core.validators import RegexValidator
from django.contrib.auth.models import User
import uuid


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
    nni = models.IntegerField(unique=True, null=False, blank=False)
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
        return f"{self.prenom} {self.nom}"



class Diplome(models.Model):
    etudiant = models.ForeignKey(Etudiant, on_delete=models.CASCADE, related_name="Diplômes")
    numero_diplome = models.IntegerField(null=False, blank=False)
    specialite = models.ForeignKey(Filiere, on_delete=models.CASCADE)
    type_diplome = models.CharField(max_length=100)
    annee_obtention = models.IntegerField()
    fichier_pdf = models.CharField(max_length=400)   # absolute sealed path
    hash_signature = models.CharField(max_length=64, unique=True)  # SHA256 of PDF
    verification_uuid = models.CharField(max_length=32, unique=True, default=uuid.uuid4().hex)  # QR / verification UUID
    date_televersement = models.DateTimeField(auto_now_add=True)
    est_annule = models.BooleanField(default=False)
    annule_a = models.DateTimeField(null=True, blank=True)
    raison_annulation = models.TextField(blank=True)


    def get_verification_url(self):
        return f"http://localhost:3000/verify/{self.verification_uuid}/"

    def __str__(self):
        return f"{self.type_diplome} - {self.etudiant}"


class StructureDiplome(models.Model):
    nom_pays_fr = models.CharField(max_length=150)
    nom_pays_ar = models.CharField(max_length=150)

    devise_nationale_fr = models.CharField(max_length=150)
    devise_nationale_ar = models.CharField(max_length=150)

    nom_ministere_fr = models.CharField(max_length=250)
    nom_ministere_ar = models.CharField(max_length=250)

    nom_groupe_fr = models.CharField(max_length=250, blank=True, null=True)
    nom_groupe_ar = models.CharField(max_length=250, blank=True, null=True)

    nom_institut_fr = models.CharField(max_length=250, blank=True, null=True)
    nom_institut_ar = models.CharField(max_length=250, blank=True, null=True)

    intitule_diplome_fr = models.CharField(max_length=250, blank=True, null=True)
    intitule_diplome_ar = models.CharField(max_length=250, blank=True, null=True)

    signataire_1_nom_fr = models.CharField(max_length=150, blank=True, null=True)
    signataire_1_nom_ar = models.CharField(max_length=150, blank=True, null=True)

    signataire_2_nom_fr = models.CharField(max_length=150, blank=True, null=True)
    signataire_2_nom_ar = models.CharField(max_length=150, blank=True, null=True)

    def __str__(self):
        return f"{self.intitule_diplome_fr} - {self.nom_institut_fr}"



class Verification(models.Model):
    diplome = models.ForeignKey(Diplome, on_delete=models.SET_NULL, related_name="verifications", null=True, blank=True)
    date_verification = models.DateTimeField(auto_now_add=True)
    adresse_ip = models.GenericIPAddressField(null=True, blank=True)
    statut = models.CharField(max_length=20, choices=[("succes", "Succès"), ("echec", "Échec")])
