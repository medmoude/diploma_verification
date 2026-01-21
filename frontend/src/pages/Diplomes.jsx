import { useState, useEffect } from "react";
import api from "../api/axios";
import MainLayout from "../components/Layout/MainLayout";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faDownload,
  faQrcode,
  faPlus,
  faTrash
} from "@fortawesome/free-solid-svg-icons";
import Pagination from "../components/Pagination";

function Diplomes() {
  const [diplomes, setDiplomes] = useState([]);
  const [etudiants, setEtudiants] = useState([]);
  const [filieres, setFilieres] = useState([]);
  const [annees, setAnnees] = useState([]);

  const [selectedEtudiant, setSelectedEtudiant] = useState("");
  const [selectedFiliere, setSelectedFiliere] = useState("");
  const [selectedAnnee, setSelectedAnnee] = useState("");
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("");

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const [loading, setLoading] = useState(true);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showBulkGenerateModal, setShowBulkGenerateModal] = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [dRes, eRes, fRes, aRes] = await Promise.all([
          api.get("diplomes/"),
          api.get("etudiants/"),
          api.get("filieres/"),
          api.get("annee_universitaire/"),
        ]);
        setDiplomes(dRes.data);
        setEtudiants(eRes.data);
        setFilieres(fRes.data);
        setAnnees(aRes.data);
      } catch (err) {
        console.error("Erreur chargement données", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const refreshDiplomes = async () => {
    const res = await api.get("diplomes/");
    setDiplomes(res.data);
  };

  const handleDownload = async (uuid) => {
    try {
      const res = await api.get(`diplomes/download/${uuid}/`, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `diplome_${uuid}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      alert("Erreur lors du téléchargement");
    }
  };

  const handleGenerate = async () => {
    if (!selectedEtudiant) { alert("Veuillez sélectionner un étudiant"); return; }
    try {
      await api.post(`diplomes/generate/${selectedEtudiant}/`);
      await refreshDiplomes();
      setShowGenerateModal(false);
      setSelectedEtudiant("");
      alert("Diplôme généré avec succès");
    } catch (err) {
      alert(err.response?.data?.error || "Erreur génération diplôme");
    }
  };

  const handleGenerateByFiliere = async () => {
    if (!selectedFiliere || !selectedAnnee) { alert("Sélectionnez une filière et une année"); return; }
    try {
      await api.post("diplomes/generate-by-filiere/", {
        filiere_id: selectedFiliere,
        annee_universitaire_id: selectedAnnee,
      });
      await refreshDiplomes();
      setShowBulkGenerateModal(false);
      setSelectedFiliere("");
      setSelectedAnnee("");
      alert("Génération terminée");
    } catch (err) {
      alert(err.response?.data?.error || "Erreur génération en masse");
    }
  };

  // ================= FILTER + PAGINATION =================
  const filteredDiplomes = diplomes
    .filter(d => {
      if (!search) return true;
      const etu = etudiants.find(e => e.id === d.etudiant);
      if (!etu) return false;
      const fullName = `${etu.nom_prenom_fr}`.toLowerCase();
      const matricule = etu.matricule?.toLowerCase() || "";
      return fullName.includes(search.toLowerCase()) || matricule.includes(search.toLowerCase());
    })
    .filter(d => !selectedType || d.type_diplome === selectedType)
    .filter(d => !selectedAnnee || d.annee_obtention === selectedAnnee)
    .filter(d => {
      if (!selectedFiliere) return true;
      const etu = etudiants.find(e => e.id === d.etudiant);
      return etu ? etu.filiere === selectedFiliere : false;
    });

  const totalPages = Math.ceil(filteredDiplomes.length / pageSize);
  const displayedDiplomes = filteredDiplomes.slice((page - 1) * pageSize, page * pageSize);

  return (
    <MainLayout title="Gestion des Diplômes">
      <div className="space-y-6">

        {/* HEADER */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Diplômes</h1>
          <div className="flex gap-3">
            <button onClick={() => setShowGenerateModal(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg">
              <FontAwesomeIcon icon={faPlus} /> Générer (1 étudiant)
            </button>
            <button onClick={() => setShowBulkGenerateModal(true)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg">
              <FontAwesomeIcon icon={faQrcode} /> Générer par filière
            </button>
          </div>
        </div>

        {/* SEARCH + FILTERS */}
        <div className="flex flex-wrap gap-3 mb-3">
          <input
            type="text"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Rechercher un étudiant..."
            className="border px-3 py-2 rounded shadow-sm flex-1"
          />

          <select
            value={selectedType}
            onChange={e => { setSelectedType(e.target.value); setPage(1); }}
            className="border px-3 py-2 rounded"
          >
            <option value="">Tous types</option>
            {[...new Set(diplomes.map(d => d.type_diplome))].map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          <select
            value={selectedAnnee}
            onChange={e => { setSelectedAnnee(e.target.value); setPage(1); }}
            className="border px-3 py-2 rounded"
          >
            <option value="">Toutes années</option>
            {annees.map(a => (
              <option key={a.id} value={a.code_annee}>{a.code_annee}</option>
            ))}
          </select>

          {/* ================= FILIERE FILTER ================= */}
          <select
            value={selectedFiliere}
            onChange={e => { setSelectedFiliere(e.target.value); setPage(1); }}
            className="border px-3 py-2 rounded"
          >
            <option value="">Toutes filières</option>
            {filieres.map(f => (
              <option key={f.id} value={f.id}>{f.code_filiere}</option>
            ))}
          </select>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left">Étudiant</th>
                <th className="px-4 py-2 text-left">Filière</th>
                <th className="px-4 py-2 text-left">Type</th>
                <th className="px-4 py-2 text-left">Année</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" className="p-4 text-center">Chargement...</td></tr>
              ) : displayedDiplomes.length === 0 ? (
                <tr><td colSpan="5" className="p-4 text-center text-gray-500">Aucun diplôme</td></tr>
              ) : (
                displayedDiplomes.map(d => {
                  const etu = etudiants.find(e => e.id === d.etudiant);
                  return (
                    <tr key={d.id} className="border-t">
                      <td className="px-4 py-2">
                        {etu ? `${etu.nom_prenom_fr}` : "Inconnu"}
                        <br />
                        {etu && <span className="text-xs text-gray-500">Mat: {etu.matricule}</span>}
                      </td>
                      <td className="px-4 py-2">
                        {etu ? filieres.find(f => f.id === etu.filiere)?.code_filiere || "—" : "Inconnu"}
                      </td>
                      <td className="px-4 py-2">{d.type_diplome}</td>
                      <td className="px-4 py-2">{d.annee_obtention}</td>
                      <td className="px-4 py-2 flex gap-2">
                        <button onClick={() => handleDownload(d.verification_uuid)} className="text-blue-600">
                          <FontAwesomeIcon icon={faDownload} />
                        </button>
                        <a href={`http://localhost:3000/verify/${d.verification_uuid}/`} target="_blank" rel="noreferrer" className="text-green-600">
                          <FontAwesomeIcon icon={faEye} />
                        </a>
                        <button disabled title="Suppression non implémentée" className="text-gray-400 cursor-not-allowed">
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION + PAGE SIZE */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex-1 flex justify-center">
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={p => setPage(p)} />
          </div>
          <div className="ml-4">
            <select value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }} className="p-2 border border-gray-300 rounded-lg shadow-sm">
              {[3, 5, 7, 10].map(n => <option key={n} value={n}>{n} / page</option>)}
            </select>
          </div>
        </div>

        {/* MODALS */}
        {showGenerateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg w-full max-w-md">
              <h3 className="text-lg font-bold mb-4">Générer un diplôme</h3>

              <select
                value={selectedEtudiant}
                onChange={e => setSelectedEtudiant(e.target.value)}
                className="w-full border px-3 py-2 rounded"
              >
                <option value="">Choisir un étudiant</option>
                {etudiants.map(e => (
                  <option key={e.id} value={e.id}>
                    {e.nom_prenom_fr} (Mat {e.matricule})
                  </option>
                ))}
              </select>

              <div className="flex justify-end gap-3 mt-6">
                <button onClick={() => setShowGenerateModal(false)}>Annuler</button>
                <button
                  onClick={handleGenerate}
                  className="bg-blue-600 text-white px-4 py-2 rounded"
                >
                  Générer
                </button>
              </div>
            </div>
          </div>
        )}

        {showBulkGenerateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg w-full max-w-md">
              <h3 className="text-lg font-bold mb-4">Générer par filière</h3>

              <select
                value={selectedFiliere}
                onChange={e => setSelectedFiliere(e.target.value)}
                className="w-full border px-3 py-2 mb-3 rounded"
              >
                <option value="">Choisir une filière</option>
                {filieres.map(f => (
                  <option key={f.id} value={f.id}>{f.code_filiere}</option>
                ))}
              </select>

              <select
                value={selectedAnnee}
                onChange={e => setSelectedAnnee(e.target.value)}
                className="w-full border px-3 py-2 rounded"
              >
                <option value="">Choisir une année universitaire</option>
                {annees.map(a => (
                  <option key={a.id} value={a.id}>{a.code_annee}</option>
                ))}
              </select>

              <div className="flex justify-end gap-3 mt-6">
                <button onClick={() => setShowBulkGenerateModal(false)}>Annuler</button>
                <button
                  onClick={handleGenerateByFiliere}
                  className="bg-indigo-600 text-white px-4 py-2 rounded"
                >
                  Générer
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </MainLayout>
  );
}

export default Diplomes;
