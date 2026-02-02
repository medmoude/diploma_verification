import { useState } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faShieldHalved, 
  faRightToBracket, 
  faBars, 
  faTimes
} from "@fortawesome/free-solid-svg-icons";

export default function VerificationSidebar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-6 left-6 z-50 lg:hidden bg-white rounded-xl shadow-lg p-3 hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 border border-gray-200"
      >
        <FontAwesomeIcon
          icon={isOpen ? faTimes : faBars}
          className="text-xl text-gray-700"
        />
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden transition-opacity duration-300"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 h-screen
          w-80 bg-white text-gray-800 min-h-screen p-8 flex flex-col justify-between 
          shadow-2xl border-r border-gray-200
          z-40 transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Top section */}
        <div>
          <h1 className="text-4xl font-extrabold mb-12 tracking-wide bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
            Vérification
          </h1>

          <Link
            to="/"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-4 p-5 rounded-2xl bg-gradient-to-r from-blue-600 to-green-600 text-white hover:from-blue-700 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95"
          >
            <FontAwesomeIcon icon={faShieldHalved} className="text-2xl" />
            <span className="font-semibold text-lg">Vérifier un diplôme</span>
          </Link>
        </div>

        {/* Bottom section - Login button */}
        <div>
          <Link
            to="/login"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-4 p-5 rounded-2xl bg-green-700 text-white font-bold hover:bg-green-600 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95"
          >
            <FontAwesomeIcon icon={faRightToBracket} className="text-2xl" />
            <span className="text-lg">Connexion</span>
          </Link>
        </div>
      </aside>
    </>
  );
}