import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome, faUsers, faGraduationCap, faFileSignature,
  faCog, faSignOutAlt, faSitemap, faCalendarAlt, faFileLines,
  faChevronDown, faChevronUp, faListCheck
} from "@fortawesome/free-solid-svg-icons";

export default function Sidebar({ user }) {
  const location = useLocation();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const path = location.pathname;
  
  // ADMIN = is_superuser=true | SCOLARITÉ = is_superuser=false
  const isAdmin = user?.is_superuser;

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  return (
    <div className="w-64 h-full bg-white border-r flex flex-col shadow-lg">
      <div className="h-16 flex items-center justify-center border-b font-bold text-xl text-indigo-700">
        <img src="/isms.jpeg" alt="Logo" className="w-8 h-8 mr-2"/>
        {isAdmin ? "Espace Admin" : "Scolarité"}
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {/* Common Links */}
        <Link to="/dashboard" className={`flex items-center p-3 rounded transition ${path === "/dashboard" ? "bg-indigo-50 text-indigo-600 font-bold" : "hover:bg-gray-100 text-gray-600"}`}>
          <FontAwesomeIcon icon={faHome} className="w-5 mr-3"/> Dashboard
        </Link>

        <Link to="/etudiants" className={`flex items-center p-3 rounded transition ${path === "/etudiants" ? "bg-indigo-50 text-indigo-600 font-bold" : "hover:bg-gray-100 text-gray-600"}`}>
          <FontAwesomeIcon icon={faUsers} className="w-5 mr-3"/> Étudiants
        </Link>

        <Link to="/diplomes" className={`flex items-center p-3 rounded transition ${path === "/diplomes" ? "bg-indigo-50 text-indigo-600 font-bold" : "hover:bg-gray-100 text-gray-600"}`}>
          <FontAwesomeIcon icon={faGraduationCap} className="w-5 mr-3"/> Diplômes
        </Link>

        {/* SCOLARITÉ SPECIFIC */}
        {!isAdmin && (
          <Link to="/gestion-pvs" className={`flex items-center p-3 rounded transition ${path === "/gestion-pvs" ? "bg-indigo-50 text-indigo-600 font-bold" : "hover:bg-gray-100 text-gray-600"}`}>
            <FontAwesomeIcon icon={faFileSignature} className="w-5 mr-3"/> PV du Jury
          </Link>
        )}

        {/* ADMIN SPECIFIC */}
        {isAdmin && (
          <>
            <Link to="/verifications" className={`flex items-center p-3 rounded transition ${path === "/verifications" ? "bg-indigo-50 text-indigo-600 font-bold" : "hover:bg-gray-100 text-gray-600"}`}>
              <FontAwesomeIcon icon={faListCheck} className="w-5 mr-3"/> Vérifications
            </Link>

            <div className="mt-4">
              <button onClick={() => setSettingsOpen(!settingsOpen)} className="flex items-center justify-between w-full p-3 rounded hover:bg-gray-100 text-gray-600">
                <div className="flex items-center"><FontAwesomeIcon icon={faCog} className="w-5 mr-3"/> Paramètres</div>
                <FontAwesomeIcon icon={settingsOpen ? faChevronUp : faChevronDown} className="w-3"/>
              </button>
              
              {settingsOpen && (
                <div className="pl-6 mt-1 space-y-1 bg-gray-50 rounded-lg">
                  <Link to="/filieres" className="block p-2 text-sm text-gray-600 hover:text-indigo-600"><FontAwesomeIcon icon={faSitemap} className="mr-2"/> Filières</Link>
                  <Link to="/annees_universitaires" className="block p-2 text-sm text-gray-600 hover:text-indigo-600"><FontAwesomeIcon icon={faCalendarAlt} className="mr-2"/> Années Univ.</Link>
                  <Link to="/structure-diplome" className="block p-2 text-sm text-gray-600 hover:text-indigo-600"><FontAwesomeIcon icon={faFileLines} className="mr-2"/> Structure</Link>
                </div>
              )}
            </div>
          </>
        )}
      </nav>

      <div className="p-4 border-t">
        <button onClick={handleLogout} className="flex items-center w-full p-3 text-red-600 hover:bg-red-50 rounded transition">
          <FontAwesomeIcon icon={faSignOutAlt} className="w-5 mr-3"/> Déconnexion
        </button>
      </div>
    </div>
  );
}