import os

from pyhanko.sign import signers
from pyhanko.sign.signers import SimpleSigner
from pyhanko.pdf_utils.incremental_writer import IncrementalPdfFileWriter
from pyhanko.keys.pemder import load_private_key_from_pemder, load_cert_from_pemder


# ===================== PATHS =====================

BASE_DIR = os.path.dirname(
    os.path.dirname(
        os.path.dirname(
            os.path.dirname(__file__)
        )
    )
)

KEYS_DIR = os.path.join(BASE_DIR, "config", "keys")

PRIVATE_KEY_PATH = os.path.join(KEYS_DIR, "diploma_private.key")
CERT_PATH = os.path.join(KEYS_DIR, "diploma_cert.pem")


# ===================== SIGN FUNCTION =====================

def sign_pdf(unsigned_pdf_path: str, signed_pdf_path: str):
    """
    Digitally sign a PDF diploma using institutional PKI.
    Any modification invalidates the signature.
    """

    # ✅ PASS FILE PATHS
    private_key = load_private_key_from_pemder(
        PRIVATE_KEY_PATH,
        passphrase=None
    )

    cert = load_cert_from_pemder(CERT_PATH)

    # ✅ MUST be iterable
    signer = SimpleSigner(
        signing_cert=cert,
        signing_key=private_key,
        cert_registry=[cert]
    )

    with open(unsigned_pdf_path, "rb") as inf:
        writer = IncrementalPdfFileWriter(inf)

        with open(signed_pdf_path, "wb") as outf:
            signers.sign_pdf(
                writer,
                signature_meta=signers.PdfSignatureMetadata(
                    field_name="InstitutionSignature",
                    reason="Diplôme officiel signé numériquement",
                    location="Mauritanie"
                ),
                signer=signer,
                output=outf
            )
