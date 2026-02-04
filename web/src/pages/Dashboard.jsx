import { useEffect, useState } from "react";
import MainLayout from "../components/Layout/MainLayout";
import api from "../api/axios";

import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
  BarChart, Bar, CartesianGrid, Legend
} from "recharts";

export default function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get("dashboard-stats/").then(res => setData(res.data));
  }, []);

  // if (!data) return <MainLayout title="Dashboard">Loading...</MainLayout>;

  const COLORS = ["#10B981", "#EF4444"];

  return (
    <MainLayout title="Dashboard">
      <div className="grid gap-8">

        {/* Show totals quickly */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            ["Étudiants", data.students_total],
            ["Diplômes", data.diplomes_total],
            ["Vérifications", data.verifications_total],
            ["7 derniers jours", data.verifications_last_7_days],
          ].map(([label, value]) => (
            <div key={label} className="bg-white p-4 rounded-xl shadow text-center">
              <div className="text-sm text-gray-500">{label}</div>
              <div className="text-3xl font-bold">{value}</div>
            </div>
          ))}
        </div>

        {/* Students per Filiere */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-semibold mb-4">Étudiants par Filière</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.students_by_filiere}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="filiere__nom_filiere_fr" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#22C55E" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Students per Academic Year */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-semibold mb-4">Étudiants par Année Universitaire</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.students_by_annee}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="annee_universitaire__code_annee" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#0EA5E9" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Age distribution */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-semibold mb-4">Distribution des âges</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.age_distribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="age" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#A855F7" />
            </BarChart>
          </ResponsiveContainer>
          <p className="text-sm text-gray-500 mt-2">Âge moyen: {Number(data.avg_age || 0).toFixed(1)}</p>
        </div>

        {/* Verifications per day */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-semibold mb-4">Vérifications par jour</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.verifications_by_day}>
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="total" stroke="#3B82F6" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Status pie */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-semibold mb-4">Répartition des vérification</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data.status_counts}
                dataKey="count"
                nameKey="statut"
                cx="50%"
                cy="50%"
                outerRadius={100}
              >
                {data.status_counts.map((_, i) => (
                  <Cell key={i} fill={COLORS[i]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Diplomes per filiere */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-semibold mb-4">Diplômes par Filière</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.diplome_by_filiere}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="specialite__nom_filiere_fr" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#6366F1" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Diplomes per year */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-semibold mb-4">Diplômes par Année</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.diplome_by_year}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="annee_obtention" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#F59E0B" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Annulation stat */}
        <div className="bg-white p-6 rounded-xl shadow text-center">
          <h2 className="text-xl font-semibold">Diplômes annulés</h2>
          <p className="text-5xl font-bold text-red-600 mt-4">
            {data.annules}
          </p>
        </div>

      </div>
    </MainLayout>
  );
}
