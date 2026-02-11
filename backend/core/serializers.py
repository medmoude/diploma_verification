from rest_framework import serializers
from django.core.exceptions import ValidationError as DjangoValidationError
from .models import Diplome, Etudiant, Filiere, Verification, AnneeUniversitaire, StructureDiplome, PVJury
import re


class EtudiantSerializer(serializers.ModelSerializer):
    class Meta:
        model = Etudiant
        fields = "__all__"
        read_only_fields = ['id']


class DiplomeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Diplome
        fields = "__all__"
        read_only_fields = ['id']


class StructureDiplomeSerializer(serializers.ModelSerializer):
    class Meta:
        model = StructureDiplome
        fields = "__all__"
        read_only_fields = ["id"]


class FiliereSerializer(serializers.ModelSerializer):
    class Meta:
        model = Filiere
        fields = "__all__"
        read_only_fields = ['id']


class VerificationSerializer(serializers.ModelSerializer):
    diplome = serializers.SerializerMethodField()
    etudiant = serializers.SerializerMethodField()  # Fixed: was referencing get_etudiant

    class Meta:
        model = Verification
        fields = [
            "id",
            "date_verification",
            "adresse_ip",
            "statut",
            "diplome",
            "etudiant",
        ]

    def get_diplome(self, obj):
        if obj.diplome:
            return {
                "id": obj.diplome.id,
                # "intitule": obj.diplome.intitule,
                # "mention": obj.diplome.mention,
                "annee_obtention": obj.diplome.annee_obtention,
            }
        return None

    def get_etudiant(self, obj):
        if obj.statut == "succes" and obj.diplome and obj.diplome.etudiant:
            d = obj.diplome.etudiant
            return {
                "nom_prenom_fr": d.nom_prenom_fr,
                "matricule": d.matricule,
                "email": d.email,
                "filiere": d.filiere.nom_filiere_fr,
            }
        return None


class AnneeUniversitaireSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnneeUniversitaire
        fields = "__all__"
        read_only_fields = ['id']
    
    def validate_code_annee(self, value):
        """
        Field-level validation for code_annee
        """
        # 1. Regex validation
        if not re.match(r"^\d{4}-\d{4}$", value):
            raise serializers.ValidationError(
                "Le format doit être YYYY-YYYY (ex: 2024-2025)"
            )
        
        # 2. Consecutive years validation
        try:
            start, end = map(int, value.split("-"))
            
            if end <= start:
                raise serializers.ValidationError(
                    "L'année de fin doit être supérieure à l'année de début"
                )
            
            if end != start + 1:
                raise serializers.ValidationError(
                    "L'année universitaire doit être consécutive (ex: 2024-2025)"
                )
                
        except ValueError:
            raise serializers.ValidationError("Format invalide. Utilisez: 2024-2025")
        
        return value
    
    def validate(self, attrs):
        """
        Object-level validation - ensures model's clean() is called
        """
        # Create a temporary instance with the data
        instance = AnneeUniversitaire(**attrs)
        
        try:
            # This will trigger the model's clean() method
            instance.full_clean()
        except DjangoValidationError as e:
            # Convert Django ValidationError to DRF format
            if hasattr(e, 'message_dict'):
                raise serializers.ValidationError(e.message_dict)
            else:
                raise serializers.ValidationError({'non_field_errors': e.messages})
        
        return attrs
    
    def create(self, validated_data):
        """
        Override create to ensure full validation
        """
        instance = AnneeUniversitaire(**validated_data)
        
        try:
            instance.full_clean()
        except DjangoValidationError as e:
            if hasattr(e, 'message_dict'):
                raise serializers.ValidationError(e.message_dict)
            else:
                raise serializers.ValidationError({'non_field_errors': e.messages})
        
        instance.save()
        return instance
    
    def update(self, instance, validated_data):
        """
        Override update to ensure full validation
        """
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        try:
            instance.full_clean()
        except DjangoValidationError as e:
            if hasattr(e, 'message_dict'):
                raise serializers.ValidationError(e.message_dict)
            else:
                raise serializers.ValidationError({'non_field_errors': e.messages})
        
        instance.save()
        return instance
    


class PVJurySerializer(serializers.ModelSerializer):
    class Meta:
        model = PVJury
        fields = "__all__"
        read_only_fields = ['id']