import { useState } from "react";
import api from "../api/axios"; // Your axios instance
import { useNavigate } from "react-router-dom";
import Alert from "../components/Alert"; // Your alert component
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle, faTimesCircle, faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

// --- REUSED CONSTANTS ---
const PWD_RULES = [
  { label: "8 caractères min.", test: (p) => p.length >= 8 },
  { label: "1 Majuscule", test: (p) => /[A-Z]/.test(p) },
  { label: "1 Minuscule", test: (p) => /[a-z]/.test(p) },
  { label: "1 Chiffre", test: (p) => /[0-9]/.test(p) },
  { label: "1 Caractère spécial", test: (p) => /[!@#$%^&*(),.?":{}|<>]/.test(p) },
];

export default function ForgotPassword() {
  const [step, setStep] = useState(1); // 1: Email, 2: Code, 3: New Pass
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [alert, setAlert] = useState(null);
  const navigate = useNavigate();

  // STEP 1: Send Email
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("password-reset/request/", { email });
      setStep(2);
      setAlert({ type: "success", msg: "Code envoyé à votre email." });
    } catch (err) {
      setAlert({ type: "error", msg: err.response?.data?.error || "Erreur." });
    }
  };

  // STEP 2: Verify Code
  const handleCodeSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("password-reset/verify/", { email, code });
      setStep(3);
      setAlert(null);
    } catch (err) {
      setAlert({ type: "error", msg: "Code invalide ou expiré." });
    }
  };

  // STEP 3: Reset Password
  const handleResetSubmit = async (e) => {
    e.preventDefault();
    if (newPass !== confirmPass) {
        setAlert({ type: "error", msg: "Les mots de passe ne correspondent pas." });
        return;
    }
    
    try {
      await api.post("password-reset/finish/", { email, code, new_password: newPass });
      setAlert({ type: "success", msg: "Mot de passe réinitialisé !" });
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      const apiError = err.response?.data?.error;
      setAlert({ type: "error", msg: Array.isArray(apiError) ? apiError.join(" ") : apiError || "Erreur." });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
          {step === 1 && "Mot de passe oublié"}
          {step === 2 && "Vérification"}
          {step === 3 && "Nouveau mot de passe"}
        </h2>

        {alert && <div className="mb-4"><Alert type={alert.type}>{alert.msg}</Alert></div>}

        {/* STEP 1: EMAIL */}
        {step === 1 && (
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <input
              type="email"
              placeholder="Votre email"
              className="w-full p-3 border rounded-xl"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            <button className="w-full bg-blue-600 text-white p-3 rounded-xl font-bold">Envoyer le code</button>
          </form>
        )}

        {/* STEP 2: CODE */}
        {step === 2 && (
          <form onSubmit={handleCodeSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Code (Ex: A1B2C3)"
              className="w-full p-3 border rounded-xl text-center text-xl tracking-widest uppercase"
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
              required
            />
            <button className="w-full bg-blue-600 text-white p-3 rounded-xl font-bold">Vérifier</button>
          </form>
        )}

        {/* STEP 3: NEW PASSWORD */}
        {step === 3 && (
          <form onSubmit={handleResetSubmit} className="space-y-4">
            <div className="relative">
                <input
                    type={showPass ? "text" : "password"}
                    placeholder="Nouveau mot de passe"
                    className="w-full p-3 border rounded-xl"
                    value={newPass}
                    onChange={e => setNewPass(e.target.value)}
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-3 text-gray-400">
                    <FontAwesomeIcon icon={showPass ? faEyeSlash : faEye} />
                </button>
            </div>

            {/* RULES CHECKLIST */}
            <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                {PWD_RULES.map((rule, idx) => {
                    const isValid = rule.test(newPass);
                    return (
                        <div key={idx} className={`flex items-center gap-1 ${isValid ? "text-green-600" : "text-gray-400"}`}>
                            <FontAwesomeIcon icon={isValid ? faCheckCircle : faTimesCircle} />
                            {rule.label}
                        </div>
                    );
                })}
            </div>

            <input
              type="password"
              placeholder="Confirmer le mot de passe"
              className="w-full p-3 border rounded-xl"
              value={confirmPass}
              onChange={e => setConfirmPass(e.target.value)}
            />
            <button className="w-full bg-green-600 text-white p-3 rounded-xl font-bold">Réinitialiser</button>
          </form>
        )}
      </div>
    </div>
  );
}