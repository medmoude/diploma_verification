import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowsRotate, faCertificate } from "@fortawesome/free-solid-svg-icons";

export default function GeneratingModal({ open }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-blue-900/40 backdrop-blur-sm flex items-center justify-center z-[100] transition-all duration-500">
      <div className="bg-white p-8 rounded-2xl shadow-2xl flex flex-col items-center scale-110 animate-bounce-slow">
        <div className="relative mb-4">
          <FontAwesomeIcon icon={faCertificate} className="text-6xl text-blue-600 animate-pulse" />
          <FontAwesomeIcon 
            icon={faArrowsRotate} 
            className="text-2xl text-blue-400 absolute -top-2 -right-2 animate-spin" 
          />
        </div>
        <h3 className="text-xl font-bold text-gray-800">Génération en cours...</h3>
        <p className="text-gray-500 text-sm mt-2">Veuillez patienter quelques instants</p>
        
        {/* Progress bar animation */}
        <div className="w-48 h-1.5 bg-gray-100 rounded-full mt-4 overflow-hidden">
          <div className="h-full bg-blue-600 animate-loading-bar"></div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes loading-bar {
          0% { width: 0%; }
          50% { width: 70%; }
          100% { width: 100%; }
        }
        .animate-loading-bar { animation: loading-bar 2s infinite ease-in-out; }
        .animate-bounce-slow { animation: bounce 3s infinite; }
        @keyframes bounce {
          0%, 100% { transform: translateY(0) scale(1.1); }
          50% { transform: translateY(-10px) scale(1.1); }
        }
      `}</style>
    </div>
  );
}