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
  faQrcode
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
    if (!hasVerified.current) {
      hasVerified.current = true;
      verifyDiplome();
    }
  }, [verification_uuid]);

  const verifyDiplome = async () => {
    try {
      const response = await publicApi.get(`verify/${verification_uuid}/`);
      setData(response.data);
    } catch {
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
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Vérification en cours...</p>
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
          <p className="text-gray-600 mb-8">
            {error || "Ce diplôme n'a pas pu être vérifié."}
          </p>
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
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
              Vérification de Diplôme
            </h1>
            <p className="text-gray-600 mt-2">
              Système officiel de vérification •{" "}
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

            <button
              onClick={downloadPDF}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <FontAwesomeIcon icon={faDownload} className="mr-2" />
              PDF
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
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    Diplôme authentique
                  </h2>
                  <p className="text-gray-600">
                    Vérifié le {format(new Date(), "dd/MM/yyyy à HH:mm", { locale: fr })}
                  </p>
                </div>
              </div>
            </div>

            {/* Étudiant */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <SectionHeader icon={faUserGraduate} title="Informations de l’étudiant" />

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
                <InfoCard label="Année d’obtention" value={annee} icon={faCalendarAlt} />
                <InfoCard
                  label="Date d’émission"
                  value={format(new Date(date_emission), "dd MMMM yyyy", { locale: fr })}
                  icon={faCalendarAlt}
                />
                <InfoCard
                  label="Identifiant unique"
                  value={`${verification_uuid.substring(0, 16)}...`}
                  icon={faShieldAlt}
                  copyable
                />
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="space-y-8">

            {/* QR */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <SectionHeader icon={faQrcode} title="QR de vérification" />

              <div className="flex flex-col items-center">
                <QRCodeSVG value={verificationUrl} size={180} />
                <button
                  onClick={() => setShowQR(true)}
                  className="mt-4 text-blue-600 text-sm"
                >
                  Agrandir le QR
                </button>
              </div>
            </div>

            {/* URL */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="font-bold mb-3">URL de vérification</h3>
              <div className="flex">
                <input
                  value={verificationUrl}
                  readOnly
                  className="flex-1 border px-3 py-2 rounded-l-lg bg-gray-50"
                />
                <button
                  onClick={() => copyToClipboard(verificationUrl)}
                  className="bg-blue-600 text-white px-4 rounded-r-lg"
                >
                  <FontAwesomeIcon icon={faCopy} />
                </button>
              </div>
              {copied && (
                <p className="text-green-600 text-sm mt-2">
                  URL copiée
                </p>
              )}
            </div>
          </div>
        </div>

        {/* QR MODAL */}
        {showQR && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl text-center">
              <QRCodeSVG value={verificationUrl} size={280} />
              <button
                onClick={() => setShowQR(false)}
                className="mt-4 px-6 py-2 bg-gray-200 rounded-lg"
              >
                Fermer
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 text-center text-gray-500 text-sm">
          © {new Date().getFullYear()} — Système de vérification des diplômes de L'ISS
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
          <button onClick={() => navigator.clipboard.writeText(value)}>
            <FontAwesomeIcon icon={faCopy} />
          </button>
        )}
      </div>
    </div>
  );
}

export default Verify;
