export default function Alert({ type, children, onClose }) {
  const colors = {
    success: "bg-green-50 border-green-500 text-green-800",
    error: "bg-red-50 border-red-500 text-red-800",
    warning: "bg-amber-50 border-amber-500 text-amber-800",
    info: "bg-blue-50 border-blue-500 text-blue-800"
  };

  return (
    <div className={`p-4 mb-3 rounded-md border-l-4 relative ${colors[type]}`}>
      {children}
      <button type="button" className="absolute top-3 right-3 text-gray-500 hover:text-gray-800" onClick={onClose}>✕</button>
    </div>
  );
}
