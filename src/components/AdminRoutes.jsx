// src/routes/AdminRoutes.jsx
import { Routes, Route } from "react-router-dom";
import AdminDashboard from "../pages/AdminDashboard";
import LoginAdmin from "../pages/LoginAdmin";

const AdminRoutes = () => {
  return (
    <Routes>
      <Route path="/admin/login" element={<LoginAdmin />} />
      <Route path="/admin" element={<AdminDashboard />} />
      {/* Más adelante agregarás productos, órdenes y usuarios */}
    </Routes>
  );
};

export default AdminRoutes;
