import { Html5QrcodeScanner } from "html5-qrcode";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function ScanQRModal({ open, onClose }) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) return;

    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      { fps: 10, qrbox: 250 },
      false
    );

    scanner.render(
      (decodedText) => {
        scanner.clear();
        const uuid = decodedText.split("/").pop();
        navigate(`/verify/${uuid}`);
      },
      () => {}
    );

    return () => scanner.clear();
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center">
      <div className="bg-white p-6 rounded-xl w-96">
        <h2 className="font-bold mb-4">Scanner le QR Code</h2>
        <div id="qr-reader" />
        <button onClick={onClose} className="mt-4 text-red-600">
          Fermer
        </button>
      </div>
    </div>
  );
}
