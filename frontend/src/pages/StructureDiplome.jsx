import { useEffect, useState } from "react";
import api, { BACKEND_URL } from "../api/axios";
import MainLayout from "../components/Layout/MainLayout";
import StructureDiplomeModal from "../components/StructureDiplomeModal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";

export default function StructureDiplome() {
  const [structure, setStructure] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchStructure = async () => {
    try {
      const res = await api.get("/structure_diplome/");
      setStructure(res.data.length > 0 ? res.data[0] : null);
    } catch (err) {
      console.error("Erreur lors du chargement:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStructure();
  }, []);

  const handleDelete = async () => {
    if (!window.confirm("Supprimer définitivement la structure du diplôme ?")) return;
    await api.delete(`/structure_diplome/${structure.id}/`);
    setStructure(null);
  };

  if (loading) {
    return (
      <MainLayout title="Structure du diplôme">
        <p className="p-6">Chargement du modèle...</p>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Structure du diplôme">
      <div className="max-w-6xl mx-auto p-6">
        
        {/* BARRE D'ACTIONS */}
        <div className="flex justify-end gap-2 mb-6">
          {structure ? (
            <>
              <button
                onClick={() => setModalOpen(true)}
                className="p-3 bg-yellow-500 text-white rounded shadow hover:bg-yellow-600 transition"
                title="Modifier le modèle"
              >
                <FontAwesomeIcon icon={faEdit}/>
              </button>
              <button
                onClick={handleDelete}
                className="p-3 bg-red-600 text-white rounded shadow hover:bg-red-700 transition"
                title="Supprimer"
              >
                <FontAwesomeIcon icon={faTrash}/>
              </button>
            </>
          ) : (
            <button
              onClick={() => setModalOpen(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700 transition"
            >
              ➕ Créer la structure du diplôme
            </button>
          )}
        </div>

        {/* APERÇU DU DIPLÔME (Format A4 Paysage simulé) */}
        {!structure ? (
          <div className="bg-white p-12 text-center rounded-lg border-2 border-dashed border-gray-300 text-gray-400">
            Aucun modèle de diplôme configuré.
          </div>
        ) : (
          <div 
            className="relative bg-white shadow-2xl mx-auto overflow-hidden" 
            style={{ 
              width: '250mm', 
              Height: '260mm', 
              padding: '35mm 17mm', // Adjusted for visual breathing room
              backgroundImage: `url(${structure.image_border.startsWith('http') ? structure.image_border : `${BACKEND_URL}${structure.image_border}`})`,
              backgroundSize: '100% 100%', // This forces the "Stretch"
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center',
              border:'black'
            }}
          >

            {/* Contenu interne (Z-index 10 pour être au-dessus du cadre) */}
            <div className="relative z-10 h-full flex flex-col p-10 font-serif">
              
              {/* EN-TÊTE : Logos et Identification de l'État */}
              <div className="flex justify-between items-start mb-6">
                <img 
                  src={structure.image_logo_left.startsWith('http') ? structure.image_logo_left : `${BACKEND_URL}${structure.image_logo_left}`} 
                  className="h-24 w-auto object-contain" 
                  alt="Logo Gauche" 
                />                
                <div className="text-center flex-1 mx-4">
                  <div className="flex justify-center gap-8 text-sm font-bold uppercase">
                    <span>{structure.republique_fr}</span>
                    <span className="rtl">{structure.republique_ar}</span>
                  </div>
                  <div className="flex justify-center gap-40 text-xs italic text-gray-600 ml-20">
                    <span>{structure.devise_fr}</span>
                    <span className="rtl">{structure.devise_ar}</span>
                  </div>
                  <div className="grid grid-cols-2 mt-4 text-[10pt] font-semibold leading-tight">
                    <div className="border-r pr-4 border-gray-200">
                      <span className="text-center">
                        {structure.ministere_fr}<br/>
                      </span>
                      <span className="text-center mt-6">
                        {structure.groupe_fr}<br/>
                      </span>
                      <span className="text-center mt-6">
                        {structure.institut_fr}
                      </span>
                    </div>
                    <div className="text-right rtl pl-4">
                      <span>
                        {structure.ministere_ar}<br/>
                      </span>
                      <span className="text-center mr-10">
                        {structure.groupe_ar}<br/>
                      </span>
                      <span className="text-center mr-6">
                        {structure.institut_ar}
                      </span>
                    </div>
                  </div>
                </div>
                <img 
                  src={structure.image_logo_right.startsWith('http') ? structure.image_logo_right : `${BACKEND_URL}${structure.image_logo_right}`} 
                  className="h-24 w-auto object-contain" 
                  alt="Logo Droit" 
                />
              </div>

              {/* TITRE DU DIPLÔME */}
              <div className="flex justify-center items-center gap-12 my-8">
                <h1 className="text-3xl font-bold border-b-2 border-black pb-2 px-4 uppercase text-center">
                  {structure.diplome_titre_fr}
                </h1>
                <h1 className="text-3xl font-bold border-b-2 border-black pb-2 px-4 rtl text-center">
                  {structure.diplome_titre_ar}
                </h1>
              </div>

              {/* CONTENU PRINCIPAL : Citations Juridiques et Infos Étudiant */}
              <div className="grid grid-cols-2 gap-10 text-[9pt] leading-relaxed text-justify font-serif">
                
                {/* Colonne Gauche (Français) */}
                <div className="space-y-4">
                  <p className="whitespace-pre-line italic text-gray-700 leading-snug">
                    {structure.citations_juridiques_fr}
                  </p>
                  
                  <div className="pt-4 border-t border-gray-100">
                    <p>Vu le procès-verbal du jury des examens tenu en date du : <span className="font-bold underline">{structure.date_pv_jury || '...'}</span>,</p>
                    <p className="font-bold mt-1">Le diplôme de licence professionnelle en statistique</p>
                    <p>est conféré à l’étudiant(e) : <span className="font-bold text-lg italic">***</span>,</p>
                    <p>n° d’inscription : <span className="font-bold">***</span>, NNI : <span className="font-bold">***</span> ,</p>
                    <p>né le : <span className="font-bold">***</span> à : <span className="font-bold">***</span></p>
                    <p>au titre de l’année universitaire <span className="font-bold">***</span>, avec la mention : <span className="font-bold">****</span>.</p>
                    <p className="mt-4 font-bold text-md">Diplôme n° : ISS-26-10</p>
                  </div>
                </div>

                {/* Colonne Droite (Arabe) */}
                <div className="rtl space-y-4">
                  <p className="whitespace-pre-line italic text-gray-700 leading-snug">
                    {structure.citations_juridiques_ar}
                  </p>
                  
                  <div className="pt-4 border-t border-gray-100">
                    <p>وبناء على محضر لجنة الامتحانات الصادر بتاريخ: <span className="font-bold underline">{structure.date_pv_jury || '...'}</span></p>
                    <p className="font-bold mt-1">تمنح شهادة الليصانص المهنية في الإحصاء</p>
                    <p>للطالب: <span className="font-bold text-lg italic">***</span>,</p>
                    <p>رقم التسجيل: <span className="font-bold">***</span>, الرقم الوطني للتعريف: <span className="font-bold">****</span> ,</p>
                    <p>المولود: <span className="font-bold">***</span> ,في : <span className="font-bold">***</span>,</p>
                    <p>برسم السنة الجامعية: <span className="font-bold">***</span>, بتقدير : <span className="font-bold">***</span> .</p>
                    <p className="mt-4 font-bold text-md">الشهادة رقم: م-ع-إ 26-10</p>
                  </div>
                </div>
              </div>

              {/* BAS DE PAGE : Date de délivrance et Signataires */}
              <div className="mt-auto pt-8">
                <div className="text-center italic font-bold mb-6">
                   حرر في نواكشوط بتاريخ
                </div>
                
                <div className="flex justify-between items-start px-10">
                  {/* Signataire Gauche */}
                  <div className="text-center w-1/3">
                    <p className="text-[10pt] rtl font-bold mr-20">{structure.signataire_gauche_ar}</p>
                    <p className="text-[10pt] font-bold">{structure.signataire_gauche_fr}</p>
                    <div className="h-20 flex items-center justify-center">
                        {/* Zone pour le tampon / signature */}
                    </div>
                    <p className="font-bold uppercase underline text-[11pt]">{structure.signataire_gauche_nom}</p>
                  </div>

                  {/* Signataire Droit */}
                  <div className="text-center w-1/3">
                    <p className="text-[10pt] rtl font-bold mr-20">{structure.signataire_droit_ar}</p>
                    <p className="text-[10pt] font-bold">{structure.signataire_droit_fr}</p>
                    <div className="h-20 flex items-center justify-center">
                        {/* Zone pour le tampon / signature */}
                    </div>
                    <p className="font-bold uppercase underline text-[11pt]">{structure.signataire_droit_nom}</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* MODAL DE GESTION */}
        {modalOpen && (
          <StructureDiplomeModal
            structure={structure}
            onClose={() => setModalOpen(false)}
            onSaved={fetchStructure}
          />
        )}
      </div>
    </MainLayout>
  );
}