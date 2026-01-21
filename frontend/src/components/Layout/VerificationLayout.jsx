import { useState } from "react";
import VerificationSidebar from "./VerificationSidebar";
import ScanQRModal from "../ScanQRModal";
import UploadPdfModal from "../UploadPdfModal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faQrcode, faCloudUploadAlt } from "@fortawesome/free-solid-svg-icons";

export default function VerificationLayout({ children }) {
  const [scanOpen, setScanOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);


  return (
    <>
    <div className="relative min-h-screen flex bg-gradient-to-br from-slate-50 via-white to-indigo-100 overflow-hidden">

      {/* Background glows */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-300/30 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-[28rem] h-[28rem] bg-purple-300/20 rounded-full blur-3xl" />

      {/* Sidebar */}
      <VerificationSidebar />

      {/* Main content */}
      <main className="relative flex-1 p-10 overflow-y-auto">
        <div className="min-h-full rounded-3xl bg-white/70 backdrop-blur-xl shadow-2xl border border-white/50 p-10 animate-fade-in space-y-10">
        <h1 className="text-3xl font-bold text-gray-800">Vérification des diplômes</h1>
          {/* Buttons row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Scan button */}
            <button
              onClick={() => setScanOpen(true)}
              className="group relative flex items-center justify-center gap-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 px-10 py-8 text-white text-xl font-semibold shadow-xl hover:shadow-emerald-500/40 transition-all duration-300 hover:scale-[1.03] active:scale-95"
            >
              <FontAwesomeIcon icon={faQrcode} className="text-2xl" />
              Scanner le diplôme
              <span className="absolute inset-0 rounded-2xl ring-2 ring-white/30"></span>
            </button>

            {/* Upload button */}
            <button
              onClick={() => setUploadOpen(true)}
              className="group relative flex items-center justify-center gap-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-blue-600 px-10 py-8 text-white text-xl font-semibold shadow-xl hover:shadow-blue-500/40 transition-all duration-300 hover:scale-[1.03] active:scale-95"
            >
              <FontAwesomeIcon icon={faCloudUploadAlt} className="text-2xl" />
              Téléverser le diplôme
              <span className="absolute inset-0 rounded-2xl ring-2 ring-white/30"></span>
            </button>
          </div>

          {/* Render children if any */}
          {children}
        </div>
      </main>
    </div>

    <ScanQRModal open={scanOpen} onClose={() => setScanOpen(false)} />
    <UploadPdfModal open={uploadOpen} onClose={() => setUploadOpen(false)} />
    </>
  );
}
