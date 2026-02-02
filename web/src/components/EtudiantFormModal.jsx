import { useEffect, useState } from "react";
import api from "../api/axios";

export default function EtudiantFormModal({ open, onClose, refresh, etudiant }) {
  const isEdit = Boolean(etudiant);
  const [autoEmail, setAutoEmail] = useState(true);
  const [filieres, setFilieres] = useState([]);
  const [annees, setAnnees] = useState([]);

  const [form, setForm] = useState({
    nom_prenom_fr: "",
    nom_prenom_ar: "",
    matricule: "",
    email: "",
    nni: "",
    filiere: "",
    annee_universitaire: "",
    date_naissance: "",
    lieu_naissance_fr: "",
    lieu_naissance_ar: "",
    mention_fr: "",
    mention_ar: ""
  });

  /* ===================== FETCH FILIERES & ANNEES ===================== */
  useEffect(() => {
    const fetchData = async () => {
      const [f, a] = await Promise.all([
        api.get("filieres/"),
        api.get("annee_universitaire/")
      ]);
      setFilieres(f.data);
      setAnnees(a.data);
    };
    fetchData();
  }, []);

  /* ===================== EDIT MODE ===================== */
  useEffect(() => {
    if (isEdit && etudiant) {
      setAutoEmail(false);

      setForm({
        nom_prenom_fr: etudiant.nom_prenom_fr || "",
        nom_prenom_ar: etudiant.nom_prenom_ar || "",
        matricule: etudiant.matricule || "",
        email: etudiant.email || "",
        nni: etudiant.nni || "",
        filiere: etudiant.filiere || "",
        annee_universitaire: etudiant.annee_universitaire || "",
        date_naissance: etudiant.date_naissance || "",
        lieu_naissance_fr: etudiant.lieu_naissance_fr || "",
        lieu_naissance_ar: etudiant.lieu_naissance_ar || "",
        mention_fr: etudiant.mention_fr || "",
        mention_ar: etudiant.mention_ar || ""
      });
    }
  }, [etudiant, isEdit]);

  /* ===================== RESET ON ADD ===================== */
  useEffect(() => {
    if (!etudiant) {
      setForm({
        nom_prenom_fr: "",
        nom_prenom_ar: "",
        matricule: "",
        email: "",
        nni: "",
        filiere: "",
        annee_universitaire: "",
        date_naissance: "",
        lieu_naissance_fr: "",
        lieu_naissance_ar: "",
        mention_fr: "",
        mention_ar: ""
      });
    }
  }, [etudiant]);

  /* ===================== AUTO EMAIL ===================== */
  useEffect(() => {
    if (autoEmail && form.matricule) {
      setForm(prev => ({
        ...prev,
        email: `${form.matricule}@isms.esp.mr`
      }));
    }
  }, [form.matricule, autoEmail]);

  /* ===================== HANDLERS ===================== */
  const handleChange = (e) => {
    const arabicRegex = /^[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDCF\uFDF0-\uFDFF\uFE70-\uFEFF\s]*$/;
    if (e.target.name.includes('ar') && e.target.value && !arabicRegex.test(e.target.value)) return;

    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (isEdit) {
        await api.put(`etudiants/${etudiant.id}/`, form);
      } else {
        await api.post("etudiants/", form);
      }
      refresh();
      onClose();
    } catch (err){
      alert("Erreur lors de l'enregistrement de l'étudiant");
    }
  };

  /* ===================== INPUT FIELDS CONFIG ===================== */
  const fields = [
    { name: 'nom_prenom_fr', label: 'Nom & prénom (FR)', placeholder: 'Nom & prénom (Français)' },
    { name: 'nom_prenom_ar', label: 'Nom & prénom (AR)', placeholder: 'الاسم الكامل (العربية)', dir: 'rtl' },
    { name: 'matricule', label: 'Matricule', placeholder: 'Matricule' },
    { name: 'email', label: 'Email', placeholder: 'Email', disabled: autoEmail, extraClass: autoEmail ? 'bg-gray-200 cursor-not-allowed' : '' },
    { name: 'nni', label: 'NNI', placeholder: 'NNI', type: 'number' },
    { name: 'date_naissance', label: 'Date de naissance', placeholder: 'Date de naissance', type: 'date' },
    { name: 'lieu_naissance_fr', label: 'Lieu de naissance (FR)', placeholder: 'Lieu de naissance (FR)' },
    { name: 'lieu_naissance_ar', label: 'Lieu de naissance (AR)', placeholder: 'مكان الولادة (بالعربية)', dir: 'rtl' },
    { name: 'mention_fr', label: 'Mention (FR)', placeholder: 'Mention (FR)' },
    { name: 'mention_ar', label: 'Mention (AR)', placeholder: 'التقدير (بالعربية)', dir: 'rtl' }
  ];

  if (!open) return null;

  /* ===================== UI ===================== */
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">

        <h2 className="text-xl font-bold mb-6 border-b pb-2">
          {isEdit ? "Modifier étudiant" : "Ajouter étudiant"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Nom & prénom FR */}
          <div>
            <label className="block text-gray-700 font-semibold mt-4 mb-1">{fields[0].label}</label>
            <input
              name={fields[0].name}
              type="text"
              value={form.nom_prenom_fr}
              onChange={handleChange}
              placeholder={fields[0].placeholder}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          {/* Nom & prénom AR */}
          <div>
            <label className="block text-gray-700 font-semibold mt-4 mb-1">{fields[1].label}</label>
            <input
              name={fields[1].name}
              type="text"
              value={form.nom_prenom_ar}
              onChange={handleChange}
              placeholder={fields[1].placeholder}
              className="w-full p-2 border rounded"
              dir="rtl"
              required
            />
          </div>

          {/* Matricule */}
          <div>
            <label className="block text-gray-700 font-semibold mt-4 mb-1">{fields[2].label}</label>
            <input
              name={fields[2].name}
              type="text"
              value={form.matricule}
              onChange={handleChange}
              placeholder={fields[2].placeholder}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          {/* Auto-email checkbox */}
          <div className="flex items-center gap-2 bg-gray-100 p-2 rounded-lg mt-2">
            <input
              type="checkbox"
              checked={autoEmail}
              onChange={(e) => setAutoEmail(e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-sm">Email ISMS automatiquement ?</span>
          </div>

          {/* Email */}
          <div>
            <label className="block text-gray-700 font-semibold mt-4 mb-1">{fields[3].label}</label>
            <input
              name={fields[3].name}
              type="text"
              value={form.email}
              onChange={handleChange}
              placeholder={fields[3].placeholder}
              className={`w-full p-2 border rounded ${fields[3].extraClass || ''}`}
              disabled={fields[3].disabled}
              required
            />
          </div>

          {/* NNI */}
          <div>
            <label className="block text-gray-700 font-semibold mt-4 mb-1">{fields[4].label}</label>
            <input
              name={fields[4].name}
              type="number"
              min={0}
              value={form.nni}
              onChange={handleChange}
              placeholder={fields[4].placeholder}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          {/* Date de naissance */}
          <div>
            <label className="block text-gray-700 font-semibold mt-4 mb-1">{fields[5].label}</label>
            <input
              name={fields[5].name}
              type="date"
              value={form.date_naissance}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          {/* Lieu naissance FR */}
          <div>
            <label className="block text-gray-700 font-semibold mt-4 mb-1">{fields[6].label}</label>
            <input
              name={fields[6].name}
              type="text"
              value={form.lieu_naissance_fr}
              onChange={handleChange}
              placeholder={fields[6].placeholder}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          {/* Lieu naissance AR */}
          <div>
            <label className="block text-gray-700 font-semibold mt-4 mb-1">{fields[7].label}</label>
            <input
              name={fields[7].name}
              type="text"
              value={form.lieu_naissance_ar}
              onChange={handleChange}
              placeholder={fields[7].placeholder}
              className="w-full p-2 border rounded"
              dir="rtl"
              required
            />
          </div>

          {/* Filière */}
          <div>
            <label className="block text-gray-700 font-semibold mt-4 mb-1">Filière</label>
            <select
              name="filiere"
              value={form.filiere}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            >
              <option value="">Filière</option>
              {filieres.map(f => <option key={f.id} value={f.id}>{f.code_filiere}</option>)}
            </select>
          </div>

          {/* Année universitaire */}
          <div>
            <label className="block text-gray-700 font-semibold mt-4 mb-1">Année universitaire</label>
            <select
              name="annee_universitaire"
              value={form.annee_universitaire}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            >
              <option value="">Année universitaire</option>
              {annees.map(a => <option key={a.id} value={a.id}>{a.code_annee}</option>)}
            </select>
          </div>

          {/* Mention FR */}
          <div>
            <label className="block text-gray-700 font-semibold mt-4 mb-1">{fields[8].label}</label>
            <input
              name={fields[8].name}
              type="text"
              value={form.mention_fr}
              onChange={handleChange}
              placeholder={fields[8].placeholder}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          {/* Mention AR */}
          <div>
            <label className="block text-gray-700 font-semibold mt-4 mb-1">{fields[9].label}</label>
            <input
              name={fields[9].name}
              type="text"
              value={form.mention_ar}
              onChange={handleChange}
              placeholder={fields[9].placeholder}
              className="w-full p-2 border rounded"
              dir="rtl"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded">Annuler</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">{isEdit ? "Modifier" : "Ajouter"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
