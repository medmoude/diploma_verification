import { useState } from "react";
import api from "../api/axios";
import Alert from "./Alert";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faEyeSlash,
  faLock,
  faKey,
  faCheckCircle
} from "@fortawesome/free-solid-svg-icons";


/* ---------- IMPORTANT: OUTSIDE COMPONENT ---------- */
const PasswordInput = ({ value, onChange, placeholder, show, toggleShow, icon }) => (
  <div className="relative">
    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
      <FontAwesomeIcon icon={icon} className="text-lg" />
    </div>

    <input
      type={show ? "text" : "password"}
      placeholder={placeholder}
      className="w-full border-2 border-gray-200 rounded-xl pl-12 pr-12 py-3.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 font-medium text-gray-700"
      value={value}
      onChange={onChange}
    />

    <button
      type="button"
      onClick={toggleShow}
      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
    >
      <FontAwesomeIcon icon={show ? faEyeSlash : faEye} className="text-lg" />
    </button>
  </div>
);
/* -------------------------------------------------- */


export default function ChangePasswordModal({ open, onClose }) {
  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [alert, setAlert] = useState(null);

  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  if (!open) return null;

  const handleSubmit = async () => {
    if (newPass !== confirmPass) {
      setAlert({ type: "error", msg: "Les mots de passe ne correspondent pas" });
      return;
    }

    try {
      await api.post("change-password/", {
        old_password: oldPass,
        new_password: newPass,
      });

      setAlert({ type: "success", msg: "Mot de passe modifié avec succès" });

      setOldPass("");
      setNewPass("");
      setConfirmPass("");

      setTimeout(() => {
        onClose();
        setAlert(null);
      }, 1200);

    } catch (err) {
      const status = err.response?.status;
      const apiError = err.response?.data?.error;

      // If backend sends a list of password policy errors
      if (Array.isArray(apiError)) {
        setAlert({ type: "error", msg: apiError.join(" ") });
        return;
      }

      // If backend sends a string error
      if (typeof apiError === "string" && apiError.trim()) {
        setAlert({ type: "error", msg: apiError });
        return;
      }

      // Friendly fallback by status
      if (status === 400) {
        setAlert({ type: "error", msg: "Données invalides. Vérifiez les champs." });
      } else if (status === 401) {
        setAlert({ type: "error", msg: "Session expirée. Reconnectez-vous." });
      } else {
        setAlert({ type: "error", msg: "Erreur serveur. Réessayez plus tard." });
      }
    }

  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl relative">

        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-t-2xl p-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <FontAwesomeIcon icon={faLock} className="text-2xl" />
            </div>
            <h2 className="text-2xl font-bold">
              Changer le mot de passe
            </h2>
          </div>
          <p className="text-blue-100 text-sm">
            Veuillez saisir votre ancien et nouveau mot de passe
          </p>
        </div>

        {/* Body */}
        <div className="p-6 sm:p-8">
          {alert && (
            <div className="mb-6">
              <Alert type={alert.type} onClose={() => setAlert(null)}>
                {alert.msg}
              </Alert>
            </div>
          )}

          <div className="space-y-4">
            <PasswordInput
              value={oldPass}
              onChange={e => setOldPass(e.target.value)}
              placeholder="Ancien mot de passe"
              show={showOldPass}
              toggleShow={() => setShowOldPass(!showOldPass)}
              icon={faKey}
            />

            <PasswordInput
              value={newPass}
              onChange={e => setNewPass(e.target.value)}
              placeholder="Nouveau mot de passe"
              show={showNewPass}
              toggleShow={() => setShowNewPass(!showNewPass)}
              icon={faLock}
            />

            <PasswordInput
              value={confirmPass}
              onChange={e => setConfirmPass(e.target.value)}
              placeholder="Confirmer le nouveau mot de passe"
              show={showConfirmPass}
              toggleShow={() => setShowConfirmPass(!showConfirmPass)}
              icon={faCheckCircle}
            />
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 mt-8">
            <button
              onClick={onClose}
              className="px-6 py-3 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 border-2 border-gray-200"
            >
              Annuler
            </button>

            <button
              onClick={handleSubmit}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold hover:from-green-700 hover:to-emerald-700 shadow-lg hover:scale-105 active:scale-95"
            >
              Valider
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
