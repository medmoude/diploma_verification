import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { publicApi } from "../api/axios";

export default function UploadPdfModal({ open, onClose }) {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleFile = async (file) => {
    if (!file) return;

    setLoading(true);

    const data = new FormData();
    data.append("file", file);

    try {
      const res = await publicApi.post("verify-file/", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      navigate("/verify-file", { state: res.data });
    } catch (error) {
      console.log(error);
      alert("Diplôme invalide, modifié ou non signé");
    } finally {
      setLoading(false);
      onClose();
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl w-96 shadow-xl">
        <h2 className="font-bold mb-4 text-lg text-gray-800">
          Téléverser le diplôme
        </h2>

        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => handleFile(e.target.files[0])}
          className="w-full text-sm"
        />

        {loading && (
          <p className="mt-4 text-blue-600 font-semibold">
            Vérification en cours…
          </p>
        )}

        <button
          onClick={onClose}
          className="mt-4 text-red-600 hover:underline"
        >
          Annuler
        </button>
      </div>
    </div>
  );
}
