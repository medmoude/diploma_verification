from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import status
from django.http import FileResponse
from django.shortcuts import get_object_or_404
from datetime import datetime
import os, uuid, hashlib
from django.conf import settings
import qrcode
from io import BytesIO
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from PyPDF2 import PdfReader, PdfWriter, PageObject
import pandas as pd
from reportlab.lib import colors
from core.security.pdf_signer import sign_pdf



from .models import Diplome, Etudiant, Verification, Filiere, AnneeUniversitaire, StructureDiplome
from .serializers import (
    DiplomeSerializer, 
    StructureDiplomeSerializer,
    EtudiantSerializer,
    FiliereSerializer, 
    VerificationSerializer,
    AnneeUniversitaireSerializer
    )


# ===================== Etudiants =====================

class EtudiantViewSet(viewsets.ModelViewSet):
    queryset = Etudiant.objects.all()
    serializer_class = EtudiantSerializer

    @action(detail=False, methods=["post"])
    def import_excel(self, request):
        df = pd.read_excel(request.FILES["file"])
        for _, row in df.iterrows():
            Etudiant.objects.get_or_create(
                matricule=int(row["Matricule"]),
                defaults={
                    "prenom": row["Prénom"].capitalize(),
                    "nom": row["Nom"].capitalize(),
                    "filiere": row["Filière"].upper(),
                    "email": f"{str(row['Matricule'])}@isms.esp.mr"
                }
            )
        return Response({"status": "ok"})


class DiplomeViewSet(viewsets.ModelViewSet):
    queryset = Diplome.objects.all()
    serializer_class = DiplomeSerializer


class StructureDiplomeViewSet(viewsets.ModelViewSet):
    queryset = StructureDiplome.objects.all()
    serializer_class = StructureDiplomeSerializer


class FiliereViewSet(viewsets.ModelViewSet):
    queryset = Filiere.objects.all()
    serializer_class = FiliereSerializer


class VerificationViewSet(viewsets.ModelViewSet):
    queryset = Verification.objects.all()
    serializer_class = VerificationSerializer


class AnneUniversitaireViewSet(viewsets.ModelViewSet):
    queryset = AnneeUniversitaire.objects.all()
    serializer_class = AnneeUniversitaireSerializer


# ===================== GENERATE Diplôme =====================

