import React from "react";
import { Link, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function AdminLayout() {
  const { logout } = useAuth();

  return (
    <div className="flex min-h-screen bg-gray-100">
      <aside className="w-64 bg-gray-900 text-white p-6 flex flex-col">
        <h2 className="text-2xl font-bold mb-6">Panel Admin</h2>
        <nav className="flex flex-col gap-2">
          <Link to="/admin" className="px-3 py-2 rounded hover:bg-gray-800">
            📊 Dashboard
          </Link>
          <Link
            to="/admin/products"
            className="px-3 py-2 rounded hover:bg-gray-800"
          >
            📦 Productos
          </Link>
          <Link
            to="/admin/users"
            className="px-3 py-2 rounded hover:bg-gray-800"
          >
            👥 Usuarios
          </Link>
          <Link
            to="/admin/orders"
            className="px-3 py-2 rounded hover:bg-gray-800"
          >
            🛒 Pedidos
          </Link>
        </nav>

        <div className="mt-auto">
          <button
            onClick={() => logout()}
            className="w-full bg-red-600 hover:bg-red-500 text-white py-2 rounded mt-6"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
}
