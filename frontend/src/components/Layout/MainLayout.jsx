import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function MainLayout({ title, children }) {
  const navigate = useNavigate();

  useEffect(() =>{
    const token = localStorage.getItem('access');

    if (!token){
      navigate("/login");
    }

  }, [navigate]);

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar title={title} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}

export default MainLayout;
