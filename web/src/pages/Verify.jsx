// pages/VerificationPage.jsx
import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { publicApi } from "../api/axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckCircle,
  faTimesCircle,
  faDownload,
  faCopy,
  faPrint,
  faUserGraduate,
  faCertificate,
  faIdCard,
  faCalendarAlt,
  faSchool,
  faEnvelope,
  faShieldAlt,
  faQrcode,
  faLock,
  faShieldHalved,
  faFingerprint,
  faUserShield,
  faKey
} from "@fortawesome/free-solid-svg-icons";
import { QRCodeSVG } from "qrcode.react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

function Verify() {
  const { verification_uuid } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const hasVerified = useRef(false);

  /* ===================== VERIFY ===================== */
  useEffect(() => {
      verifyDiplome();
  }, [verification_uuid]);

  const verifyDiplome = async () => {
    try {
      const response = await publicApi.get(`verify/${verification_uuid}/`);
      setData(response.data);
    } catch (error) {
      console.log(error);
      setError("Ce diplôme n'existe pas ou est invalide.");
    } finally {
      setLoading(false);
    }
  };

  /* ===================== ACTIONS ===================== */

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const printPage = () => {
    window.print();
  };

  const downloadPDF = async () => {
    try {
      const response = await publicApi.get(
        `diplomes/download/${verification_uuid}/`,
        { responseType: "blob" }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `diplome_${verification_uuid.substring(0, 8)}.pdf`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.log(err);
      alert("Impossible de télécharger le diplôme PDF");
    }
  };

  /* ===================== STATES ===================== */

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mx-auto"></div>
            <FontAwesomeIcon icon={faShieldHalved} className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-blue-600 text-xl" />
          </div>
          <p className="mt-4 text-gray-600 flex items-center justify-center gap-2">
            <FontAwesomeIcon icon={faLock} className="text-sm" />
            Vérification sécurisée en cours...
          </p>
        </div>
      </div>
    );
  }

  if (error || !data?.valid) {
    console.log(error.data);
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-6">
            <FontAwesomeIcon icon={faTimesCircle} className="text-5xl text-red-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Diplôme invalide
          </h1>
          <p className="text-gray-600 mb-4">
            {error || "Ce diplôme n'a pas pu être vérifié."}
          </p>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center gap-2 text-red-700 text-sm">
              <FontAwesomeIcon icon={faShieldAlt} />
              <span>Vérification de sécurité échouée</span>
            </div>
          </div>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  /* ===================== DATA ===================== */

  const verificationUrl = `http://localhost:3000/verify/${verification_uuid}/`;

  const {
    nom,
    matricule,
    email,
    filiere,
    annee,
    date_emission
  } = data;

  /* ===================== UI ===================== */

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 flex items-center gap-3">
              <FontAwesomeIcon icon={faShieldHalved} className="text-blue-600" />
              Vérification de Diplôme
            </h1>
            <p className="text-gray-600 mt-2 flex items-center gap-2">
              <FontAwesomeIcon icon={faLock} className="text-sm" />
              Système officiel de vérification sécurisé •{" "}
              {format(new Date(), "dd MMMM yyyy", { locale: fr })}
            </p>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={printPage}
              className="flex items-center px-4 py-2 bg-white border rounded-lg hover:bg-gray-50"
            >
              <FontAwesomeIcon icon={faPrint} className="mr-2" />
              Imprimer
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* LEFT */}
          <div className="lg:col-span-2 space-y-8">

            {/* Status */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border-l-8 border-green-500">
              <div className="flex items-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mr-6">
                  <FontAwesomeIcon icon={faCheckCircle} className="text-4xl text-green-600" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-800">
                    Diplôme authentique
                  </h2>
                  <p className="text-gray-600 flex items-center gap-2">
                    <FontAwesomeIcon icon={faShieldHalved} className="text-green-600 text-sm" />
                    Vérifié le {format(new Date(), "dd/MM/yyyy à HH:mm", { locale: fr })}
                  </p>
                </div>
              </div>
              
              {/* Security Badge */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <FontAwesomeIcon icon={faLock} className="text-green-600" />
                    <span>Crypté</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FontAwesomeIcon icon={faFingerprint} className="text-green-600" />
                    <span>Authentifié</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FontAwesomeIcon icon={faUserShield} className="text-green-600" />
                    <span>Protégé</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Étudiant */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <SectionHeader icon={faUserGraduate} title="Informations de l'étudiant" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InfoCard label="Nom complet" value={`${nom}`} icon={faIdCard} />
                <InfoCard label="Matricule" value={matricule} icon={faIdCard} />
                <InfoCard label="Filière" value={filiere} icon={faSchool} />
                <InfoCard label="Email" value={email} icon={faEnvelope} />
              </div>
            </div>

            {/* Diplôme */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <SectionHeader icon={faCertificate} title="Détails du diplôme" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InfoCard label="Année d'obtention" value={annee} icon={faCalendarAlt} />
                <InfoCard
                  label="Date d'émission"
                  value={format(new Date(date_emission), "dd MMMM yyyy", { locale: fr })}
                  icon={faCalendarAlt}
                />
                <InfoCard
                  label="Identifiant unique"
                  value={`${verification_uuid.substring(0, 16)}...`}
                  icon={faKey}
                  copyable
                />
              </div>
            </div>

            {/* Security Info Box */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl shadow-xl p-6 border border-blue-200">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <FontAwesomeIcon icon={faShieldAlt} className="text-2xl text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                    <FontAwesomeIcon icon={faLock} className="text-sm text-blue-600" />
                    Certificat d'authenticité
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Ce diplôme a été vérifié par notre système de sécurité. 
                    L'intégrité et l'authenticité du document sont garanties par cryptographie avancée.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="space-y-8">

            {/* QR */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <SectionHeader icon={faQrcode} title="QR de vérification" />

              <div className="flex flex-col items-center">
                <div className="p-4 bg-gray-50 rounded-xl border-2 border-blue-200">
                  <QRCodeSVG value={verificationUrl} size={180} />
                </div>
                <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
                  <FontAwesomeIcon icon={faLock} className="text-blue-600" />
                  <span>Code sécurisé</span>
                </div>
                <button
                  onClick={() => setShowQR(true)}
                  className="mt-4 text-blue-600 text-sm hover:underline"
                >
                  Agrandir le QR
                </button>
              </div>
            </div>

            {/* URL */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="font-bold mb-3 flex items-center gap-2">
                <FontAwesomeIcon icon={faKey} className="text-blue-600" />
                URL de vérification
              </h3>
              <div className="flex">
                <input
                  value={verificationUrl}
                  readOnly
                  className="flex-1 border px-3 py-2 rounded-l-lg bg-gray-50 text-sm"
                />
                <button
                  onClick={() => copyToClipboard(verificationUrl)}
                  className="bg-blue-600 text-white px-4 rounded-r-lg hover:bg-blue-700"
                >
                  <FontAwesomeIcon icon={faCopy} />
                </button>
              </div>
              {copied && (
                <p className="text-green-600 text-sm mt-2 flex items-center gap-2">
                  <FontAwesomeIcon icon={faCheckCircle} />
                  URL copiée
                </p>
              )}
            </div>

            {/* Security Features */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <FontAwesomeIcon icon={faShieldHalved} className="text-green-600" />
                Caractéristiques de sécurité
              </h3>
              <div className="space-y-3">
                <SecurityFeature icon={faLock} text="Chiffrement 256-bit" />
                <SecurityFeature icon={faFingerprint} text="Signature numérique" />
                <SecurityFeature icon={faKey} text="Identifiant unique" />
              </div>
            </div>
          </div>
        </div>

        {/* QR MODAL */}
        {showQR && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-xl text-center">
              <div className="mb-4">
                <h3 className="text-xl font-bold flex items-center justify-center gap-2">
                  <FontAwesomeIcon icon={faQrcode} className="text-blue-600" />
                  QR Code de Vérification
                </h3>
                <p className="text-sm text-gray-600 mt-2 flex items-center justify-center gap-2">
                  <FontAwesomeIcon icon={faLock} />
                  Code sécurisé et authentifié
                </p>
              </div>
              <div className="p-6 bg-gray-50 rounded-xl inline-block border-2 border-blue-200">
                <QRCodeSVG value={verificationUrl} size={280} />
              </div>
              <button
                onClick={() => setShowQR(false)}
                className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Fermer
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 text-center text-gray-500 text-sm flex items-center justify-center gap-2">
          <FontAwesomeIcon icon={faShieldAlt} />
          © {new Date().getFullYear()} — Système de vérification sécurisé des diplômes de L'ISS
        </div>
      </div>
    </div>
  );
}

/* ===================== HELPERS ===================== */

function SectionHeader({ icon, title }) {
  return (
    <div className="flex items-center mb-6">
      <div className="p-3 bg-blue-100 rounded-lg mr-4">
        <FontAwesomeIcon icon={icon} className="text-2xl text-blue-600" />
      </div>
      <h2 className="text-2xl font-bold">{title}</h2>
    </div>
  );
}

function InfoCard({ label, value, icon, copyable = false }) {
  return (
    <div className="border rounded-xl p-4">
      <div className="flex items-center mb-2 text-gray-500 text-sm">
        <FontAwesomeIcon icon={icon} className="mr-2" />
        {label}
      </div>
      <div className="flex justify-between items-center">
        <span className="font-semibold truncate">{value}</span>
        {copyable && (
          <button 
            onClick={() => navigator.clipboard.writeText(value)}
            className="text-blue-600 hover:text-blue-700"
          >
            <FontAwesomeIcon icon={faCopy} />
          </button>
        )}
      </div>
    </div>
  );
}

function SecurityFeature({ icon, text }) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
        <FontAwesomeIcon icon={icon} className="text-green-600 text-xs" />
      </div>
      <span className="text-gray-700">{text}</span>
    </div>
  );
}

export default Verify;