class GenerateDiplomeView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, etudiant_id):
        etudiant = get_object_or_404(Etudiant, id=etudiant_id)

        # =====================================================
        # 1️⃣ Academic year
        # =====================================================
        try:
            annee_obtention = int(
                etudiant.annee_universitaire.code_annee.split("-")[1]
            )
        except Exception:
            return Response(
                {"error": "Année universitaire invalide pour ce diplômé"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # =====================================================
        # 2️⃣ Block duplicates
        # =====================================================
        if Diplome.objects.filter(
            etudiant=etudiant,
            annee_obtention=annee_obtention,
            type_diplome="Licence"
        ).exists():
            return Response(
                {"error": "Diplôme déjà généré pour cet étudiant(e)"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # =====================================================
        # 3️⃣ UUID & QR
        # =====================================================
        verification_uuid = uuid.uuid4().hex
        verification_url = f"http://localhost:3000/verify/{verification_uuid}/"

        os.makedirs(settings.DIPLOME_STORAGE_DIR, exist_ok=True)

        qr_path = os.path.join(
            settings.DIPLOME_STORAGE_DIR,
            f"qr_{verification_uuid[:8]}.png"
        )
        qrcode.make(verification_url).save(qr_path)

        # =====================================================
        # 4️⃣ PDF
        # =====================================================
        buffer = BytesIO()
        c = canvas.Canvas(buffer, pagesize=A4)
        w, h = A4

        # ---------- Border ----------
        c.setStrokeColor(colors.HexColor("#1f4ed8"))
        c.setLineWidth(4)
        c.rect(30, 30, w - 60, h - 60)

        # ---------- Header ----------
        c.setFont("Helvetica-Bold", 12)
        c.drawString(50, h - 60, "Institut supérieur de la statistique")
        c.drawRightString(w - 50, h - 60, "المعهد العالي للإحصاء")

        # ---------- Logo ----------
        logo_path = os.path.join(settings.BASE_DIR, "static", "isms_logo.jpeg")
        if os.path.exists(logo_path):
            c.drawImage(logo_path, w / 2 - 50, h - 120, 100, 60, mask="auto")

        # ---------- Title ----------
        c.setFont("Helvetica-Bold", 28)
        c.setFillColor(colors.HexColor("#1f4ed8"))
        c.drawCentredString(w / 2, h - 180, "DIPLÔME DE LICENCE")

        c.setFillColor(colors.black)
        c.setLineWidth(1)
        c.line(100, h - 200, w - 100, h - 200)

        # ---------- Body ----------
        c.setFont("Helvetica", 15)
        y = h - 260
        gap = 32

        c.drawString(120, y, f"NOM : {etudiant.nom}")
        y -= gap
        c.drawString(120, y, f"PRÉNOM : {etudiant.prenom}")
        y -= gap
        c.drawString(120, y, f"MATRICULE : {etudiant.matricule}")
        y -= gap
        c.drawString(
            120,
            y,
            f"FILIÈRE : {etudiant.filiere.nom_filiere} ({etudiant.filiere.code_filiere})"
        )

        # ---------- QR ----------
        c.drawImage(qr_path, w - 180, 120, 110, 110)
        c.setFont("Helvetica", 9)
        c.drawCentredString(w - 125, 105, "Vérification")

        # ---------- Footer ----------
        c.setFont("Helvetica", 12)
        c.drawString(
            100,
            150,
            f"Date d’émission : {datetime.now().strftime('%d/%m/%Y')}"
        )
        c.drawString(100, 120, "Le Directeur")

        c.showPage()
        c.save()

        buffer.seek(0)
        os.remove(qr_path)

        # =====================================================
        # 5️⃣ Save PDF
        # =====================================================
        file_name = f"certificat_{etudiant.matricule}_{verification_uuid[:8]}.pdf"
        file_path = os.path.join(settings.DIPLOME_STORAGE_DIR, file_name)

        unsigned_path = file_path.replace(".pdf", "_unsigned.pdf")

        # Save unsigned PDF
        with open(unsigned_path, "wb") as f:
            f.write(buffer.getvalue())

        # 🔐 SIGN THE PDF
        sign_pdf(unsigned_path, file_path)
        os.remove(unsigned_path)

        # 🔒 HASH FINAL SIGNED PDF
        with open(file_path, "rb") as f:
            signed_bytes = f.read()

        pdf_hash = hashlib.sha256(signed_bytes).hexdigest()


        Diplome.objects.create(
            etudiant=etudiant,
            specialite=etudiant.filiere,
            type_diplome="Licence",
            annee_obtention=annee_obtention,
            hash_signature=pdf_hash,
            verification_uuid=verification_uuid,
            fichier_pdf=file_path
        )

        return Response(
            {
                "message": "Certificat généré avec succès",
                "verification_url": verification_url,
                "uuid": verification_uuid
            },
            status=status.HTTP_201_CREATED
        )

    

class GenerateDiplomeByFiliereView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        filiere_id = request.data.get("filiere_id")
        annee_id = request.data.get("annee_universitaire_id")

        if not filiere_id or not annee_id:
            return Response(
                {"error": "filiere_id and annee_universitaire_id are required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        etudiants = Etudiant.objects.filter(
            filiere_id=filiere_id,
            annee_universitaire_id=annee_id
        )

        # ✅ IMPORTANT: handle empty filière
        if not etudiants.exists():
            return Response(
                {"error": "Aucun étudiant trouvé pour cette filière et cette année"},
                status=status.HTTP_400_BAD_REQUEST
            )

        generated = 0
        skipped = 0

        for etudiant in etudiants:
            try:
                annee_obtention = int(
                    etudiant.annee_universitaire.code_annee.split("-")[1]
                )
            except Exception:
                continue  # skip invalid year formats safely

            # avoid duplicates
            if Diplome.objects.filter(
                etudiant=etudiant,
                annee_obtention=annee_obtention,
                type_diplome="Licence"
            ).exists():
                skipped += 1
                continue

            # generate certificate
            GenerateDiplomeView().post(request, etudiant.id)
            generated += 1

        return Response({
            "message": "Génération terminée",
            "total_etudiants": etudiants.count(),
            "diplomes_generes": generated,
            "diplomes_ignores": skipped
        }, status=status.HTTP_200_OK)



# ===================== DOWNLOAD =====================

class DownloadDiplomeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, verification_uuid):
        diplome = get_object_or_404(Diplome, verification_uuid=verification_uuid)

        if not os.path.exists(diplome.fichier_pdf):
            return Response({"error": "Fichier introuvable"}, status=404)

        return FileResponse(
            open(diplome.fichier_pdf, "rb"),
            content_type="application/pdf",
            as_attachment=True,
            filename=os.path.basename(diplome.fichier_pdf)
        )


# ===================== PUBLIC VERIFY =====================

class PublicVerificationView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, verification_uuid):
        ip = request.META.get("REMOTE_ADDR")

        try:
            diplome = Diplome.objects.get(verification_uuid=verification_uuid)

            # SUCCESS
            Verification.objects.create(
                diplome=diplome,
                adresse_ip=ip,
                statut="succes"
            )

            return Response({
                "valid": True,
                "nom": diplome.etudiant.nom,
                "prenom": diplome.etudiant.prenom,
                "matricule": diplome.etudiant.matricule,
                "email": diplome.etudiant.email,
                "filiere": diplome.etudiant.filiere.nom_filiere,
                "date_emission": diplome.date_televersement,
                "annee": diplome.annee_obtention,
                "verification_uuid": diplome.verification_uuid
            })

        except Diplome.DoesNotExist:
            # FAILED (fake / wrong QR / tampered)
            Verification.objects.create(
                diplome=None,
                adresse_ip=ip,
                statut="failed"
            )

            return Response(
                {"valid": False, "error": "Diplôme invalide ou inexistant"},
                status=404
            )


# ===================== UPLOAD EXTERNAL PDF =====================

class UploadDiplomeView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, etudiant_id):
        try:
            etudiant = get_object_or_404(Etudiant, id=etudiant_id)

            if 'pdf_file' not in request.FILES:
                return Response({"error": "Aucun fichier PDF fourni"}, status=400)

            pdf_file = request.FILES['pdf_file']
            pdf_bytes = pdf_file.read()

            # --- SHA256 fingerprint ---
            pdf_hash = hashlib.sha256(pdf_bytes).hexdigest()

            # --- Verification UUID ---
            verification_uuid = uuid.uuid4().hex
            verification_url = f"http://localhost:3000/verify/{verification_uuid}/"

            # --- Load original PDF ---
            reader = PdfReader(BytesIO(pdf_bytes))
            writer = PdfWriter()

            # Copy all pages
            for page in reader.pages:
                writer.add_page(page)

            # --- QR overlay respecting original page size ---
            os.makedirs(settings.DIPLOME_STORAGE_DIR, exist_ok=True)
            qr_path = os.path.join(settings.DIPLOME_STORAGE_DIR, f"qr_{verification_uuid[:8]}.png")
            qrcode.make(verification_url).save(qr_path)

            first_page = writer.pages[0]
            page_width = float(first_page.mediabox.width)
            page_height = float(first_page.mediabox.height)

            overlay_buffer = BytesIO()
            c = canvas.Canvas(overlay_buffer, pagesize=(page_width, page_height))
            c.drawImage(
                qr_path,
                page_width - 130,
                30,
                width=100,
                height=100,
                mask='auto'
            )
            c.save()
            overlay_buffer.seek(0)

            overlay_pdf = PdfReader(overlay_buffer)
            first_page.merge_page(overlay_pdf.pages[0])
            overlay_buffer.close()
            os.remove(qr_path)

            # --- Save final PDF ---
            file_name = f"uploaded_{etudiant.matricule}_{verification_uuid[:8]}.pdf"
            file_path = os.path.join(settings.DIPLOME_STORAGE_DIR, file_name)

            with open(file_path, "wb") as f:
                writer.write(f)

            # --- Save Certificat ---
            Diplome.objects.create(
                etudiant=etudiant,
                specialite=etudiant.filiere,
                type_diplome=request.data.get("type", "Licence"),
                annee_obtention=request.data.get("annee", datetime.now().year),
                hash_signature=pdf_hash,
                verification_uuid=verification_uuid,
                fichier_pdf=file_path
            )

            return Response({
                "message": "Diplôme téléversé avec succès",
                "verification_url": verification_url,
                "uuid": verification_uuid,
                "file_name": file_name
            })

        except Exception as e:
            return Response({"error": str(e)}, status=500)
