import { useEffect, useState } from "react";
import api from "../api/axios"; // your axios instance with auth
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
    } catch (err) {
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
      setFilieres(filieres.filter(f => f.id !== id));
    } catch (err) {
      alert("Erreur lors de la suppression");
    }
  };

  const totalPages = Math.ceil(filieres.length / pageSize);
  const displayedFilieres = filieres.slice((page - 1) * pageSize, page * pageSize);


  return (
    <MainLayout title={"Gestion filières"}>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Gestion des Filières</h1>
          <button
            onClick={() => { setEditingFiliere(null); setModalOpen(true); }}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <FontAwesomeIcon icon={faPlus} className="mr-2" /> Ajouter Filière
          </button>
        </div>

        {loading ? (
          <p>Chargement...</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : (
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <table className="min-w-full table-auto">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-gray-700">Code Filière</th>
                  <th className="px-6 py-3 text-left text-gray-700">Nom Filière (français)</th>
                  <th className="px-6 py-3 text-left text-gray-700">Nom Filière (Arabe)</th>
                  <th className="px-6 py-3 text-right text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayedFilieres.map(f => (
                  <tr key={f.id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4">{f.code_filiere}</td>
                    <td className="px-6 py-4">{f.nom_filiere_fr}</td>
                    <td className="px-6 py-4">{f.nom_filiere_ar}</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => { setEditingFiliere(f); setModalOpen(true); }}
                        className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                      <button
                        onClick={() => handleDelete(f.id)}
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </td>
                  </tr>
                ))}
                {filieres.length === 0 && (
                  <tr>
                    <td colSpan="3" className="px-6 py-4 text-center text-gray-500">
                      Aucune filière trouvée.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

          </div>
        )}

        {modalOpen && (
          <FiliereFormModal
            open={modalOpen}
            setOpen={setModalOpen}
            filiere={editingFiliere}
            refresh={fetchFilieres}
          />
        )}

        {/* Pagination + Page size */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex-1 flex justify-center">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={(p) => setPage(p)}
            />
          </div>

          <div className="ml-4">
            <select
              value={pageSize}
              onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
              className="p-2 border border-gray-300 rounded-lg shadow-sm"
            >
              {[3, 5, 7, 10].map(n => (
                <option key={n} value={n}>{n} / page</option>
              ))}
            </select>
          </div>
        </div>

      </div>
    </MainLayout>
  );
}
