import { FaTimes, FaCopy } from "react-icons/fa";
import QRCode from "qrcode.react";

function QRCodeModal({ verification_uuid, onClose }) {
  const verificationUrl = `http://localhost:8000/api/verify/${verification_uuid}/`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(verificationUrl);
    alert("URL copiée dans le presse-papier!");
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">QR Code de Vérification</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FaTimes />
          </button>
        </div>
        
        <div className="flex flex-col items-center space-y-4">
          <div className="bg-white p-4 rounded-lg border">
            <QRCode value={verificationUrl} size={200} />
          </div>
          
          <div className="w-full">
            <p className="text-sm text-gray-600 mb-2">URL de vérification:</p>
            <div className="flex items-center">
              <input
                type="text"
                value={verificationUrl}
                readOnly
                className="flex-1 border rounded-l-lg px-3 py-2 text-sm"
              />
              <button
                onClick={copyToClipboard}
                className="bg-blue-600 text-white px-4 py-2 rounded-r-lg hover:bg-blue-700"
              >
                <FaCopy />
              </button>
            </div>
          </div>
          
          <p className="text-sm text-gray-500 text-center">
            Scannez ce QR code pour vérifier l'authenticité du certificat
          </p>
        </div>
      </div>
    </div>
  );
}

export default QRCodeModal;