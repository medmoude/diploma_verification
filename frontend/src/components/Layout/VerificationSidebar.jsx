import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShieldHalved, faRightToBracket } from "@fortawesome/free-solid-svg-icons";

export default function VerificationSidebar() {
  return (
    <aside className="w-64 bg-gradient-to-b from-indigo-600 via-purple-600 to-pink-600 text-white min-h-screen p-6 flex flex-col justify-between shadow-xl rounded-r-3xl">
      
      {/* Top section */}
      <div>
        <h1 className="text-3xl font-extrabold mb-12 tracking-wide">
          Vérification
        </h1>

        <Link
          to="/verify-choice"
          className="flex items-center gap-3 p-4 rounded-2xl bg-white/10 hover:bg-white/20 transition-all duration-300 shadow-sm mb-4"
        >
          <FontAwesomeIcon icon={faShieldHalved} className="text-xl" />
          Vérifier un diplôme
        </Link>
      </div>

      {/* Bottom section - Login button */}
      <div>
        <Link
          to="/login"
          className="flex items-center gap-3 p-4 rounded-2xl bg-white text-purple-700 font-semibold hover:bg-purple-50 hover:text-purple-900 transition-all duration-300 shadow-md"
        >
          <FontAwesomeIcon icon={faRightToBracket} className="text-xl" />
          Login
        </Link>
      </div>
    </aside>
  );
}
