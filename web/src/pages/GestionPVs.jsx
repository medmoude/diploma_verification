import { useState, useEffect } from "react";
import api from "../api/axios";
import MainLayout from "../components/Layout/MainLayout";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCloudUploadAlt, faCheckCircle, faSpinner, faTrash } from "@fortawesome/free-solid-svg-icons";

export default function GestionPVs() {
  const [annees, setAnnees] = useState([]);
  const [filieres, setFilieres] = useState([]);
  const [pvs, setPvs] = useState([]);
  const [selectedAnnee, setSelectedAnnee] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [a, f, p] = await Promise.all([
        api.get("annee_universitaire/"), 
        api.get("filieres/"),
        api.get("pvs/") 
      ]);
      setAnnees(a.data);
      setFilieres(f.data);
      setPvs(p.data);
      if (a.data.length > 0 && !selectedAnnee) setSelectedAnnee(a.data[0].id);
    } catch (e) {
      console.error("Error loading data", e);
    }
  };

  const handleUpload = async (filiereId, file) => {
    if (!file || !selectedAnnee) return;
    setLoading(true);
    const formData = new FormData();
    formData.append("filiere", filiereId);
    formData.append("annee_universitaire", selectedAnnee);
    formData.append("image_pv", file);

    try {
      await api.post("pvs/", formData, { headers: { "Content-Type": "multipart/form-data" } });
      await loadData(); 
      alert("PV ajouté avec succès !");
    } catch (e) {
      alert("Erreur: " + (e.response?.data?.detail || "Upload échoué"));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (pvId) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce PV ?")) return;
    setLoading(true);
    try {
      await api.delete(`pvs/${pvId}/`);
      await loadData();
    } catch (e) {
      alert("Erreur lors de la suppression");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout title="Gestion des PVs du Jury">
      <div className="bg-white p-4 rounded shadow mb-6 flex items-center gap-4">
        <label className="font-bold text-gray-700">Sélectionner l'année universitaire :</label>
        <select 
          value={selectedAnnee} 
          onChange={e => setSelectedAnnee(e.target.value)}
          className="border p-2 rounded bg-gray-50 min-w-[200px]"
        >
          {annees.map(a => <option key={a.id} value={a.id}>{a.code_annee}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filieres.map(f => {
          const existingPV = pvs.find(p => p.filiere === f.id && p.annee_universitaire == selectedAnnee);
          
          return (
            <div key={f.id} className={`p-6 rounded-lg shadow-md border-l-4 transition-all ${existingPV ? "border-green-500 bg-white" : "border-red-400 bg-gray-50"}`}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg text-gray-800">{f.code_filiere}</h3>
                  <p className="text-sm text-gray-500">{f.nom_filiere}</p>
                </div>
                {existingPV && <FontAwesomeIcon icon={faCheckCircle} className="text-green-500 text-2xl" />}
              </div>

              {existingPV ? (
                <div className="mt-4 p-3 bg-green-50 rounded border border-green-100 flex flex-col items-center gap-2">
                  <span className="text-green-700 font-bold text-sm">PV Validé</span>
                  
                  <div className="flex gap-4 items-center w-full justify-center">
                    <a 
                      href={existingPV.image_pv} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="text-xs text-indigo-600 underline font-semibold hover:text-indigo-800"
                    >
                      Voir le document
                    </a>

                    <button 
                        onClick={() => handleDelete(existingPV.id)}
                        className="text-xs text-red-500 hover:text-red-700 border border-red-200 hover:bg-red-50 px-2 py-1 rounded transition-colors"
                        disabled={loading}
                    >
                       <FontAwesomeIcon icon={faTrash} className="mr-1"/> Supprimer
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-4 relative group cursor-pointer border-2 border-dashed border-gray-300 rounded-lg p-6 hover:bg-white hover:border-indigo-400 transition text-center">
                    {loading ? (
                      <FontAwesomeIcon icon={faSpinner} spin className="text-gray-400" />
                    ) : (
                      <>
                       <FontAwesomeIcon icon={faCloudUploadAlt} className="text-gray-400 text-3xl mb-2 group-hover:text-indigo-500" />
                       <p className="text-xs text-gray-500 group-hover:text-indigo-600 font-medium">Glisser le PV ici</p>
                       <input 
                         type="file" 
                         className="absolute inset-0 opacity-0 cursor-pointer"
                         onChange={(e) => handleUpload(f.id, e.target.files[0])}
                         accept="image/*,application/pdf"
                       />
                      </>
                    )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </MainLayout>
  );
}