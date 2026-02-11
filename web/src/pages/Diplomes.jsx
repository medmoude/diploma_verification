import { useState, useEffect } from "react";
import api from "../api/axios";
import MainLayout from "../components/Layout/MainLayout";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { DOMAIN } from "../api/axios";
import {
  faEye,
  faDownload,
  faQrcode,
  faPlus,
  faBan,
  faInfoCircle
} from "@fortawesome/free-solid-svg-icons";
import Pagination from "../components/Pagination";
import AnnulerDiplomeModal from "../components/AnnulerDiplomeModal";
import DiplomeDetailsModal from "../components/DiplomeDetailsModal";

function Diplomes() {
  /* ===================== STATE ===================== */
  const [user, setUser] = useState(null); // User state for permissions

  const [diplomes, setDiplomes] = useState([]);
  const [etudiants, setEtudiants] = useState([]);
  const [filieres, setFilieres] = useState([]);
  const [annees, setAnnees] = useState([]);
  const [selectedDiplome, setSelectedDiplome] = useState(null);
  const [annulerOpen, setAnnulerOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsData, setDetailsData] = useState(null);

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

  /* ===================== FETCH ===================== */
  useEffect(() => {
    const fetchAll = async () => {
      try {
        // Fetch User Profile + Data
        const userRes = await api.get("profile/");
        setUser(userRes.data);

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

  // PERMISSION CHECK
  const isAdmin = user?.is_superuser;

  /* ===================== ACTIONS ===================== */
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
      // 1. Capture the response
      const res = await api.post("diplomes/generate-by-filiere/", {
        filiere_id: selectedFiliere,
        annee_universitaire_id: selectedAnnee,
      });

      await refreshDiplomes();
      setShowBulkGenerateModal(false);
      
      // 2. Check counts to give a meaningful alert
      const { generes, ignores } = res.data;
      
      if (generes === 0) {
         alert(`Attention: 0 diplôme généré (${ignores} échoués). Vérifiez si le PV du Jury est importé pr la scolarité.`);
      } else {
         alert(`Succès: ${generes} diplômes générés (${ignores} ignorés).`);
      }
      
      setSelectedFiliere("");
      setSelectedAnnee("");

    } catch (err) {
      alert(err.response?.data?.error || "Erreur génération en masse");
    }
  };

  /* ===================== FILTER & PAGINATION ===================== */
  const filteredDiplomes = diplomes
    .filter(d => {
      if (!search) return true;
      const etu = etudiants.find(e => e.id === d.etudiant);
      if (!etu) return false;

      const fullName = etu.nom_prenom_fr.toLowerCase();
      const matricule = String(etu.matricule || "");

      return (
        fullName.includes(search.toLowerCase()) ||
        matricule.includes(search)
      );
    })
    .filter(d => !selectedType || d.type_diplome === selectedType)
    .filter(d => {
      if (!selectedAnnee) return true;
      const etu = etudiants.find(e => e.id === d.etudiant);
      return etu ? etu.annee_universitaire === Number(selectedAnnee) : false;
    })
    .filter(d => {
      if (!selectedFiliere) return true;
      const etu = etudiants.find(e => e.id === d.etudiant);
      return etu ? etu.filiere === Number(selectedFiliere) : false;
    });

  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(filteredDiplomes.length / pageSize));
    if (page > maxPage) setPage(1);
  }, [filteredDiplomes.length, pageSize]);

  const totalPages = Math.ceil(filteredDiplomes.length / pageSize);
  const displayedDiplomes = filteredDiplomes.slice((page - 1) * pageSize, page * pageSize);

  /* ===================== RENDER ===================== */
  if (loading || !user) return <div className="p-10 text-center">Chargement...</div>;

  return (
    <MainLayout title="Gestion des Diplômes">
      <div className="space-y-6">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-800">Diplômes</h1>
          
          {/* ACTION BUTTONS - ADMIN ONLY */}
          {isAdmin && (
            <div className="flex gap-3">
              <button 
                onClick={() => setShowGenerateModal(true)} 
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 hover:scale-y-110 transition-all duration-300 ease-in-out"
              >
                <FontAwesomeIcon icon={faPlus} className="mr-2" /> 
                Générer (1 étudiant)
              </button>
              <button 
                onClick={() => setShowBulkGenerateModal(true)} 
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 hover:scale-y-110 transition-all duration-300 ease-in-out"
              >
                <FontAwesomeIcon icon={faQrcode} className="mr-2" /> 
                Générer par filière
              </button>
            </div>
          )}
        </div>

        {/* SEARCH + FILTERS */}
        <div className="flex flex-wrap gap-3 mb-3">
          <input
            type="text"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Rechercher un étudiant..."
            className="border border-gray-300 px-3 py-2 rounded-lg shadow-sm flex-1 focus:ring-2 focus:ring-blue-400 outline-none"
          />

          <select
            value={selectedType}
            onChange={e => { setSelectedType(e.target.value); setPage(1); }}
            className="border border-gray-300 px-3 py-2 rounded-lg shadow-sm"
          >
            <option value="">Tous types</option>
            {[...new Set(diplomes.map(d => d.type_diplome))].map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          <select
            value={selectedAnnee}
            onChange={e => { setSelectedAnnee(e.target.value); setPage(1); }}
            className="border border-gray-300 px-3 py-2 rounded-lg shadow-sm"
          >
            <option value="">Toutes années</option>
            {annees.map(a => (
              <option key={a.id} value={a.id}>
                {a.code_annee}
              </option>
            ))}
          </select>

          <select
            value={selectedFiliere}
            onChange={e => { setSelectedFiliere(e.target.value); setPage(1); }}
            className="border border-gray-300 px-3 py-2 rounded-lg shadow-sm"
          >
            <option value="">Toutes filières</option>
            {filieres.map(f => (
              <option key={f.id} value={f.id}>{f.code_filiere}</option>
            ))}
          </select>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Étudiant</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Filière</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Type</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Année</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {displayedDiplomes.length === 0 ? (
                <tr><td colSpan="5" className="p-4 text-center text-gray-500">Aucun diplôme trouvé</td></tr>
              ) : (
                displayedDiplomes.map(d => {
                  const etu = etudiants.find(e => e.id === d.etudiant);
                  return (
                    <tr key={d.id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">{etu ? etu.nom_prenom_fr : "Inconnu"}</div>
                        {etu && <div className="text-xs text-gray-500">Mat: {etu.matricule}</div>}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {etu ? filieres.find(f => f.id === etu.filiere)?.code_filiere || "—" : "Inconnu"}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{d.type_diplome}</td>
                      <td className="px-4 py-3 text-gray-600">
                        {annees.find(a => a.id === etu?.annee_universitaire)?.code_annee || "—"}
                      </td>
                      <td className="px-4 py-3 flex items-center gap-2">
                        
                        {/* Download - Everyone */}
                        <button 
                          onClick={() => handleDownload(d.verification_uuid)} 
                          className="p-2 text-blue-600 hover:text-blue-800 hover:scale-110 transition-all duration-300"
                          title="Télécharger PDF"
                        >
                          <FontAwesomeIcon icon={faDownload} />
                        </button>

                        {/* Verify - Everyone */}
                        <button
                          onClick={() => window.open(`${DOMAIN}/verify/${d.verification_uuid}/`, "_blank")}
                          className="p-2 text-green-600 hover:text-green-800 hover:scale-110 transition-all duration-300"
                          title="Vérifier en ligne"
                        >
                          <FontAwesomeIcon icon={faEye} />
                        </button>

                        {/* Cancel/Ban - ADMIN ONLY */}
                        {isAdmin && (
                          <button
                            onClick={async () => {
                              setSelectedDiplome(d);
                              if (d.est_annule) {
                                if (window.confirm("Voulez-vous réactiver ce diplôme ?")) {
                                  try {
                                    await api.post(`diplomes-annulation/${d.id}/unannuler/`);
                                    await refreshDiplomes();
                                    alert("Diplôme réactivé avec succès");
                                  } catch {
                                    alert("Erreur lors de la réactivation");
                                  }
                                }
                              } else {
                                if (window.confirm("Voulez-vous annuler ce diplôme ?")) {
                                  setAnnulerOpen(true);
                                }
                              }
                            }}
                            className={`p-2 hover:scale-110 transition-all duration-300 ${
                              d.est_annule ? "text-red-600 hover:text-red-800" : "text-orange-500 hover:text-orange-700"
                            }`}
                            title={d.est_annule ? "Réactiver le diplôme" : "Annuler le diplôme"}
                          >
                            <FontAwesomeIcon icon={faBan} />
                          </button>
                        )}

                        {/* Details - Everyone */}
                        <button
                          onClick={() => {
                            const filiereObj = filieres.find(f => f.id === etu?.filiere);
                            setDetailsData({
                              studentName: etu?.nom_prenom_fr,
                              matricule: etu?.matricule,
                              filiere: filiereObj ? filiereObj.code_filiere : "N/A",
                              anneeObtention: d.annee_obtention,
                              est_annule: d.est_annule,
                              annule_a: d.annule_a,
                              raison_annulation: d.raison_annulation
                            });
                            setDetailsOpen(true);
                          }}
                          className="p-2 text-indigo-500 hover:text-indigo-700 hover:scale-110 transition-all duration-300"
                          title="Détails"
                        >
                          <FontAwesomeIcon icon={faInfoCircle} />
                        </button>

                        <span
                          className={`ml-2 px-2 py-1 rounded-full text-xs font-semibold border ${
                            d.est_annule
                              ? "bg-red-50 text-red-700 border-red-200"
                              : "bg-green-50 text-green-700 border-green-200"
                          }`}
                        >
                          {d.est_annule ? "Annulé" : "Valide"}
                        </span>

                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="flex flex-col sm:flex-row items-center justify-between mt-4 gap-4">
          <div className="flex-1 flex justify-center sm:justify-start">
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={p => setPage(p)} />
          </div>
          <div className="w-full sm:w-auto">
            <select 
              value={pageSize} 
              onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }} 
              className="w-full p-2 border border-gray-300 rounded-lg shadow-sm"
            >
              {[3, 5, 7, 10].map(n => <option key={n} value={n}>{n} / page</option>)}
            </select>
          </div>
        </div>

        {/* MODALS - ADMIN ONLY */}
        {isAdmin && (
          <>
            {showGenerateModal && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-xl">
                  <h3 className="text-lg font-bold mb-4 text-gray-800">Générer un diplôme</h3>

                  <select
                    value={selectedEtudiant}
                    onChange={e => setSelectedEtudiant(e.target.value)}
                    className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
                  >
                    <option value="">Choisir un étudiant</option>
                    {etudiants.map(e => (
                      <option key={e.id} value={e.id}>
                        {e.nom_prenom_fr} (Mat {e.matricule})
                      </option>
                    ))}
                  </select>

                  <div className="flex justify-end gap-3 mt-6">
                    <button 
                      onClick={() => setShowGenerateModal(false)}
                      className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 hover:scale-105 transition-all"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={handleGenerate}
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 hover:scale-105 transition-all"
                    >
                      Générer
                    </button>
                  </div>
                </div>
              </div>
            )}

            {showBulkGenerateModal && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-xl">
                  <h3 className="text-lg font-bold mb-4 text-gray-800">Générer par filière</h3>

                  <select
                    value={selectedFiliere}
                    onChange={e => setSelectedFiliere(e.target.value)}
                    className="w-full border border-gray-300 px-3 py-2 mb-3 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
                  >
                    <option value="">Choisir une filière</option>
                    {filieres.map(f => (
                      <option key={f.id} value={f.id}>{f.code_filiere}</option>
                    ))}
                  </select>

                  <select
                    value={selectedAnnee}
                    onChange={e => setSelectedAnnee(e.target.value)}
                    className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
                  >
                    <option value="">Choisir une année universitaire</option>
                    {annees.map(a => (
                      <option key={a.id} value={a.id}>{a.code_annee}</option>
                    ))}
                  </select>

                  <div className="flex justify-end gap-3 mt-6">
                    <button 
                      onClick={() => setShowBulkGenerateModal(false)}
                      className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 hover:scale-105 transition-all"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={handleGenerateByFiliere}
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 hover:scale-105 transition-all"
                    >
                      Générer
                    </button>
                  </div>
                </div>
              </div>
            )}

            <AnnulerDiplomeModal
              open={annulerOpen}
              diplome={selectedDiplome}
              onClose={() => setAnnulerOpen(false)}
              onSuccess={refreshDiplomes}
            />
          </>
        )}

        <DiplomeDetailsModal
          open={detailsOpen}
          onClose={() => setDetailsOpen(false)}
          data={detailsData}
        />

      </div>
    </MainLayout>
  );
}

export default Diplomes;