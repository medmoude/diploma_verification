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
        mention_fr: etudiant.lieu_naissance_fr || "",
        mention_ar: etudiant.lieu_naissance_ar || ""
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
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
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
    } catch (err) {
      alert(
        err.response?.data?.error ||
        "Erreur lors de l'enregistrement de l'étudiant"
      );
    }
  };

  if (!open) return null;

  /* ===================== UI ===================== */
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-lg">

        <h2 className="text-xl font-bold mb-4">
          {isEdit ? "Modifier étudiant" : "Ajouter étudiant"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-3">

          <input
            name="nom_prenom_fr"
            value={form.nom_prenom_fr}
            onChange={handleChange}
            placeholder="Nom & prénom (Français)"
            className="w-full p-2 border rounded"
            required
          />

          <input
            name="nom_prenom_ar"
            value={form.nom_prenom_ar}
            onChange={handleChange}
            placeholder="Nom & prénom (Arabe)"
            className="w-full p-2 border rounded"
            required
          />

          <input
            name="matricule"
            value={form.matricule}
            onChange={handleChange}
            placeholder="Matricule"
            className="w-full p-2 border rounded"
            required
          />

          <div className="flex items-center gap-2 bg-gray-100 p-2 rounded-lg">
            <input
              type="checkbox"
              checked={autoEmail}
              onChange={(e) => setAutoEmail(e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-sm">
              Email ISMS automatiquement ?
            </span>
          </div>

          <input
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email"
            className={`w-full p-2 border rounded ${autoEmail ? "bg-gray-200 cursor-not-allowed" : ""}`}
            disabled={autoEmail}
          />

          <input
            type="number"
            min={0}
            name="nni"
            value={form.nni}
            onChange={handleChange}
            placeholder="NNI"
            className="w-full p-2 border rounded"
            required
          />

          <input
            type="date"
            name="date_naissance"
            value={form.date_naissance}
            onChange={handleChange}
            placeholder="date de naissance"
            className="w-full p-2 border rounded"
            required
          />

          <input
            type="text"
            name="lieu_naissance_fr"
            value={form.lieu_naissance_fr}
            onChange={handleChange}
            placeholder="date de naissance"
            className="w-full p-2 border rounded"
            required
          />

          <input
            type="text"
            name="lieu_naissance_ar"
            value={form.lieu_naissance_ar}
            onChange={handleChange}
            placeholder="date de naissance"
            className="w-full p-2 border rounded"
            required
          />

          <select
            name="filiere"
            value={form.filiere}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          >
            <option value="">Filière</option>
            {filieres.map((f) => (
              <option key={f.id} value={f.id}>
                {f.code_filiere}
              </option>
            ))}
          </select>

          <select
            name="annee_universitaire"
            value={form.annee_universitaire}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          >
            <option value="">Année universitaire</option>
            {annees.map((a) => (
              <option key={a.id} value={a.id}>
                {a.code_annee}
              </option>
            ))}
          </select>

          <input
            type="text"
            name="mention_fr"
            value={form.mention_fr}
            onChange={handleChange}
            placeholder="date de naissance"
            className="w-full p-2 border rounded"
            required
          />

          <input
            type="text"
            name="mention_ar"
            value={form.mention_ar}
            onChange={handleChange}
            placeholder="date de naissance"
            className="w-full p-2 border rounded"
            required
          />

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded"
            >
              Annuler
            </button>

            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              {isEdit ? "Modifier" : "Ajouter"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
