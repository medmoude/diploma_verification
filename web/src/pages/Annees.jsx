import { useState, useEffect } from "react";
import api from "../api/axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import AnneeFormModal from "../components/AnneeFormModal";
import MainLayout from "../components/Layout/MainLayout";
import Alert from "../components/Alert";
import Pagination from "../components/Pagination"; // <-- our custom pagination

export default function Annees() {
  const [annees, setAnnees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAnnee, setEditingAnnee] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  useEffect(() => {
    fetchAnnees();
  }, []);

  const fetchAnnees = async () => {
    try {
      const res = await api.get("/annee_universitaire/");
      setAnnees(res.data);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) {
        setMessage({ type: 'error', text: "Non autorisé. Redirection vers la page de connexion..." });
        setTimeout(() => window.location.href = "/login", 2000);
      } else {
        setMessage({ type: 'error', text: "Erreur lors du chargement des années universitaires" });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Voulez-vous vraiment supprimer cette année ?")) return;
    try {
      await api.delete(`/annee_universitaire/${id}/`);
      setAnnees(annees.filter(a => a.id !== id));
      setMessage({ type: 'success', text: "Année supprimée avec succès" });
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) {
        setMessage({ type: 'error', text: "Session expirée. Veuillez vous reconnecter." });
        setTimeout(() => window.location.href = "/login", 2000);
      } else if (err.response?.status === 403) {
        setMessage({ type: 'error', text: "Vous n'avez pas la permission de supprimer cette année" });
      } else if (err.response?.status === 409) {
        setMessage({ type: 'error', text: "Impossible de supprimer : cette année est utilisée par des diplômes" });
      } else {
        setMessage({ type: 'error', text: "Erreur lors de la suppression" });
      }
    }
  };

  const handleEdit = (annee) => {
    setEditingAnnee(annee);
    setModalOpen(true);
  };

  const handleAdd = () => {
    setEditingAnnee(null);
    setModalOpen(true);
  };

  const handleSave = (newAnnee) => {
    if (editingAnnee) {
      setAnnees(annees.map(a => (a.id === newAnnee.id ? newAnnee : a)));
      setMessage({ type: 'success', text: "Année modifiée avec succès" });
    } else {
      setAnnees([newAnnee, ...annees]);
      setMessage({ type: 'success', text: "Année ajoutée avec succès" });
    }
    setModalOpen(false);
  };

  // ------------------ PAGINATION LOGIC ------------------
  const totalPages = Math.ceil(annees.length / pageSize);
  const displayedAnnees = annees.slice((page - 1) * pageSize, page * pageSize);

  if (loading) return <p className="p-6">Chargement...</p>;

  return (
    <MainLayout>
      <div className="p-6 max-w-5xl mx-auto">
        
        {message.text && (
          <Alert type={message.type} onClose={() => setMessage({ type: '', text: '' })}>
            {message.text}
          </Alert>
        )}

        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Gestion des Années Universitaires</h1>
          <button
            onClick={handleAdd}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 hover:scale-y-110 transition-all duration-300 ease-in-out"
          >
            <FontAwesomeIcon icon={faPlus} className="mr-2" /> Ajouter
          </button>
        </div>

        {/* TABLE */}
        <div className="bg-white shadow rounded-xl overflow-hidden">
          <table className="min-w-full table-auto">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left">Code Année</th>
                <th className="px-4 py-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayedAnnees.map(a => (
                <tr key={a.id} className="border-b hover:bg-gray-50 transition">
                  <td className="px-4 py-2">{a.code_annee}</td>
                  <td className="px-4 py-2 flex justify-center space-x-2">
                    <button
                      onClick={() => handleEdit(a)}
                      className="px-3 py-1 bg-yellow-400 text-white rounded hover:bg-yellow-500 transition"
                      title="Modifier"
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button
                      onClick={() => handleDelete(a.id)}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
                      title="Supprimer"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </td>
                </tr>
              ))}
              {displayedAnnees.length === 0 && (
                <tr>
                  <td colSpan="2" className="text-center py-4 text-gray-500">
                    Aucune année universitaire trouvée.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION COMPONENT */}
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={(p) => setPage(p)}
        />

        {/* ITEMS PER PAGE */}
        <div className="flex justify-end mt-4">
          <select
            className="p-2 border rounded shadow-sm"
            value={pageSize}
            onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
          >
            {[3, 5, 7, 10].map(n => (
              <option key={n} value={n}>{n} / page</option>
            ))}
          </select>
        </div>

        {/* MODAL */}
        {modalOpen && (
          <AnneeFormModal
            onClose={() => setModalOpen(false)}
            onSave={handleSave}
            editingAnnee={editingAnnee}
          />
        )}
      </div>
    </MainLayout>
  );
}
