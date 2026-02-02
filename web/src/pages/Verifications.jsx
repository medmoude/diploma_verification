import { useEffect, useState } from "react";
import api from "../api/axios";
import MainLayout from "../components/Layout/MainLayout";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import VerificationDetailsModal from "../components/VerificationDetailsModal";
import Pagination from "../components/Pagination";
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
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10); // default items per page
  const [filterIP, setFilterIP] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterDate, setFilterDate] = useState("");




  useEffect(() => {
    loadLogs();
  }, []);

  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(logs.length / pageSize));
    if (page > maxPage) setPage(1);
  }, [logs.length, pageSize]);


  const loadLogs = async () => {
    const res = await api.get("verifications/");
    setLogs(res.data.reverse()); // newest first
    setLoading(false);
  };

  const uniqueIPs = new Set(logs.map(l => l.adresse_ip)).size;
  const failedCount = logs.filter(l => l.statut !== "succes").length;

  const filteredLogs = logs
    .filter(l => !filterIP || l.adresse_ip.includes(filterIP))
    .filter(l => !filterStatus || l.statut === filterStatus)
    .filter(l => !filterDate || l.date_verification.slice(0,10) === filterDate);

  const totalPages = Math.ceil(filteredLogs.length / pageSize);
  const displayedLogs = filteredLogs.slice((page - 1) * pageSize, page * pageSize);



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
          <div className="flex flex-wrap gap-3 justify-end mb-3 p-3">
            <input
              type="text"
              value={filterIP}
              onChange={e => { setFilterIP(e.target.value); setPage(1); }}
              placeholder="Filtrer par IP..."
              className="border px-3 py-2 rounded shadow-sm"
            />

            <select
              value={filterStatus}
              onChange={e => { setFilterStatus(e.target.value); setPage(1); }}
              className="border px-3 py-2 rounded"
            >
              <option value="">Tous statuts</option>
              <option value="succes">Success</option>
              <option value="failed">Failed</option>
            </select>

            <input
              type="date"
              value={filterDate}
              onChange={e => { setFilterDate(e.target.value); setPage(1); }}
              className="border px-3 py-2 rounded"
            />
          </div>

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
              ) : displayedLogs.length === 0 ? (
                <tr><td colSpan="6" className="p-6 text-center text-gray-400">Aucune vérification</td></tr>
              ) : displayedLogs.map(v => (
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

          <div className="flex items-center justify-between mt-4">

            <div className="flex justify-center flex-1">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={p => setPage(p)}
              />
            </div>

            <div>
              <select
                value={pageSize}
                onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}
                className="p-2 mr-3 mb-3 border rounded-lg"
              >
                {[5, 10, 20, 50].map(n => (
                  <option key={n} value={n}>{n} / page</option>
                ))}
              </select>
            </div>

          </div>
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
