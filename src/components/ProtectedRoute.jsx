import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Protege rutas para que solo admins (o roles concretos) accedan
export default function ProtectedRoute({ requiredRole = "admin" }) {
  const { loading, user } = useAuth();

  if (loading) return <div className="p-6">Cargando...</div>;

  const hasAccess = user?.role === requiredRole;

  return hasAccess ? <Outlet /> : <Navigate to="/" replace />;
}
