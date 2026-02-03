import { useState, useEffect } from "react";
import api from "../api/axios"; // CHANGE THIS: use 'api' not 'publicApi'
import Alert from "./Alert";

export default function AnneeFormModal({ onClose, onSave, editingAnnee }) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (editingAnnee) {
      setCode(editingAnnee.code_annee);
    }
  }, [editingAnnee]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

     if (editingAnnee && code === editingAnnee.code_annee) {
      onClose();
      setLoading(false);
      return;
    }
    
    try {
      let res;
      if (editingAnnee) {
        console.log()
        res = await api.put(`/annee_universitaire/${editingAnnee.id}/`, {
          code_annee: code,
        });
      } else {
        res = await api.post("/annee_universitaire/", {
          code_annee: code,
        });
      }
      onSave(res.data);
    } catch (err) {
      console.error(err);
      
      // Handle 401 (Unauthorized) - token expired or not logged in
      if (err.response?.status === 401) {
        setError("Session expirée. Veuillez vous reconnecter.");
        // Auto-redirect to login after showing error
        setTimeout(() => {
          window.location.href = "/login";
        }, 2000);
      }
      // Handle validation errors
      else if (err.response?.data) {
        const errorData = err.response.data;
        
        if (errorData.code_annee) {
          const errorMsg = Array.isArray(errorData.code_annee) 
            ? errorData.code_annee[0] 
            : errorData.code_annee;
          setError(errorMsg);
        }
        else if (errorData.non_field_errors) {
          const errorMsg = Array.isArray(errorData.non_field_errors)
            ? errorData.non_field_errors[0]
            : errorData.non_field_errors;
          setError(errorMsg);
        }
        else if (errorData.detail) {
          setError(errorData.detail);
        }
        else {
          setError("Erreur lors de l'enregistrement");
        }
      } else {
        setError("Erreur lors de l'enregistrement");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-lg max-w-md w-full p-6">
        <h2 className="text-xl font-bold mb-4">{editingAnnee ? "Modifier Année" : "Ajouter Année"}</h2>
        
        {error && (
          <Alert type="error" onClose={() => setError("")}>
            {error}
          </Alert>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">Code Année</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Ex:2024-2025"
              pattern="\d{4}-\d{4}"
              title="Format attendu : 2024-2025"
              className="w-full border rounded-lg px-3 py-2"
              required
            />
          </div>

          <div className="flex justify-end space-x-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 hover:scale-y-110 transition-all duration-300 ease-in-out"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 hover:scale-y-110 transition-all duration-300 ease-in-out"
            >
              {loading ? "Enregistrement..." : "Enregistrer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}