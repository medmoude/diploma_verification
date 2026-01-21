import { useEffect, useState } from "react";
import api from "../api/axios";
import MainLayout from "../components/Layout/MainLayout";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import VerificationDetailsModal from "../components/VerificationDetailsModal";
import { 
  faShieldHalved,
  faClock, 
  faUserGraduate, 
  faQrcode, 
  faGlobe, 
  faCircleCheck, 
  faTriangleExclamation,
  faInfoCircle
 } from "@fortawesome/free-solid-svg-icons";

export default function Verifications() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVerification, setSelectedVerification] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);


  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    const res = await api.get("verifications/");
    setLogs(res.data.reverse()); // newest first
    setLoading(false);
  };

  const uniqueIPs = new Set(logs.map(l => l.adresse_ip)).size;
  const failedCount = logs.filter(l => l.statut !== "succes").length;

  return (
    <MainLayout title="Journal des Vérifications">
      <div className="space-y-6">

        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <FontAwesomeIcon icon={faShieldHalved} className="text-blue-600"/>
            Audit & Sécurité
          </h1>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-4">
          <Stat title="Total Vérifications" value={logs.length} color="blue" />
          <Stat title="IPs Uniques" value={uniqueIPs} color="indigo" />
          <Stat title="Échecs / Alertes" value={failedCount} color="red" />
          <Stat title="Dernière activité" value={logs[0]?.date_verification?.slice(0,10) || "—"} color="green" />
        </div>

        {/* Logs Table */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-gray-600">
              <tr>
                <th className="p-3 text-left">Date</th>
                <th className="p-3 text-left">IP</th>
                <th className="p-3 text-left">Statut</th>
                <th className="p-3 text-left">Détails</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" className="p-6 text-center">Chargement...</td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan="6" className="p-6 text-center text-gray-400">Aucune vérification</td></tr>
              ) : logs.map(v => (
                <tr key={v.id} className="border-t hover:bg-gray-50">
                  <td className="p-3">{new Date(v.date_verification).toLocaleString()}</td>
                  <td className="p-3 flex items-center gap-2"><FontAwesomeIcon icon={faGlobe}/>{v.adresse_ip}</td>
                  <td className={`p-3 font-semibold ${v.statut === "succes" ? "text-green-600" : "text-red-600"}`}>
                    <FontAwesomeIcon icon={v.statut === "succes" ? faCircleCheck : faTriangleExclamation}/>
                    {v.statut}
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => {
                        setSelectedVerification(v);
                        setModalOpen(true);
                      }}
                      className="text-blue-600 hover:text-blue-800"
                      title="Voir détails"
                    >
                      <FontAwesomeIcon icon={faInfoCircle} />
                    </button>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <VerificationDetailsModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        verification={selectedVerification}
      />

    </MainLayout>
  );
}

function Stat({ title, value, color }) {
  const colors = {
    blue: "text-blue-600",
    indigo: "text-indigo-600",
    red: "text-red-600",
    green: "text-green-600",
  };
  return (
    <div className="bg-white rounded-xl shadow p-4">
      <p className="text-sm text-gray-500">{title}</p>
      <p className={`text-3xl font-bold ${colors[color]}`}>{value}</p>
    </div>
  );
}
