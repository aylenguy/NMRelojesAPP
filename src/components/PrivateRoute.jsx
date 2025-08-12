// src/components/PrivateRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function PrivateRoute({ children, role }) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (role && user?.role?.toLowerCase() !== role.toLowerCase()) {
    return (
      <div className="p-8 text-center text-red-600 font-semibold">
        🚫 No tienes permisos para acceder a esta página
      </div>
    );
  }

  return children;
}
