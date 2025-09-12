import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";

const API_BASE_URL = import.meta.env.VITE_API_URL;

export default function AdminUsers() {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔹 Obtener lista de usuarios
  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/Admin/GetAllUsers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Error obteniendo usuarios");

      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error("Error cargando usuarios", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchUsers();
    }
  }, [token]);

  // 🔹 Eliminar usuario
  const handleDelete = async (id) => {
    if (!window.confirm("¿Eliminar usuario?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/Admin/DeleteUser/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Error eliminando usuario");
      fetchUsers();
    } catch (err) {
      console.error("Error eliminando usuario", err);
    }
  };

  if (loading) return <div>Cargando usuarios...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Usuarios</h1>
      <table className="w-full bg-white rounded shadow overflow-hidden">
        <thead className="bg-gray-50">
          <tr>
            <th className="p-2 border">ID</th>
            <th className="p-2 border">Nombre</th>
            <th className="p-2 border">Email</th>
            <th className="p-2 border">Rol</th>
            <th className="p-2 border">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {users.length > 0 ? (
            users.map((u) => (
              <tr key={u.id}>
                <td className="p-2 border">{u.id}</td>
                <td className="p-2 border">{u.userName}</td>
                <td className="p-2 border">{u.email}</td>
                <td className="p-2 border">
                  {u.userType === "Admin" ? "Admin" : "Cliente"}
                </td>
                <td className="p-2 border">
                  <button
                    onClick={() => handleDelete(u.id)}
                    className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="p-4 border text-center text-gray-500">
                No hay usuarios registrados
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
