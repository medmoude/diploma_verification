import { de } from "date-fns/locale";
import { Html5Qrcode } from "html5-qrcode";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ScanQRModal({ open, onClose }) {
  const navigate = useNavigate();
  const scannerRef = useRef(null);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  const startScan = async () => {
    if (scanning) return;

    const html5QrCode = new Html5Qrcode("qr-reader");
    scannerRef.current = html5QrCode;
    setScanning(true);

    try {
      await html5QrCode.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 250 },
        (decodedText) => {
          html5QrCode.stop().then(() => {
            setScanning(false);
            onClose();
            navigate(decodedText);
          });
        },
        () => {}
      );
    } catch (err) {
      console.error("Camera error:", err);
      setScanning(false);
      alert("Accès à la caméra refusé. Vérifiez les permissions du navigateur.");
    }
  };

  const stopScan = () => {
    if (scannerRef.current?.isScanning) {
      scannerRef.current.stop().catch(() => {});
    }
    setScanning(false);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl w-96 shadow-xl">
        <h2 className="font-bold mb-4 text-center">
          Scanner le QR Code
        </h2>

        <div
          id="qr-reader"
          className="rounded overflow-hidden bg-gray-100"
          style={{ minHeight: "260px" }}
        />

        {!scanning && (
          <button
            onClick={startScan}
            className="mt-4 w-full py-2 bg-blue-600 text-white rounded font-semibold hover:bg-blue-700"
          >
            Démarrer le scan
          </button>
        )}

        <button
          onClick={stopScan}
          className="mt-2 w-full py-2 text-red-600 font-semibold hover:bg-red-50 rounded"
        >
          Fermer
        </button>
      </div>
    </div>
  );
}
