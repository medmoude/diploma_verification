import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // <--- 1. Import this
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserCircle, faChevronDown, faSignOutAlt, faUser } from "@fortawesome/free-solid-svg-icons";

export default function Topbar({ title, user }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();
  const navigate = useNavigate(); // <--- 2. Initialize hook

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // <--- 3. Add Logout Logic
  const handleLogout = () => {
    localStorage.clear(); // Clears JWT tokens
    navigate("/login");   // Redirects to login
  };

  return (
    <div className="h-16 bg-white shadow-sm border-b flex items-center justify-between px-8 z-20 relative">
      <h1 className="text-xl font-bold text-gray-800">{title}</h1>

      <div ref={ref} className="relative">
        {/* Trigger */}
        <div 
          className="flex items-center gap-3 cursor-pointer select-none" 
          onClick={() => setOpen(!open)}
        >
          <div className="text-right hidden sm:block">
            <div className="font-bold text-sm text-gray-700">
              {user?.first_name} {user?.last_name}
            </div>
            <div className={`text-xs px-2 py-0.5 rounded-full inline-block ${user?.is_superuser ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}`}>
              {user?.is_superuser ? 'Administrateur' : 'Scolarité'}
            </div>
          </div>
          <FontAwesomeIcon icon={faUserCircle} className="text-3xl text-gray-400" />
          <FontAwesomeIcon icon={faChevronDown} className={`text-gray-400 text-xs transition-transform ${open ? "rotate-180" : ""}`} />
        </div>

        {/* Dropdown Menu */}
        {open && (
          <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 border z-50">
            {/* Profil Button */}
            <div 
              onClick={() => navigate("/profile")} 
              className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer flex items-center gap-2"
            >
              <FontAwesomeIcon icon={faUser} /> Profil
            </div>
            
            {/* Logout Button */}
            <div 
              onClick={handleLogout} 
              className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 cursor-pointer flex items-center gap-2 border-t"
            >
              <FontAwesomeIcon icon={faSignOutAlt} /> Déconnexion
            </div>
          </div>
        )}
      </div>
    </div>
  );
}