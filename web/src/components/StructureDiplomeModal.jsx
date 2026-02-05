import { useState } from "react";
import api from "../api/axios";
import { BACKEND_URL } from "../api/axios";


export default function StructureDiplomeModal({ structure, onClose, onSaved }) {
  const [form, setForm] = useState({

    // New Header Fields
    republique_fr: structure?.republique_fr || "REPUBLIQUE ISLAMIQUE DE MAURITANIE",
    republique_ar: structure?.republique_ar || "الجمهورية الإسلامية الموريتانية",
    devise_fr: structure?.devise_fr || "Honneur-Fraternité-Justice",
    devise_ar: structure?.devise_ar || "شرف-إخاء-عدل",
    ministere_fr: structure?.ministere_fr || "Ministère de l'Enseignement Supérieur et de la Recherche Scientifique",
    ministere_ar: structure?.ministere_ar || "وزارة التعليم العالي والبحث العلمي",
    groupe_fr: structure?.groupe_fr || "Groupe Polytechnique",
    groupe_ar: structure?.groupe_ar || "مجمع بوليتكنيك",
    institut_fr: structure?.institut_fr || "Institut Supérieur de la Statistique",
    institut_ar: structure?.institut_ar || "المعهد العالي للإحصاء",

    // Title & Citations
    diplome_titre_fr: structure?.diplome_titre_fr || "Diplôme de Licence",
    diplome_titre_ar: structure?.diplome_titre_ar || "شهادة اللسانس ",
    citations_juridiques_fr: structure?.citations_juridiques_fr || "",
    citations_juridiques_ar: structure?.citations_juridiques_ar || "",

    // PV Jury Info
    label_pv_jury_fr: structure?.label_pv_jury_fr || "Vu le procès-verbal du jury des examens tenu en date du",
    label_pv_jury_ar: structure?.label_pv_jury_ar || "وبناء على محضر لجنة الامتحانات الصادر بتاريخ",
    date_pv_jury: structure?.date_pv_jury || "",

    date_verification: structure?.date_verification || "",

    // Signatories (Left and Right)
    signataire_gauche_fr: structure?.signataire_gauche_fr || "Le Commandant du Groupe Polytechnique",
    signataire_gauche_ar: structure?.signataire_gauche_ar || "قائد مجمع بوليتكنيك",
    signataire_gauche_nom: structure?.signataire_gauche_nom || "",
    
    signataire_droit_fr: structure?.signataire_droit_fr || "Le Directeur de l'Institut Supérieur de la Statistique",
    signataire_droit_ar: structure?.signataire_droit_ar || "مدير المعهد العالي للإحصاء",
    signataire_droit_nom: structure?.signataire_droit_nom || "",
  });

  const [files, setFiles] = useState({});

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });
  const handleFile = e => setFiles({ ...files, [e.target.name]: e.target.files[0] });

  const handleSubmit = async () => {
    const data = new FormData();
    
    // Append text fields
    Object.entries(form).forEach(([k, v]) => data.append(k, v));
    
    // Append files ONLY if they are actually selected
    Object.entries(files).forEach(([k, v]) => {
      if (v) { // <--- This check prevents sending null/undefined
        data.append(k, v);
      }
    });

    try {
      if (structure) {
        await api.patch(`/structure_diplome/${structure.id}/`, data);
      } else {
        await api.post("/structure_diplome/", data);
      }
      onSaved();
      onClose();
    } catch (error) {
      console.error("Error saving structure:", error.response?.data);
    }
  };

  /* Helper function to determine image source */
  const getPreview = (fieldName, serverPath) => {
      // 1. If a new file is selected, show local preview
      if (files[fieldName]) return URL.createObjectURL(files[fieldName]); 
      
      // 2. If no new file but we have a server path, show server image
      if (serverPath) {
        return serverPath.startsWith("http") ? serverPath : `${BACKEND_URL}${serverPath}`;
      }
      return null;
    };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-4xl overflow-y-auto max-h-[95vh]">
        <h2 className="text-xl font-bold mb-4 border-b pb-2">Structure du Diplôme</h2>

        <div className="grid grid-cols-2 gap-4">
          <input name="republique_fr" placeholder="République (FR)" value={form.republique_fr} onChange={handleChange} className="p-2 border rounded" />
          <input name="republique_ar" placeholder="République (AR)" value={form.republique_ar} onChange={handleChange} className="p-2 border rounded rtl" />
          
          <input name="ministere_fr" placeholder="Ministère (FR)" value={form.ministere_fr} onChange={handleChange} className="p-2 border rounded" />
          <input name="ministere_ar" placeholder="Ministère (AR)" value={form.ministere_ar} onChange={handleChange} className="p-2 border rounded rtl" />

          <input name="groupe_fr" placeholder="Groupe (ex: Polytechnique) (FR)" value={form.groupe_fr} onChange={handleChange} className="p-2 border rounded" />
          <input name="groupe_ar" placeholder="Groupe (AR)" value={form.groupe_ar} onChange={handleChange} className="p-2 border rounded rtl" />

          <input name="institut_fr" placeholder="Institut (FR)" value={form.institut_fr} onChange={handleChange} className="p-2 border rounded" />
          <input name="institut_ar" placeholder="Institut (AR)" value={form.institut_ar} onChange={handleChange} className="p-2 border rounded rtl" />

          <div className="col-span-2 font-semibold text-blue-600 mt-2">
            Titre et Cadre Juridique
          </div>
          <input name="diplome_titre_fr" placeholder="Titre du Diplôme (FR)" value={form.diplome_titre_fr} onChange={handleChange} className="p-2 border rounded col-span-1" />
          <input name="diplome_titre_ar" placeholder="Titre du Diplôme (AR)" value={form.diplome_titre_ar} onChange={handleChange} className="p-2 border rounded rtl col-span-1" />
          
          <textarea name="citations_juridiques_fr" placeholder="Citations Juridiques (FR)" value={form.citations_juridiques_fr} onChange={handleChange} className="p-2 border rounded h-72 col-span-1" />
          <textarea name="citations_juridiques_ar" placeholder="Citations Juridiques (AR)" value={form.citations_juridiques_ar} onChange={handleChange} className="p-2 border rounded h-72 rtl col-span-1" />

          <div className="col-span-2 font-semibold text-blue-600 mt-2">
            Procès-verbal et Jury
          </div>
          <input name="label_pv_jury_fr" placeholder="Texte PV (FR)" value={form.label_pv_jury_fr} onChange={handleChange} className="p-2 border rounded" />
          <input name="label_pv_jury_ar" placeholder="Texte PV (AR)" value={form.label_pv_jury_ar} onChange={handleChange} className="p-2 border rounded rtl" />
          <input type="date" name="date_pv_jury" value={form.date_pv_jury} onChange={handleChange} className="p-2 border rounded col-span-2" />

          <div className="col-span-2 font-semibold text-blue-600 mt-2">
            Date de vérification du diplôme
          </div>
          <input
            type="date"
            name="date_verification"
            value={form.date_verification}
            onChange={handleChange}
            className="p-2 border rounded col-span-2"
          />

          <div className="col-span-1 font-semibold text-blue-600 mt-2">Signataire Gauche (Polytechnique)</div>
          <div className="col-span-1 font-semibold text-blue-600 mt-2">Signataire Droit (ISS)</div>
          <div className="space-y-2">
            <input name="signataire_gauche_fr" placeholder="Titre (FR)" value={form.signataire_gauche_fr} onChange={handleChange} className="w-full p-2 border rounded" />
            <input name="signataire_gauche_ar" placeholder="Titre (AR)" value={form.signataire_gauche_ar} onChange={handleChange} className="w-full p-2 border rounded rtl" />
            <input name="signataire_gauche_nom" placeholder="الإسم الكامل (بالعربي)" value={form.signataire_gauche_nom} onChange={handleChange} className="w-full p-2 border rounded font-bold rtl" />
          </div>
          <div className="space-y-2">
            <input name="signataire_droit_fr" placeholder="Titre (FR)" value={form.signataire_droit_fr} onChange={handleChange} className="w-full p-2 border rounded" />
            <input name="signataire_droit_ar" placeholder="Titre (AR)" value={form.signataire_droit_ar} onChange={handleChange} className="w-full p-2 border rounded rtl" />
            <input name="signataire_droit_nom" placeholder="الإسم الكامل (بالعربي)" value={form.signataire_droit_nom} onChange={handleChange} className="w-full p-2 border rounded font-bold rtl" />
          </div>

          <div className="col-span-2 font-semibold text-blue-600 mt-4 border-t pt-2 text-center">Images et Logos</div>
          {/* 1. Image Cadre */}
          <div className="col-span-2 flex flex-col items-center border-b pb-4">
            <label className="text-sm font-bold mb-1 italic">1. Image Cadre (Centré)</label>
            {getPreview("image_border", structure?.image_border) && (
              <img 
                src={getPreview("image_border", structure?.image_border)} 
                className="h-20 mb-2 border" 
                alt="preview" 
              />
            )}
            <input type="file" name="image_border" onChange={handleFile} className="text-sm" />
          </div>

          {/* 2. Logo Groupe */}
          <div className="col-span-1 flex flex-col items-center">
            <label className="text-sm font-bold mb-1 italic">2. Logo Groupe</label>
            {getPreview("image_logo_left", structure?.image_logo_left) && (
              <img 
                src={getPreview("image_logo_left", structure?.image_logo_left)} 
                className="h-20 mb-2 object-contain" 
                alt="preview" 
              />
            )}
            <input type="file" name="image_logo_left" onChange={handleFile} className="text-sm" />
          </div>

          {/* 3. Logo Institut */}
          <div className="col-span-1 flex flex-col items-center">
            <label className="text-sm font-bold mb-1 italic">3. Logo Institut</label>
            {getPreview("image_logo_right", structure?.image_logo_right) && (
              <img 
                src={getPreview("image_logo_right", structure?.image_logo_right)} 
                className="h-20 mb-2 object-contain" 
                alt="preview" 
              />
            )}
            <input type="file" name="image_logo_right" onChange={handleFile} className="text-sm" />
          </div>

        </div>

        <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 hover:scale-y-110 transition-all duration-300 ease-in-out">Annuler</button>
          <button onClick={handleSubmit} className="px-6 py-2 bg-blue-800 text-white rounded font-bold hover:bg-blue-700 hover:scale-y-110 transition-all duration-300 ease-in-out">Enregistrer</button>
        </div>
      </div>
    </div>
  );
}