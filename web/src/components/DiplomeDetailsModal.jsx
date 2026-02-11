import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faCheckCircle, faBan } from "@fortawesome/free-solid-svg-icons";

export default function DiplomeDetailsModal({ open, onClose, data }) {
  if (!open || !data) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden animate-fade-in">
        
        {/* Header */}
        <div className="bg-gray-100 px-6 py-4 flex justify-between items-center border-b">
          <h3 className="text-xl font-bold text-gray-800">Détails du Diplôme</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-red-500 transition">
            <FontAwesomeIcon icon={faTimes} size="lg" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500 font-semibold">Étudiant</p>
              <p className="text-gray-800">{data.studentName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 font-semibold">Matricule</p>
              <p className="text-gray-800">{data.matricule}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 font-semibold">Filière</p>
              <p className="text-gray-800">{data.filiere}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 font-semibold">Année d'obtention</p>
              <p className="text-gray-800">{data.anneeObtention}</p>
            </div>
          </div>

          <hr />

          {/* Status Section */}
          <div>
            <p className="text-sm text-gray-500 font-semibold mb-2">Statut</p>
            {data.est_annule ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-red-700 font-bold mb-2">
                  <FontAwesomeIcon icon={faBan} />
                  <span>DIPLÔME ANNULÉ</span>
                </div>
                <p className="text-sm text-red-800"><span className="font-semibold">Date:</span> {new Date(data.annule_a).toLocaleDateString()}</p>
                <p className="text-sm text-red-800 mt-1"><span className="font-semibold">Raison:</span> {data.raison_annulation}</p>
              </div>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-2 text-green-700 font-bold">
                <FontAwesomeIcon icon={faCheckCircle} />
                <span>VALIDE</span>
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-3 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition">
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}