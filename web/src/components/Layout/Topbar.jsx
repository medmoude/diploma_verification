import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSignOutAlt,
  faUserCircle,
  faChevronDown,
  faUser
} from "@fortawesome/free-solid-svg-icons";

export default function Topbar({ title }) {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState({});
  const ref = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    api.get("profile/").then(res => {
      setUser(res.data);
    });
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="h-16 bg-white shadow flex items-center justify-between px-8">
      <h1 className="text-xl font-semibold text-gray-700">{title}</h1>

      {/* Profile Dropdown */}
      <div
        ref={ref}
        className="relative flex items-center gap-3 cursor-pointer select-none"
        onClick={() => setOpen(!open)}
      >
        <FontAwesomeIcon
          icon={faUserCircle}
          className="text-3xl text-gray-500"
        />

        <div className="flex flex-col leading-tight">
          <span className="font-semibold text-gray-700">
            {user.first_name} {user.last_name}
          </span>
          <span className="text-xs text-gray-400">
            Administrateur
          </span>
        </div>

        <FontAwesomeIcon
          icon={faChevronDown}
          className={`text-gray-500 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />

        {open && (
          <div className="absolute right-0 top-14 w-56 bg-white border rounded-xl shadow-xl overflow-hidden z-50">
            <button
              onClick={() => navigate("/profile")}
              className="flex items-center gap-3 w-full px-4 py-3 hover:bg-gray-100 text-gray-700"
            >
              <FontAwesomeIcon icon={faUser} />
              Profil
            </button>

            <button
              onClick={logout}
              className="flex items-center gap-3 w-full px-4 py-3 hover:bg-red-50 text-red-600"
            >
              <FontAwesomeIcon icon={faSignOutAlt} />
              Déconnexion
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
