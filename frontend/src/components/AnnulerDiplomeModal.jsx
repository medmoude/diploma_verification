import { useState } from "react";
import api from "../api/axios";

export default function AnnulerDiplomeModal({ open, onClose, diplome, onSuccess }) {
  const [raison, setRaison] = useState("");
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const submit = async () => {
    if (!raison.trim()) {
      alert("Veuillez saisir une raison d'annulation");
      return;
    }

    setLoading(true);
    try {
      await api.post(`diplomes/${diplome.id}/annuler/`, {
        raison_annulation: raison
      });
      onSuccess();
      onClose();
    } catch {
      alert("Erreur lors de l'annulation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center">
      <div className="bg-white rounded-xl p-6 w-96">
        <h2 className="text-xl font-bold mb-4 text-red-600">
          Annulation du diplôme
        </h2>

        <textarea
          className="w-full border rounded-lg p-2"
          rows={4}
          placeholder="Raison officielle de l'annulation..."
          value={raison}
          onChange={(e) => setRaison(e.target.value)}
        />

        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600"
          >
            Annuler
          </button>

          <button
            onClick={submit}
            disabled={loading}
            className="px-4 py-2 bg-red-600 text-white rounded-lg"
          >
            Confirmer
          </button>
        </div>
      </div>
    </div>
  );
}
