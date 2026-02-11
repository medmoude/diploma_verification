import { useEffect, useState } from "react";
import api from "../api/axios";
import MainLayout from "../components/Layout/MainLayout";
import EtudiantFormModal from "../components/EtudiantFormModal";
import EtudiantDetailsModal from "../components/EtudiantDetailsModal";
import Alert from "../components/Alert";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrash,
  faEdit,
  faPlus,
  faFileExcel,
  faEye,
  faDownload
} from "@fortawesome/free-solid-svg-icons";
import Pagination from "../components/Pagination";

export default function Etudiants() {
  /* ===================== STATE ===================== */
  // User State
  const [user, setUser] = useState(null);

  const [useDefaultEmail, setUseDefaultEmail] = useState(true);
  const [emailDomain, setEmailDomain] = useState("@isms.esp.mr");
  const [importOpen, setImportOpen] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importFiliere, setImportFiliere] = useState("");
  const [importAnnee, setImportAnnee] = useState("");

  const [alert, setAlert] = useState(null);
  const [etudiants, setEtudiants] = useState([]);
  const [filieres, setFilieres] = useState([]);
  const [diplomes, setDiplomes] = useState([]);
  const [annees, setAnnees] = useState([]);

  const [search, setSearch] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingEtudiant, setEditingEtudiant] = useState(null);

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedEtudiant, setSelectedEtudiant] = useState(null);

  const [selectedFiliere, setSelectedFiliere] = useState("");
  const [selectedAnnee, setSelectedAnnee] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  /* ===================== FETCH ===================== */
  const fetchData = async () => {
    try {
      // Fetch User Profile to know permissions
      const userRes = await api.get("profile/");
      setUser(userRes.data);

      const [eRes, fRes, dRes, aRes] = await Promise.all([
        api.get("etudiants/"),
        api.get("filieres/"),
        api.get("diplomes/"),
        api.get("annee_universitaire/")
      ]);

      setEtudiants(eRes.data);
      setFilieres(fRes.data);
      setDiplomes(dRes.data);
      setAnnees(aRes.data);
    } catch (err) {
      console.error("Error fetching data", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // PERMISSION CHECK
  const isAdmin = user?.is_superuser;

  /* ===================== ACTIONS ===================== */
  const deleteEtudiant = async (id) => {
    if (!window.confirm("Supprimer cet étudiant ?")) return;
    await api.delete(`etudiants/${id}/`);
    setAlert({
      type: "success",
      message: "L'étudiant est supprimé avec succès"
    });
    fetchData(); // Refresh list
  };

  const openAdd = () => {
    setEditingEtudiant(null);
    setModalOpen(true);
  };

  const openEdit = (e) => {
    setEditingEtudiant(e);
    setModalOpen(true);
  };

  const voirEtudiant = (e) => {
    setSelectedEtudiant(e);
    setDetailsOpen(true);
  };

  const resetImportModal = () => {
    setImportFile(null);
    setImportFiliere("");
    setImportAnnee("");
    setUseDefaultEmail(true);
    setEmailDomain("@isms.esp.mr");
  };

  const handleExcelImport = async () => {
    if (!importFile || !importFiliere || !importAnnee) {
      setAlert({ type: "warning", message: "Tous les champs sont requis" });
      return;
    }

    const formData = new FormData();
    formData.append("file", importFile);
    formData.append("filiere", importFiliere);
    formData.append("annee_universitaire", importAnnee);
    formData.append("email_domain", useDefaultEmail ? "@isms.esp.mr" : emailDomain);

    try {
      const res = await api.post("etudiants/import_excel/", formData);
      const { created, skipped_count, skipped } = res.data;

      let msg = `Terminé ✅\nAjoutés : ${created} `;
      if (skipped_count > 0) {
        const matricules = skipped.map(s => s.matricule).join(", ");
        msg += `\nIgnorés (${skipped_count}) : ${matricules}`;
      }

      setAlert({
        type: skipped_count > 0 ? "warning" : "success",
        message: msg
      });

      resetImportModal();
      setImportOpen(false);
      fetchData(); // Refresh
    } catch (err) {
      setAlert({
        type: "error",
        message: "Erreur lors de l'import Excel"
      });
    }
  };

  const downloadTemplate = async () => {
    try {
      const response = await api.get(
        "etudiants/download_excel_template/",
        { responseType: "blob" }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "etudiants_template.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setAlert({ type: "error", message: "Erreur téléchargement du modèle Excel" });
    }
  };

  /* ===================== FILTER & PAGINATION ===================== */
  const filteredEtudiants = etudiants
    .filter(e =>
      `${e.nom_prenom_fr}`.toLowerCase().includes(search.toLowerCase())
    )
    .filter(e => !selectedFiliere || e.filiere === Number(selectedFiliere))
    .filter(e => !selectedAnnee || e.annee_universitaire === Number(selectedAnnee));

  const totalPages = Math.ceil(filteredEtudiants.length / pageSize);
  const displayedEtudiants = filteredEtudiants.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  /* ===================== TABLE HEADERS LOGIC ===================== */
  // Start with common headers
  const tableHeaders = ["Matricule", "Nom & prénom", "Filière", "Année", "Voir"];
  // Add Admin-only headers
  if (isAdmin) {
    tableHeaders.push("Modifier", "Supprimer");
  }

  /* ===================== RENDER ===================== */
  if (!user) return <div className="p-10 text-center">Chargement...</div>;

  return (
    <MainLayout title="Gestion des étudiants">

      {alert && (
        <Alert
          type={alert.type}
          onClose={() => setAlert(null)}
        >
          {alert.message}
        </Alert>
      )}

      <div className="max-w-7xl mx-auto px-4">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 space-y-4 md:space-y-0">
          <h2 className="text-3xl font-bold text-gray-800">Étudiants</h2>

          {/* ONLY ADMIN SEES THESE BUTTONS */}
          {isAdmin && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={downloadTemplate}
                className="p-3 bg-emerald-500 text-white rounded-full shadow-md hover:bg-emerald-600 hover:-translate-y-1 transition-all"
                title="Télécharger modèle Excel"
              >
                <FontAwesomeIcon icon={faDownload} />
              </button>

              <button
                onClick={() => setImportOpen(true)}
                className="p-3 bg-green-500 text-white rounded-full shadow-md hover:bg-green-600 hover:-translate-y-1 transition-all"
                title="Importer Excel"
              >
                <FontAwesomeIcon icon={faFileExcel} />
              </button>

              <button
                onClick={openAdd}
                className="p-3 bg-blue-500 text-white rounded-full shadow-md hover:bg-blue-600 hover:-translate-y-1 transition-all"
                title="Ajouter étudiant"
              >
                <FontAwesomeIcon icon={faPlus} />
              </button>
            </div>
          )}
        </div>

        {/* SEARCH & FILTERS (Visible to Everyone) */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-2">
          <input
            className="flex-1 p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
            placeholder="Rechercher un étudiant..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <div className="flex flex-wrap gap-2">
            <select
              className="p-2 border border-gray-300 rounded-lg shadow-sm"
              value={selectedFiliere}
              onChange={(e) => setSelectedFiliere(e.target.value)}
            >
              <option value="">Toutes filières</option>
              {filieres.map(f => (
                <option key={f.id} value={f.id}>{f.code_filiere}</option>
              ))}
            </select>

            <select
              className="p-2 border border-gray-300 rounded-lg shadow-sm"
              value={selectedAnnee}
              onChange={(e) => setSelectedAnnee(e.target.value)}
            >
              <option value="">Toutes années</option>
              {annees.map(a => (
                <option key={a.id} value={a.id}>{a.code_annee}</option>
              ))}
            </select>

            <select
              className="p-2 border border-gray-300 rounded-lg shadow-sm"
              value={pageSize}
              onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
            >
              {[3, 5, 7, 10].map(n => (
                <option key={n} value={n}>{n} / page</option>
              ))}
            </select>
          </div>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto bg-white rounded-lg shadow-md p-4">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {tableHeaders.map((th, i) => (
                  <th
                    key={i}
                    className="px-4 py-2 text-left text-sm font-semibold text-gray-700"
                  >
                    {th}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {displayedEtudiants.map(e => (
                <tr key={e.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-2">{e.matricule}</td>
                  <td className="px-4 py-2">{e.nom_prenom_fr}</td>
                  <td className="px-4 py-2">
                    {filieres.find(f => f.id === e.filiere)?.code_filiere || "—"}
                  </td>
                  <td className="px-4 py-2">
                    {annees.find(a => a.id === e.annee_universitaire)?.code_annee || "—"}
                  </td>

                  {/* ACTION: SEE (Everyone) */}
                  <td className="px-4 py-2">
                    <button
                      onClick={() => voirEtudiant(e)}
                      className="text-blue-500 hover:text-blue-700 hover:-translate-y-1 transition-all"
                      title="Voir détails"
                    >
                      <FontAwesomeIcon icon={faEye} />
                    </button>
                  </td>

                  {/* ACTIONS: EDIT & DELETE (Admin Only) */}
                  {isAdmin && (
                    <>
                      <td className="px-4 py-2">
                        <button
                          onClick={() => openEdit(e)}
                          className="text-yellow-500 hover:text-yellow-700 hover:-translate-y-1 transition-all"
                          title="Modifier"
                        >
                          <FontAwesomeIcon icon={faEdit} />
                        </button>
                      </td>

                      <td className="px-4 py-2">
                        <button
                          onClick={() => deleteEtudiant(e.id)}
                          className="text-red-500 hover:text-red-700 hover:-translate-y-1 transition-all"
                          title="Supprimer"
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
              {displayedEtudiants.length === 0 && (
                <tr>
                  <td colSpan={isAdmin ? 7 : 5} className="text-center py-4 text-gray-400">
                    Aucun étudiant trouvé
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* PAGINATION */}
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={(p) => setPage(p)}
          />
        </div>
      </div>

      {/* MODALS */}
      {/* Only render these modals if user is Admin, to be safe */}
      {isAdmin && (
        <EtudiantFormModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          etudiant={editingEtudiant}
          refresh={fetchData}
        />
      )}

      {/* Details modal is for everyone */}
      <EtudiantDetailsModal
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        etudiant={selectedEtudiant}
        filieres={filieres}
        diplomes={diplomes.filter(d => d.etudiant === selectedEtudiant?.id)}
        // Only allow switching to edit mode if Admin
        onEdit={isAdmin ? (e) => {
          setDetailsOpen(false);
          setEditingEtudiant(e);
          setModalOpen(true);
        } : null}
        refresh={fetchData}
      />

      {isAdmin && importOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">Importer étudiants</h3>

            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={e => setImportFile(e.target.files[0])}
              className="mb-2"
            />
            {importFile && (
              <p className="text-sm text-gray-600 mb-4">
                <div className="bg-green-500 text-white rounded inline-block p-1 mr-2">
                  <FontAwesomeIcon icon={faFileExcel} />
                </div>
                <span className="font-bold">{importFile.name}</span>
              </p>
            )}

            <select
              className="w-full p-2 border rounded mb-3"
              value={importFiliere}
              onChange={e => setImportFiliere(e.target.value)}
            >
              <option value="">Sélectionner une filière</option>
              {filieres.map(f => (
                <option key={f.id} value={f.id}>{f.code_filiere}</option>
              ))}
            </select>

            <select
              className="w-full p-2 border rounded mb-4"
              value={importAnnee}
              onChange={e => setImportAnnee(e.target.value)}
            >
              <option value="">Sélectionner une année</option>
              {annees.map(a => (
                <option key={a.id} value={a.id}>{a.code_annee}</option>
              ))}
            </select>

            <div className="mb-4">
              <label className="flex items-center gap-2 mb-2">
                <input
                  type="checkbox"
                  checked={useDefaultEmail}
                  onChange={e => setUseDefaultEmail(e.target.checked)}
                />
                Utiliser l'email ISMS – tous étudiants. (@isms.esp.mr)
              </label>

              {!useDefaultEmail && (
                <input
                  type="text"
                  className="w-full p-2 border rounded"
                  placeholder="@ise.esp.mr"
                  value={emailDomain}
                  onChange={e => setEmailDomain(e.target.value)}
                />
              )}
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  resetImportModal();
                  setImportOpen(false);
                }}
                className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300 transition"
              >
                Annuler
              </button>
              <button
                onClick={handleExcelImport}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
              >
                Importer
              </button>
            </div>
          </div>
        </div>
      )}

    </MainLayout>
  );
}