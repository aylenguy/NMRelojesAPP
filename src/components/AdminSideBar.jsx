// src/components/AdminSidebar.jsx
import { Link } from "react-router-dom";

const AdminSidebar = () => {
  return (
    <aside className="w-64 h-screen bg-gray-900 text-white p-6 space-y-4">
      <h2 className="text-xl font-bold mb-6">Panel Admin</h2>
      <nav className="flex flex-col space-y-3">
        <Link to="/admin/productos" className="hover:text-gray-300">
          🛍️ Productos
        </Link>
        <Link to="/admin/ordenes" className="hover:text-gray-300">
          📦 Órdenes
        </Link>
        <Link to="/admin/usuarios" className="hover:text-gray-300">
          👤 Usuarios
        </Link>
        <Link to="/admin" className="hover:text-gray-300">
          🏠 Dashboard
        </Link>
      </nav>
    </aside>
  );
};

export default AdminSidebar;
