import { useEffect, useState } from "react";
import api from "../api/axios";
import MainLayout from "../components/Layout/MainLayout";
import ChangePasswordModal from "../components/ChangePasswordModal";
import Alert from "../components/Alert";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserCircle,
  faPen,
  faSave
} from "@fortawesome/free-solid-svg-icons";

export default function Profile() {
  const [user, setUser] = useState({});
  const [fields, setFields] = useState({
    first_name: "",
    last_name: "",
    email: "",
  });

  const [editing, setEditing] = useState({
    first_name: false,
    last_name: false,
    email: false,
  });

  const [alert, setAlert] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpCode, setOtpCode] = useState("");

  useEffect(() => {
    api.get("profile/").then(res => {
      setUser(res.data);
      setFields({
        first_name: res.data.first_name,
        last_name: res.data.last_name,
        email: res.data.email,
      });
    });
  }, []);

  const toggleEdit = async (field) => {
    if (editing[field]) {
      try {
        const res = await api.put("profile/", { [field]: fields[field] });
        
        // Check if backend asks for OTP
        if (res.status === 202 && res.data.status === "email_verification_required") {
          setAlert({ type: "info", msg: "Code envoyé à votre nouvel email." });
          setShowOtpModal(true); // <--- OPEN MODAL
          return; // Don't close edit mode yet
        }

        setAlert({ type: "success", msg: "Profil mis à jour" });
      } catch (err) {
        setAlert({ type: "error", msg: err.response?.data?.error || "Erreur" });
        return; // Stop here on error
      }
    }
    setEditing(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const verifyEmail = async () => {
    try {
      await api.post("profile/verify-email/", { code: otpCode });
      setAlert({ type: "success", msg: "Email confirmé et mis à jour !" });
      setShowOtpModal(false);
      setEditing({ ...editing, email: false }); // Lock the field
      setOtpCode("");
    } catch (err) {
      setAlert({ type: "error", msg: "Code incorrect" });
    }
  };

  const renderField = (label, field) => (
    <div className="flex items-center gap-3 sm:gap-4">
      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-600 mb-2">{label}</label>
        <input
          type="text"
          value={fields[field]}
          readOnly={!editing[field]}
          onChange={e => setFields({ ...fields, [field]: e.target.value })}
          className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 font-medium
            ${editing[field] 
              ? "border-blue-500 bg-blue-50 text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
              : "border-gray-200 bg-gray-50 text-gray-700 cursor-default"
            }
          `}
        />
      </div>

      <button
        onClick={() => toggleEdit(field)}
        className={`mt-8 w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 shadow-md
          ${editing[field] 
            ? "bg-green-500 text-white hover:bg-green-600 shadow-green-500/30" 
            : "bg-white text-gray-600 hover:bg-gray-100 border-2 border-gray-200"
          }
        `}
      >
        <FontAwesomeIcon icon={editing[field] ? faSave : faPen} className="text-lg" />
      </button>
    </div>
  );

  return (
    <MainLayout title="Profil">
      <div className="flex justify-center px-4 sm:px-6 py-6 sm:py-8">
        <div className="w-full max-w-2xl">

          {alert && (
            <div className="mb-6">
              <Alert type={alert.type} onClose={() => setAlert(null)}>
                {alert.msg}
              </Alert>
            </div>
          )}

          {/* Profile Card */}
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">

            {/* Header */}
            <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 p-8 sm:p-10 flex flex-col items-center text-white relative overflow-hidden">
              {/* Decorative circles */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
              
              <div className="relative z-10 flex flex-col items-center">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4 shadow-2xl border-4 border-white/30">
                  <FontAwesomeIcon icon={faUserCircle} className="text-6xl sm:text-7xl" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold mb-2">{user.username}</h2>
                <p className="text-blue-100 text-sm mb-6">
                  {user.is_superuser === true ? 'Scolarité' : 'Directeur'}
                </p>
                <button
                  onClick={() => setModalOpen(true)}
                  className="bg-white text-blue-700 px-6 py-3 rounded-xl font-bold hover:bg-blue-50 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
                >
                  Changer le mot de passe
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 sm:p-10 space-y-6 sm:space-y-8">
              {renderField("Prénom", "first_name")}
              {renderField("Nom", "last_name")}
              {renderField("Email", "email")}
            </div>

          </div>
        </div>
      </div>

      <ChangePasswordModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />

      {showOtpModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-80">
            <h3 className="text-lg font-bold mb-4">Code de vérification</h3>
            <input 
              type="text" 
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
              className="w-full border-2 border-gray-200 rounded-xl p-3 mb-4 text-center text-xl tracking-widest"
              placeholder="123456"
              maxLength={6}
            />
            <div className="flex gap-2">
              <button onClick={() => setShowOtpModal(false)} className="flex-1 bg-gray-100 py-2 rounded-xl">Annuler</button>
              <button onClick={verifyEmail} className="flex-1 bg-blue-600 text-white py-2 rounded-xl">Valider</button>
            </div>
          </div>
        </div>
      )}

    </MainLayout>
  );
}