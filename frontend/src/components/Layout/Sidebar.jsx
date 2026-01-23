import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCog,
  faChevronDown,
  faChevronUp,
  faGraduationCap,
  faCalendarAlt,
  faHome,
  faUsers,
  faCertificate,
  faShieldAlt,
  faSignOutAlt
} from "@fortawesome/free-solid-svg-icons";

export default function Sidebar() {
  const [open, setOpen] = useState(false); // mobile sidebar
  const [settingsOpen, setSettingsOpen] = useState(false); // dropdown
  const location = useLocation();

  // Normalize path for active link checks
  const path = location.pathname.replace(/\/$/, "");

  // Auto-open settings if on a settings page
  useEffect(() => {
    if (
      path === "/filieres" ||
      path === "/annees_universitaires" ||
      path === "/structure-diplome"
    ) {
      setSettingsOpen(true);
    }
  }, [path]);


  const mainLinks = [
    { name: "Dashboard", path: "/dashboard", icon: faHome },
    { name: "Etudiants", path: "/etudiants", icon: faUsers },
    { name: "Diplômes", path: "/diplomes", icon: faCertificate },
    { name: "Vérifications", path: "/verifications", icon: faShieldAlt },
  ];

  const handleLogout = () => {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    window.location.href = "/login";
  };

  return (
    <>
      {/* Sidebar Overlay for Mobile */}
      {open && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-40 z-10 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <div className={`fixed z-20 inset-y-0 left-0 w-64 bg-white border-r shadow-lg transform transition-transform duration-300 ${open ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:static lg:inset-0`}>
        {/* Logo */}
        <div className="flex items-center justify-center h-16 border-b px-4">
          <img alt="ISMS logo" src="/isms.jpeg" className="w-10 h-10" />
          <span className="text-xl font-bold ml-2">Admin</span>
        </div>

        {/* Navigation */}
        <nav className="mt-4 px-4">
          {/* Main Links */}
          {mainLinks.map((l) => (
            <Link
              key={l.path}
              to={l.path}
              className={`flex items-center px-3 py-3 my-1 rounded transition hover:bg-gray-200 ${
                path === l.path ? "bg-gray-200 font-semibold" : ""
              }`}
              onClick={() => setOpen(false)}
            >
              <FontAwesomeIcon icon={l.icon} className="w-5 h-5 mr-3 text-gray-600" />
              <span>{l.name}</span>
            </Link>
          ))}

          {/* Settings Dropdown */}
          <div className="mt-2">
            <button
              onClick={() => setSettingsOpen(!settingsOpen)}
              className={`flex items-center justify-between w-full px-3 py-3 my-1 rounded hover:bg-gray-200 transition ${
                path === "/filieres" || path === "/annees_universitaires" ? "bg-gray-200 font-semibold" : ""
              }`}
            >
              <div className="flex items-center">
                <FontAwesomeIcon icon={faCog} className="w-5 h-5 mr-3 text-gray-600" />
                <span>Paramètres</span>
              </div>
              <FontAwesomeIcon 
                icon={settingsOpen ? faChevronUp : faChevronDown} 
                className="w-4 h-4 text-gray-500"
              />
            </button>

            {settingsOpen && (
              <div className="ml-8 space-y-1">
                <Link
                  to="/filieres"
                  className={`flex items-center px-3 py-2 my-1 rounded hover:bg-gray-200 transition ${
                    path === "/filieres" ? "bg-gray-200 font-semibold" : ""
                  }`}
                  onClick={() => setOpen(false)}
                >
                  <FontAwesomeIcon icon={faGraduationCap} className="w-4 h-4 mr-3 text-gray-500" />
                  <span className="text-sm">Gestion Filières</span>
                </Link>
                <Link
                  to="/annees_universitaires"
                  className={`flex items-center px-3 py-2 my-1 rounded hover:bg-gray-200 transition ${
                    path === "/annees_universitaires" ? "bg-gray-200 font-semibold" : ""
                  }`}
                  onClick={() => setOpen(false)}
                >
                  <FontAwesomeIcon icon={faCalendarAlt} className="w-4 h-4 mr-3 text-gray-500" />
                  <span className="text-sm">Gestion Années Universitaires</span>
                </Link>
                <Link
                  to="/structure-diplome"
                  className={`flex items-center px-3 py-2 my-1 rounded hover:bg-gray-200 transition ${
                    path === "/structure-diplome" ? "bg-gray-200 font-semibold" : ""
                  }`}
                  onClick={() => setOpen(false)}
                >
                  <FontAwesomeIcon icon={faCertificate} className="w-4 h-4 mr-3 text-gray-500" />
                  <span className="text-sm">Structure du diplôme</span>
                </Link>
              </div>
            )}
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-3 py-3 my-1 rounded hover:bg-red-200 text-red-600 transition mt-4"
          >
            <FontAwesomeIcon icon={faSignOutAlt} className="w-5 h-5 mr-3" />
            <span>Déconnexion</span>
          </button>
        </nav>
      </div>

      {/* Mobile Toggle Button */}
      <button
        className="lg:hidden p-2 m-2 bg-gray-300 fixed top-2 left-2 z-30 rounded-md shadow-md"
        onClick={() => setOpen(!open)}
      >
        {open ? "✕" : "☰"}
      </button>
    </>
  );
}

