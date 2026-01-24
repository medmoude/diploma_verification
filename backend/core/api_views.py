# core/api_views.py
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny

from django.http import FileResponse, HttpResponse
from django.shortcuts import get_object_or_404
from django.conf import settings
from django.db import IntegrityError

import os
import uuid
import hashlib
import io
from datetime import datetime

import pandas as pd
import qrcode

# ReportLab
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader
from reportlab.lib.pagesizes import A4, A3, landscape
from reportlab.lib import colors
from reportlab.lib.units import mm
from reportlab.platypus import Paragraph, Frame
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_JUSTIFY, TA_RIGHT
from reportlab.lib.fonts import addMapping
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

# PyPDF2
from PyPDF2 import PdfReader, PdfWriter

# Security (optional)
from core.security.pdf_signer import sign_pdf

# Models & Serializers
from .models import Diplome, Etudiant, Verification, Filiere, AnneeUniversitaire, StructureDiplome
from .serializers import (
    DiplomeSerializer,
    StructureDiplomeSerializer,
    EtudiantSerializer,
    FiliereSerializer,
    VerificationSerializer,
    AnneeUniversitaireSerializer
)

# Arabic support
try:
    import arabic_reshaper
    from bidi.algorithm import get_display
    HAS_ARABIC_SUPPORT = True
except ImportError:
    HAS_ARABIC_SUPPORT = False


# ===================== HELPERS =====================
# --- RTL helpers (FIX Arabic + numbers mixing) ---
LRI = "\u2066"   # Left-to-Right Isolate
PDI = "\u2069"   # Pop Directional Isolate

def ltr(x):
    return str(x)


def has_arabic(s: str) -> bool:
    s = str(s or "")
    return any("\u0600" <= ch <= "\u06FF" for ch in s)

def reshape_text(text: str) -> str:
    """Arabic shaping + RTL order for ReportLab."""
    if not text or not HAS_ARABIC_SUPPORT:
        return str(text or "")
    return get_display(arabic_reshaper.reshape(str(text)))

def register_fonts():
    """
    Registers Amiri fonts so:
      - Canvas setFont works
      - Paragraph <b>/<i> works (via addMapping)
    Returns (ar_regular, ar_bold, ar_italic, ar_bolditalic)
    """
    # Your fonts are here: backend/backend/static/fonts
    base = os.path.join(settings.BASE_DIR, "backend", "static", "fonts")
    regular = os.path.join(base, "Amiri-Regular.ttf")
    bold = os.path.join(base, "Amiri-Bold.ttf")
    italic = os.path.join(base, "Amiri-Italic.ttf")
    bolditalic = os.path.join(base, "Amiri-BoldItalic.ttf")

    # Fallbacks
    if not os.path.exists(regular):
        print("❌ Missing Arabic font:", regular)
        return ("Helvetica", "Helvetica-Bold", "Helvetica", "Helvetica-Bold")

    # Avoid re-registering each request
    registered = set(pdfmetrics.getRegisteredFontNames())

    def _reg(name, path):
        if name not in registered:
            pdfmetrics.registerFont(TTFont(name, path))

    _reg("Amiri", regular)

    if os.path.exists(bold):
        _reg("Amiri-Bold", bold)
    else:
        _reg("Amiri-Bold", regular)

    if os.path.exists(italic):
        _reg("Amiri-Italic", italic)
    else:
        _reg("Amiri-Italic", regular)

    if os.path.exists(bolditalic):
        _reg("Amiri-BoldItalic", bolditalic)
    else:
        _reg("Amiri-BoldItalic", bold if os.path.exists(bold) else regular)

    # Map family+styles for Paragraph (<b>/<i>)
    addMapping("Amiri", 0, 0, "Amiri")
    addMapping("Amiri", 1, 0, "Amiri-Bold")
    addMapping("Amiri", 0, 1, "Amiri-Italic")
    addMapping("Amiri", 1, 1, "Amiri-BoldItalic")

    return ("Amiri", "Amiri-Bold", "Amiri-Italic", "Amiri-BoldItalic")


