import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faXmark,
  faEdit,
  faTrash,
  faFilePdf
} from "@fortawesome/free-solid-svg-icons";
import api from "../api/axios";
import Alert from "./Alert";

export default function EtudiantDetailsModal({
  open,
  onClose,
  etudiant, 
  filieres,
  diplomes,
  onEdit,
  refresh
}) {
  if (!open || !etudiant) return null;

  const filiere = filieres.find(f => f.id === etudiant.filiere);
  const initials = `${etudiant.nom_prenom_fr[0]} ${etudiant.nom_prenom_ar[0]} `.toUpperCase();

  /* ===================== ACTIONS ===================== */

  const generateDiplome = async () => {
    try {
      await api.post(`diplomes/generate/${etudiant.id}/`);
      alert("diplôme genéré avec succès.")
      refresh();
      
    } catch (err) {
      alert(err.response?.data?.error || "Erreur génération diplôme");
    }
  };

  const deleteEtudiant = async () => {
    if (!window.confirm("Supprimer cet étudiant ?")) return;

    await api.delete(`etudiants/${etudiant.id}/`);
    refresh();
    onClose();
  };

  const downloadDiplome = async (d) => {
    try {
      const res = await api.get(
        `diplomes/download/${d.verification_uuid}/`,
        { responseType: "blob" }
      );

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.download = `diplome_${d.verification_uuid}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      alert("Téléchargement impossible");
    }
  };

  /* ===================== UI ===================== */

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-xl p-6 relative">

        {/* Close */}
        <button onClick={onClose} className="absolute top-5 right-5 hover:text-red-500 hover:scale-110 transition-all duration-300 ease-in-out">
          <FontAwesomeIcon icon={faXmark} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <div className="h-12 w-12 rounded-full bg-gray-600 text-white flex items-center justify-center font-bold">
            {initials}
          </div>
          <div>
            <h2 className="text-xl font-semibold">
              {etudiant.nom_prenom_fr}
            </h2>
            <p className="text-sm text-gray-500">
              Matricule : {etudiant.matricule}
            </p>
          </div>
        </div>

        {/* Info */}
        <div className="text-sm space-y-2">
          <p><strong>Email :</strong> {etudiant.email || "—"}</p>
          <p><strong>Filière :</strong> {filiere?.code_filiere || "—"}</p>
          <p><strong>Date de naissance :</strong> {etudiant?.date_naissance || "—"}</p>
        </div>

        {/* Diplômes */}
        <div className="mt-4">
          <h3 className="font-semibold mb-2">Diplômes</h3>

          {diplomes.length === 0 ? (
            <p className="text-sm text-gray-500">Aucun diplôme</p>
          ) : (
            <div className="flex flex-wrap gap-3">
              {diplomes.map(d => (
                <button
                  key={d.id}
                  onClick={() => downloadDiplome(d)}
                  className="inline-flex items-center gap-2 text-blue-600 text-sm hover:underline"
                >
                  <FontAwesomeIcon icon={faFilePdf} />
                  {d.type_diplome} ({d.annee_obtention})
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-between mt-6">
          {diplomes.length === 0 ? (
            <button
              onClick={generateDiplome}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 hover:scale-y-110 transition-all duration-300 ease-in-out"
            >
              Générer diplôme
            </button>
          ) : (
            <button
              disabled
              className="px-4 py-2 bg-blue-300 text-white rounded hover:cursor-not-allowed"
            >
              Générer diplôme
            </button>
          )
          }

          <div className="flex gap-2">
            <button
              onClick={() => onEdit(etudiant)}
              className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 hover:scale-y-110 transition-all duration-300 ease-in-out"
              title="Modifier"
            >
              <FontAwesomeIcon icon={faEdit} />
            </button>

            <button
              onClick={deleteEtudiant}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 hover:scale-y-110 transition-all duration-300 ease-in-out"
              title="Supprimer"
            >
              <FontAwesomeIcon icon={faTrash} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
