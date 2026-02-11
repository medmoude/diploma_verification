import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

function MainLayout({ title, children }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('access');
    if (!token) {
      navigate("/login");
      return;
    }
    api.get("profile/")
      .then(res => setUser(res.data))
      .catch(() => navigate("/login"));
  }, [navigate]);

  if (!user) return <div className="flex h-screen items-center justify-center">Chargement...</div>;

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar user={user} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar title={title} user={user} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}

export default MainLayout;