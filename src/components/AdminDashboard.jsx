// src/pages/AdminDashboard.jsx
import AdminSidebar from "./AdminSideBar";
import { useAdmin } from "../context/AdminContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const AdminDashboard = () => {
  const { admin } = useAdmin();
  const navigate = useNavigate();

  useEffect(() => {
    if (!admin) navigate("/admin/login");
  }, [admin]);

  return (
    <div className="flex">
      <AdminSidebar />
      <main className="flex-1 p-10 bg-gray-50">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Bienvenido, Administrador
        </h1>
        <p className="text-gray-600">
          Aquí podrás gestionar productos, usuarios y pedidos.
        </p>
      </main>
    </div>
  );
};

export default AdminDashboard;