# ===================== VIEWSETS =====================

class EtudiantViewSet(viewsets.ModelViewSet):
    queryset = Etudiant.objects.all()
    serializer_class = EtudiantSerializer

    @action(detail=False, methods=["post"])
    def import_excel(self, request):
        file = request.FILES.get("file")
        filiere_id = request.data.get("filiere")
        annee_id = request.data.get("annee_universitaire")
        email_domain = request.data.get("email_domain", "@isms.esp.mr")

        if not file or not filiere_id or not annee_id:
            return Response({"error": "file, filiere et annee_universitaire requis"}, status=400)

        filiere = Filiere.objects.get(id=filiere_id)
        annee = AnneeUniversitaire.objects.get(id=annee_id)
        df = pd.read_excel(file)
        created = 0
        skipped = []

        for index, row in df.iterrows():
            try:
                Etudiant.objects.create(
                    nom_prenom_fr=row["nom_prenom_fr"],
                    nom_prenom_ar=row["nom_prenom_ar"],
                    matricule=int(row["matricule"]),
                    email=f"{row['matricule']}{email_domain}",
                    nni=str(row["nni"]),
                    date_naissance=row["date_naissance"],
                    lieu_naissance_fr=row["lieu_naissance_fr"],
                    lieu_naissance_ar=row["lieu_naissance_ar"],
                    mention_fr=row["mention_fr"],
                    mention_ar=row["mention_ar"],
                    filiere=filiere,
                    annee_universitaire=annee
                )
                created += 1
            except IntegrityError:
                skipped.append({"row": index + 2, "matricule": row["matricule"], "reason": "Déjà existant"})

        return Response({"created": created, "skipped_count": len(skipped), "skipped": skipped})

    @action(detail=False, methods=["get"])
    def download_excel_template(self, request):
        columns = [
            "nom_prenom_fr", "nom_prenom_ar", "matricule", "nni",
            "date_naissance", "lieu_naissance_fr", "lieu_naissance_ar",
            "mention_fr", "mention_ar"
        ]
        df = pd.DataFrame(columns=columns)
        response = HttpResponse(content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
        response["Content-Disposition"] = 'attachment; filename="etudiants_template.xlsx"'
        df.to_excel(response, index=False)
        return response


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


# ===================== GENERATE DIPLOME =====================

class GenerateDiplomeView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, etudiant_id):
        etudiant = get_object_or_404(Etudiant, id=etudiant_id)

        structure = StructureDiplome.objects.first()
        if not structure:
            return Response({"error": "Veuillez d'abord configurer une Structure de Diplôme"}, status=400)

        # academic year
        try:
            annee_obtention = int(etudiant.annee_universitaire.code_annee.split("-")[1])
        except Exception:
            return Response({"error": "Année universitaire invalide"}, status=400)

        # duplicates
        if Diplome.objects.filter(etudiant=etudiant, annee_obtention=annee_obtention, type_diplome="Licence").exists():
            return Response({"error": "Diplôme déjà généré"}, status=400)

        verification_uuid = uuid.uuid4().hex
        base_verify = getattr(settings, "FRONT_VERIFY_URL", "http://localhost:3000/verify")
        verification_url = f"{base_verify}/{verification_uuid}/"
        os.makedirs(settings.DIPLOME_STORAGE_DIR, exist_ok=True)

        # fonts
        ar_font, ar_bold, ar_italic, ar_bolditalic = register_fonts()

        # PDF
        buffer = io.BytesIO()
        c = canvas.Canvas(buffer, pagesize=landscape(A4))
        width, height = landscape(A4)

        # --- BACKGROUND/BORDER ---
        if structure.image_border:
            try:
                c.drawImage(structure.image_border.path, 0, 0, width=width, height=height, preserveAspectRatio=False, mask="auto")
            except Exception as e:
                print("Border draw failed:", e)

        # --- LOGOS ---
        logo_size = 22 * mm
        logo_y = height - 50 * mm

        if structure.image_logo_left:
            try:
                c.drawImage(structure.image_logo_left.path, 25 * mm, logo_y, width=logo_size, height=logo_size, mask="auto", preserveAspectRatio=True)
            except Exception:
                pass

        if structure.image_logo_right:
            try:
                c.drawImage(structure.image_logo_right.path, width - 50 * mm, logo_y, width=logo_size, height=logo_size, mask="auto", preserveAspectRatio=True)
            except Exception:
                pass

        # --- HEADER ---
        header_y = height - 35 * mm

        c.setFillColor(colors.HexColor("#1a1a1a"))

        # French
        c.setFont("Times-Bold", 13)
        c.drawCentredString(width / 2 - 50 * mm, header_y, (structure.republique_fr or "").upper())
        c.setFont("Times-Italic", 8)
        c.drawCentredString(width / 2 - 50 * mm, header_y - 4 * mm, structure.devise_fr or "")
        c.setFont("Times-Roman", 13)
        c.drawCentredString(width / 2 - 30 * mm, header_y - 10 * mm, structure.ministere_fr or "")
        c.drawCentredString(width / 2 - 40 * mm, header_y - 15 * mm, structure.groupe_fr or "")
        c.drawCentredString(width / 2 - 40 * mm, header_y - 20 * mm, structure.institut_fr or "")

        # Arabic
        c.setFont(ar_font, 13)
        c.drawCentredString(width / 2 + 70 * mm, header_y, reshape_text(structure.republique_ar))
        c.setFont(ar_font, 10)
        c.drawCentredString(width / 2 + 70 * mm, header_y - 4 * mm, reshape_text(structure.devise_ar))
        c.setFont(ar_font, 13)
        c.drawCentredString(width / 2 + 70 * mm, header_y - 10 * mm, reshape_text(structure.ministere_ar))
        c.drawCentredString(width / 2 + 70 * mm, header_y - 15 * mm, reshape_text(structure.groupe_ar))
        c.drawCentredString(width / 2 + 70 * mm, header_y - 20 * mm, reshape_text(structure.institut_ar))

        # --- TITLES ---
        title_y = height - 70 * mm
        c.setLineWidth(1)

        c.setFont("Times-Bold", 24)
        c.drawCentredString(width / 2 - 60 * mm, title_y, (structure.diplome_titre_fr or "").upper())
        c.line(width / 2 - 110 * mm, title_y - 2 * mm, width / 2 - 10 * mm, title_y - 2 * mm)

        c.setFont(ar_bold, 24)
        c.drawCentredString(width / 2 + 60 * mm, title_y, reshape_text(structure.diplome_titre_ar))
        c.line(width / 2 + 10 * mm, title_y - 2 * mm, width / 2 + 110 * mm, title_y - 2 * mm)

        # --- BODY ---
        styles = getSampleStyleSheet()
        fr_style = ParagraphStyle(
            "Fr",
            parent=styles["Normal"],
            fontName="Times-Roman",
            fontSize=9,
            leading=10,
            alignment=TA_JUSTIFY,
            textColor=colors.HexColor("#1a1a1a"),
        )
        ar_style = ParagraphStyle(
            "Ar",
            parent=styles["Normal"],
            fontName=ar_font,
            fontSize=9,
            leading=10,
            alignment=TA_JUSTIFY,
            rightIndent=6,
            leftIndent=6,
            textColor=colors.HexColor("#1a1a1a"),
        )

        date_birth = etudiant.date_naissance.strftime("%d/%m/%Y") if etudiant.date_naissance else "..."

        fr_html = f"""
        <para>
        <font color="#444444"><i>{structure.citations_juridiques_fr or ""}</i></font><br/><br/>
        Vu le procès-verbal du jury des examens tenu en date du : <b>{structure.date_pv_jury}</b>,<br/>
        Le <b>{(structure.diplome_titre_fr or "").capitalize()}</b> en <b>{etudiant.filiere.nom_filiere_fr}</b> <br/> 
        est conféré à l’étudiant(e) : <b>{etudiant.nom_prenom_fr or ""}</b><br/>
        n° d’inscription : <b>{etudiant.matricule}</b>, NNI : <b>{etudiant.nni}</b>,<br/>
        né le : <b>{date_birth}</b> à : <b>{etudiant.lieu_naissance_fr or ""}</b><br/>
        au titre de l’année universitaire <b>{etudiant.annee_universitaire.code_annee}</b>,
        avec la mention : <b>{etudiant.mention_fr or ""}</b>.<br/><br/>
        Diplôme n° : <b>ISMS-{str(annee_obtention)[-2:]}-{etudiant.id}</b>
        </para>
        """

        ar_html = f"""
        <para align="right">
        <font color="#444444">
        { "<br/>".join(reshape_text(line) for line in (structure.citations_juridiques_ar or "").splitlines()) }
        </font><br/><br/>
 
        <b>{ltr(structure.date_pv_jury)} </b>
        {reshape_text("وبناء على محضر لجنة الامتحانات بتاريخ:")}
        <br/>

        <b>{reshape_text(etudiant.filiere.nom_filiere_ar)}</b>
        {reshape_text("في")}
        <b>{reshape_text(structure.diplome_titre_ar)}</b>
        {reshape_text("تمنح")} 
        <br/>

        <b>{reshape_text(etudiant.nom_prenom_ar)}</b>
        {reshape_text("للطالب: ")}
        <br/>

        <b>{ltr(etudiant.nni)} {reshape_text("الرقم الوطني: ")} </b> ،
        <b>{ltr(etudiant.matricule)}</b> {reshape_text("رقم التسجيل: ")} 
        <br/>

        <b>{reshape_text(etudiant.lieu_naissance_ar)}</b> {reshape_text("في: ")} ،
        <b>{ltr(date_birth)}</b> {reshape_text("المولود: ")}
        <br/> 

        <b>{reshape_text(etudiant.mention_ar)}</b> {reshape_text("بتقدير: ")} ،
        <b>{ltr(etudiant.annee_universitaire.code_annee)}</b> {reshape_text("برسم السنة الجامعية: ")}
        <br/><br/>

        {ltr(f"<b> ISMS-{str(annee_obtention)[-2:]}-{etudiant.id} </b>")} {reshape_text("الشهادة رقم:")}

        </para>
        """


        # Frames INSIDE border (no collisions)
        inner_x = 32 * mm
        inner_y = 30 * mm
        gap = 10 * mm
        col_w = (width - 2 * inner_x - gap) / 2
        col_h = 100 * mm

        f_left = Frame(inner_x, inner_y, col_w, col_h,
                    leftPadding=6, rightPadding=6, topPadding=4, bottomPadding=4,
                    showBoundary=0)
        f_right = Frame(inner_x + col_w + gap, inner_y, col_w, col_h,
                        leftPadding=6, rightPadding=6, topPadding=4, bottomPadding=4,
                        showBoundary=0)

        # Draw
        f_left.addFromList([Paragraph(fr_html, fr_style)], c)
        f_right.addFromList([Paragraph(ar_html, ar_style)], c)


        # --- FOOTER (SIGNATORIES + QR) ---
        qr = qrcode.make(verification_url)
        qr_mem = io.BytesIO()
        qr.save(qr_mem, format="PNG")
        qr_mem.seek(0)

        sig_y = 65 * mm
        now_str = datetime.now().strftime("%d/%m/%Y")

        c.setFont("Times-Bold", 10)
        c.drawCentredString(width / 2, sig_y, f"Vérifié à Nouakchott, le {now_str}")

        c.setFont(ar_font, 10)
        c.drawCentredString(width / 2, sig_y + 5 * mm, reshape_text(f"حرر في نواكشوط بتاريخ {now_str}"))

        title_y2_fr = sig_y - 10 * mm
        title_y2_ar = sig_y - 5
        name_y2 = sig_y - 18 * mm

        # Left titles (FR + AR)
        c.setFont("Times-Bold", 10)
        c.drawString(30 * mm, title_y2_fr, structure.signataire_gauche_fr or "")
        c.setFont(ar_font, 10)
        c.drawRightString(65 * mm, title_y2_ar, reshape_text(structure.signataire_gauche_ar))

        # Left name (auto font)
        left_name = structure.signataire_gauche_nom or ""
        if has_arabic(left_name):
            c.setFont(ar_bold, 13)
            c.drawString(50 * mm, name_y2, reshape_text(left_name))
        else:
            c.setFont("Times-Bold", 13)
            c.drawString(50 * mm, name_y2, left_name.upper())

        # Right titles (FR + AR)
        c.setFont("Times-Bold", 10)
        c.drawString(width - 110 * mm, title_y2_fr, structure.signataire_droit_fr or "")
        c.setFont(ar_font, 10)
        c.drawRightString(width - 55 * mm, title_y2_ar, reshape_text(structure.signataire_droit_ar))

        # Right name (auto font)
        right_name = structure.signataire_droit_nom or ""
        if has_arabic(right_name):
            c.setFont(ar_bold, 13)
            c.drawString(width - 80 * mm, name_y2, reshape_text(right_name))
        else:
            c.setFont("Times-Bold", 13)
            c.drawString(width - 80 * mm, name_y2, right_name.upper())

        # QR inside border
        c.drawImage(ImageReader(qr_mem), width / 2 - 11 * mm, 30 * mm, width=22 * mm, height=22 * mm, mask="auto")

        # finish
        c.showPage()
        c.save()
        buffer.seek(0)

        file_name = f"diplome_{etudiant.matricule}_{verification_uuid[:8]}.pdf"
        file_path = os.path.join(settings.DIPLOME_STORAGE_DIR, file_name)

        # Save raw
        with open(file_path, "wb") as f:
            f.write(buffer.getvalue())

        # Signing the file
        DO_SIGN = True
        if DO_SIGN:
            signed_path = file_path.replace(".pdf", ".signed.pdf")
            try:
                sign_pdf(file_path, signed_path)
                # validate
                PdfReader(signed_path)
                os.replace(signed_path, file_path)
            except Exception as e:
                print("Signing failed, kept unsigned:", e)
                if os.path.exists(signed_path):
                    os.remove(signed_path)

        # Hash
        with open(file_path, "rb") as f:
            pdf_hash = hashlib.sha256(f.read()).hexdigest()

        Diplome.objects.create(
            numero_diplome=24,  # TODO
            etudiant=etudiant,
            specialite=etudiant.filiere,
            type_diplome="Licence",
            annee_obtention=annee_obtention,
            hash_signature=pdf_hash,
            verification_uuid=verification_uuid,
            fichier_pdf=file_path,  # if FileField, you may want to save relative instead
        )

        return Response(
            {"message": "Diplôme généré avec succès", "verification_url": verification_url, "uuid": verification_uuid},
            status=status.HTTP_201_CREATED
        )


