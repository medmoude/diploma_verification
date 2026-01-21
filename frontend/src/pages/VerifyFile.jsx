import { useLocation, useNavigate } from "react-router-dom";

export default function VerifyFile() {
  const { state } = useLocation();
  const navigate = useNavigate();

  if (!state?.valid) {
    return <h1>Diplôme invalide</h1>;
  }

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold mb-6">Diplôme valide</h1>
      <p>Nom: {state.nom_prenom_fr} </p>
      <p>Filière: {state.filiere}</p>
      <p>Année: {state.annee}</p>

      <button
        className="mt-6 text-blue-600"
        onClick={() => navigate(`/verify/${state.verification_uuid}`)}
      >
        Voir version officielle
      </button>
    </div>
  );
}
