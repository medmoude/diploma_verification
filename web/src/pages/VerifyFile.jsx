import { useLocation, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faShieldHalved,
  faUserGraduate,
  faCalendar,
  faBookOpen,
  faArrowUpRightFromSquare,
  faTriangleExclamation,
  faLock,
  faCircleCheck,
} from "@fortawesome/free-solid-svg-icons";

export default function VerifyFile() {
  const { state } = useLocation();
  const navigate = useNavigate();

  if (!state?.valid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-6">
            <FontAwesomeIcon
              icon={faTriangleExclamation}
              className="text-5xl text-red-600"
            />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Diplôme invalide
          </h1>
          <p className="text-gray-600">
            Le document a été modifié ou falsifié
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl p-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border-l-8 border-green-500 mb-8">
          <div className="flex items-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mr-6">
              <FontAwesomeIcon
                icon={faShieldHalved}
                className="text-4xl text-green-600"
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Diplôme valide
              </h1>
              <p className="text-gray-600 flex items-center gap-2">
                <FontAwesomeIcon icon={faLock} className="text-sm" />
                Document authentique et sécurisé
              </p>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="space-y-4 mb-8">
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
          className="w-full flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-lg font-semibold transition-colors shadow-lg"
        >
          <FontAwesomeIcon icon={faArrowUpRightFromSquare} />
          Voir la version officielle
        </button>
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <div className="border rounded-xl p-4">
      <div className="flex items-center mb-2 text-gray-500 text-sm">
        <FontAwesomeIcon icon={icon} className="mr-2" />
        {label}
      </div>
      <div className="flex justify-between items-center">
        <span className="font-semibold text-gray-800">{value || "—"}</span>
      </div>
    </div>
  );
}