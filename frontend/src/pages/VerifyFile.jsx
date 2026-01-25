import { useLocation, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleCheck,
  faUserGraduate,
  faCalendar,
  faBookOpen,
  faArrowUpRightFromSquare,
  faTriangleExclamation,
} from "@fortawesome/free-solid-svg-icons";

export default function VerifyFile() {
  const { state } = useLocation();
  const navigate = useNavigate();

  if (!state?.valid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-xl shadow text-center">
          <FontAwesomeIcon
            icon={faTriangleExclamation}
            className="text-red-600 text-4xl mb-4"
          />
          <h1 className="text-xl font-bold text-gray-800">
            Diplôme invalide ou modifié
          </h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-lg p-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <FontAwesomeIcon
            icon={faCircleCheck}
            className="text-green-600 text-3xl"
          />
          <h1 className="text-2xl font-bold text-gray-800">
            Diplôme valide
          </h1>
        </div>

        {/* Info */}
        <div className="space-y-4 text-gray-700">
          <InfoRow
            icon={faUserGraduate}
            label="Nom"
            value={state.nom}
          />

          <InfoRow
            icon={faBookOpen}
            label="Filière"
            value={state.filiere}
          />

          <InfoRow
            icon={faCalendar}
            label="Année"
            value={state.annee}
          />
        </div>

        {/* Action */}
        <button
          onClick={() => navigate(`/verify/${state.verification_uuid}`)}
          className="mt-8 w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition"
        >
          Voir la version officielle
          <FontAwesomeIcon icon={faArrowUpRightFromSquare} />
        </button>
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
      <FontAwesomeIcon icon={icon} className="text-blue-600" />
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="font-semibold">{value || "—"}</p>
      </div>
    </div>
  );
}
