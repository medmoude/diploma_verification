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
