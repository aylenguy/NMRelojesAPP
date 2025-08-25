// src/components/ProtectedRoute.jsx
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ requiredRole, allowGuest = false }) {
  const { loading, user } = useAuth();

  if (loading) return <div className="p-6">Cargando...</div>;

  // 🔑 Caso invitado: si no hay usuario pero se permite guest
  if (!user) {
    if (allowGuest) return <Outlet />;
    return <Navigate to="/login" replace />;
  }

  // 🔑 Si se pide un rol específico
  if (requiredRole && user.role.toLowerCase() !== requiredRole.toLowerCase()) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