class GenerateDiplomeByFiliereView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        filiere_id = request.data.get("filiere_id")
        annee_id = request.data.get("annee_universitaire_id")

        if not filiere_id or not annee_id:
            return Response({"error": "filiere_id et annee_universitaire_id requis"}, status=400)

        etudiants = Etudiant.objects.filter(filiere_id=filiere_id, annee_universitaire_id=annee_id)
        if not etudiants.exists():
            return Response({"error": "Aucun étudiant trouvé"}, status=400)

        generated, skipped = 0, 0
        generator = GenerateDiplomeView()

        for e in etudiants:
            resp = generator.post(request, e.id)
            if resp.status_code == 201:
                generated += 1
            else:
                skipped += 1

        return Response(
            {"message": "Génération en masse terminée", "total": etudiants.count(), "generes": generated, "ignores": skipped},
            status=200
        )


# ===================== DOWNLOAD & VERIFY =====================

class DownloadDiplomeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, verification_uuid):
        diplome = get_object_or_404(Diplome, verification_uuid=verification_uuid)

        pdf_path = diplome.fichier_pdf.path if hasattr(diplome.fichier_pdf, "path") else str(diplome.fichier_pdf)
        if not os.path.exists(pdf_path):
            return Response({"error": "Fichier introuvable"}, status=404)

        return FileResponse(
            open(pdf_path, "rb"),
            content_type="application/pdf",
            as_attachment=True,
            filename=os.path.basename(pdf_path),
        )


