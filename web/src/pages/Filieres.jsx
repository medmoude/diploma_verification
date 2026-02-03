import { useEffect, useState } from "react";
import api from "../api/axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import FiliereFormModal from "../components/FiliereFormModal";
import MainLayout from "../components/Layout/MainLayout";
import Pagination from "../components/Pagination";

export default function Filieres() {
  const [filieres, setFilieres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingFiliere, setEditingFiliere] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const fetchFilieres = async () => {
    try {
      const res = await api.get("filieres/");
      setFilieres(res.data);
    } catch {
      setError("Impossible de charger les filières");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFilieres();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Voulez-vous vraiment supprimer cette filière ?")) return;
    try {
      await api.delete(`filieres/${id}/`);
      setFilieres(filieres.filter((f) => f.id !== id));
    } catch {
      alert("Erreur lors de la suppression");
    }
  };

  const totalPages = Math.ceil(filieres.length / pageSize);
  const displayedFilieres = filieres.slice((page - 1) * pageSize, page * pageSize);

  return (
    <MainLayout title="Gestion filières">
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">Gestion des Filières</h1>
            <p className="text-sm text-gray-500">Liste et gestion des filières disponibles</p>
          </div>
          <button
            onClick={() => {
              setEditingFiliere(null);
              setModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white shadow-sm hover:bg-blue-700 hover:scale-y-110 transition-all duration-300 ease-in-out"
          >
            <FontAwesomeIcon icon={faPlus} />
            Ajouter Filière
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="bg-white rounded-lg shadow-sm p-6 text-center text-gray-500">
            Chargement...
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg">{error}</div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left font-medium text-gray-600">Code</th>
                  <th className="px-6 py-3 text-left font-medium text-gray-600">Nom (FR)</th>
                  <th className="px-6 py-3 text-center font-medium text-gray-600">Nom (AR)</th>
                  <th className="px-6 py-3 text-right font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {displayedFilieres.map((f) => (
                  <tr key={f.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-700">{f.code_filiere}</td>
                    <td className="px-6 py-4 text-gray-700">{f.nom_filiere_fr}</td>
                    <td className="px-6 py-4 text-gray-700" dir="rtl">{f.nom_filiere_ar}</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => {
                          setEditingFiliere(f);
                          setModalOpen(true);
                        }}
                        className="px-3 py-1.5 rounded-md bg-yellow-500 text-white hover:bg-yellow-600 "
                        title="Modifier"
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                      <button
                        onClick={() => handleDelete(f.id)}
                        className="px-3 py-1.5 rounded-md bg-red-500 text-white hover:bg-red-600 transition"
                        title="Supprimer"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </td>
                  </tr>
                ))}

                {filieres.length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                      Aucune filière trouvée
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-4">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={(p) => setPage(p)}
          />

          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
            className="p-2 border border-gray-300 rounded-lg text-sm"
          >
            {[3, 5, 7, 10].map((n) => (
              <option key={n} value={n}>
                {n} / page
              </option>
            ))}
          </select>
        </div>

        {modalOpen && (
          <FiliereFormModal
            open={modalOpen}
            setOpen={setModalOpen}
            filiere={editingFiliere}
            refresh={fetchFilieres}
          />
        )}
      </div>
    </MainLayout>
  );
}
