import { useState, useEffect } from "react";
import api from "../api/axios";

export default function FiliereFormModal({ open, setOpen, filiere, refresh }) {
  const [code, setCode] = useState("");
  const [nomFr, setNomFr] = useState("");
  const [nomAr, setNomAr] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (filiere) {
      setCode(filiere.code_filiere);
      setNomFr(filiere.nom_filiere_fr);
      setNomAr(filiere.nom_filiere_ar);
    } else {
      setCode("");
      setNomFr("");
      setNomAr("");
    }
  }, [filiere]);

  const handleArabicChange = (e) => {
    const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDCF\uFDF0-\uFDFF\uFE70-\uFEFF\s]/;
    const newValue = e.target.value.split('').filter(char => arabicRegex.test(char)).join('');
    setNomAr(newValue);
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (filiere) {
        await api.put(`filieres/${filiere.id}/`, { code_filiere: code, nom_filiere_fr: nomFr, nom_filiere_ar: nomAr });
      } else {
        await api.post("filieres/", { code_filiere: code, nom_filiere_fr: nomFr, nom_filiere_ar: nomAr });
      }
      refresh();
      setOpen(false);
    } catch (err) {
      alert("Erreur lors de l'enregistrement");
    } finally{
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-96">
        <h2 className="text-xl font-bold mb-4">{filiere ? "Modifier Filière" : "Ajouter Filière"}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-1">Code Filière</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Nom Filière en Français</label>
            <input
              type="text"
              value={nomFr}
              onChange={(e) => setNomFr(e.target.value)}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Nom Filière en Arabe</label>
            <input
              type="text"
              value={nomAr}
              onChange={handleArabicChange}
              className="w-full border rounded px-3 py-2"
              dir="rtl"
              required
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 hover:scale-y-110 transition-all duration-300 ease-in-out"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 hover:scale-y-110 transition-all duration-300 ease-in-out"
            >
              {loading ? "Enregistrement..." : filiere ? "Modifier" : "Ajouter"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
