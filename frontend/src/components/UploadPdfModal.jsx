import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { hashPdf } from "../utils/hashPdf";
import { publicApi } from "../api/axios";

export default function UploadPdfModal({ open, onClose }) {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleFile = async (file) => {
    setLoading(true);
    const hash = await hashPdf(file);

    try {
      const res = await publicApi.post("verify-file/", { hash });
      navigate("/verify-file", { state: res.data });
    } catch {
      alert("Diplôme invalide ou modifié");
    } finally {
      setLoading(false);
      onClose();
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center">
      <div className="bg-white p-6 rounded-xl w-96">
        <h2 className="font-bold mb-4">Téléverser le diplôme</h2>

        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => handleFile(e.target.files[0])}
        />

        {loading && <p className="mt-4">Vérification...</p>}

        <button onClick={onClose} className="mt-4 text-red-600">
          Annuler
        </button>
      </div>
    </div>
  );
}
