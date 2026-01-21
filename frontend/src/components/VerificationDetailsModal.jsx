import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faXmark,
  faCircleCheck,
  faTriangleExclamation,
  faUserGraduate,
  faClock,
  faGlobe
} from "@fortawesome/free-solid-svg-icons";

export default function VerificationDetailsModal({ open, onClose, verification }) {
  if (!open || !verification) return null;

  const { statut, date_verification, adresse_ip, etudiant } = verification;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 relative">

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          <FontAwesomeIcon icon={faXmark} />
        </button>

        <h2 className="text-xl font-bold mb-4">Détails de la vérification</h2>

        {/* Verification info */}
        <div className="space-y-2 text-sm">
          <p className="flex items-center gap-2">
            <FontAwesomeIcon icon={faClock} />
            {new Date(date_verification).toLocaleString()}
          </p>
          <p className="flex items-center gap-2">
            <FontAwesomeIcon icon={faGlobe} />
            {adresse_ip || "IP inconnue"}
          </p>
          <p
            className={`flex items-center gap-2 font-semibold ${
              statut === "succes" ? "text-green-600" : "text-red-600"
            }`}
          >
            <FontAwesomeIcon
              icon={statut === "succes" ? faCircleCheck : faTriangleExclamation}
            />
            {statut}
          </p>
        </div>

        <hr className="my-4" />

        {/* Diplôme info */}
        <div>
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <FontAwesomeIcon icon={faUserGraduate} />
            Etudiant(e)
          </h3>

          {statut === "succes" && etudiant ? (
            <div className="text-sm space-y-1">
              <p><strong>Nom & prénom :</strong> {etudiant.nom_prenom_fr} </p>
              <p><strong>Matricule :</strong> {etudiant.matricule}</p>
              <p><strong>Filière :</strong> {etudiant.filiere}</p>
              <p><strong>Email :</strong> {etudiant.email}</p>
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic">
              Diplômé inconnu ou certificat invalide
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