class PublicVerificationView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, verification_uuid):
        ip = request.META.get("REMOTE_ADDR")
        try:
            diplome = Diplome.objects.get(verification_uuid=verification_uuid)
            Verification.objects.create(diplome=diplome, adresse_ip=ip, statut="succes")
            return Response({
                "valid": True,
                "nom": diplome.etudiant.nom_prenom_fr,
                "prenom": "",
                "matricule": diplome.etudiant.matricule,
                "email": diplome.etudiant.email,
                "filiere": diplome.etudiant.filiere.nom_filiere,
                "date_emission": diplome.date_televersement,
                "annee": diplome.annee_obtention,
                "verification_uuid": diplome.verification_uuid
            })
        except Diplome.DoesNotExist:
            Verification.objects.create(diplome=None, adresse_ip=ip, statut="failed")
            return Response({"valid": False, "error": "Diplôme invalide"}, status=404)


# ===================== UPLOAD EXTERNAL PDF =====================

class UploadDiplomeView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, etudiant_id):
        try:
            etudiant = get_object_or_404(Etudiant, id=etudiant_id)

            if "pdf_file" not in request.FILES:
                return Response({"error": "Aucun fichier PDF fourni"}, status=400)

            pdf_file = request.FILES["pdf_file"]
            pdf_bytes = pdf_file.read()

            pdf_hash = hashlib.sha256(pdf_bytes).hexdigest()

            verification_uuid = uuid.uuid4().hex
            base_verify = getattr(settings, "FRONT_VERIFY_URL", "http://localhost:3000/verify")
            verification_url = f"{base_verify}/{verification_uuid}/"

            reader = PdfReader(io.BytesIO(pdf_bytes))
            writer = PdfWriter()
            for page in reader.pages:
                writer.add_page(page)

            os.makedirs(settings.DIPLOME_STORAGE_DIR, exist_ok=True)
            qr_path = os.path.join(settings.DIPLOME_STORAGE_DIR, f"qr_{verification_uuid[:8]}.png")
            qrcode.make(verification_url).save(qr_path)

            first_page = writer.pages[0]
            page_width = float(first_page.mediabox.width)
            page_height = float(first_page.mediabox.height)

            overlay_buffer = io.BytesIO()
            c = canvas.Canvas(overlay_buffer, pagesize=(page_width, page_height))
            c.drawImage(qr_path, page_width - 130, 30, width=100, height=100, mask="auto")
            c.save()
            overlay_buffer.seek(0)

            overlay_pdf = PdfReader(overlay_buffer)
            first_page.merge_page(overlay_pdf.pages[0])

            overlay_buffer.close()
            os.remove(qr_path)

            file_name = f"uploaded_{etudiant.matricule}_{verification_uuid[:8]}.pdf"
            file_path = os.path.join(settings.DIPLOME_STORAGE_DIR, file_name)

            with open(file_path, "wb") as f:
                writer.write(f)

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
