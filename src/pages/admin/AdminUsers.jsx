import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";

const API_BASE_URL = "https://localhost:7247";

export default function AdminUsers() {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/User`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [token]);

  const handleDelete = async (id) => {
    if (!window.confirm("¿Eliminar usuario?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/User/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Error eliminando usuario");
      fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  const changeRole = async (id, newRole) => {
    try {
      // Este endpoint es ejemplo: adaptalo si tu backend usa otro path/body
      const res = await fetch(`${API_BASE_URL}/api/User/${id}/role`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userType: newRole }),
      });
      if (!res.ok) throw new Error("Error cambiando rol");
      fetchUsers();
    } catch (err) {
      console.error(err);
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
          {users.map((u) => (
            <tr key={u.id}>
              <td className="p-2 border">{u.id}</td>
              <td className="p-2 border">
                {u.name || u.userName || u.UserName}
              </td>
              <td className="p-2 border">{u.email}</td>
              <td className="p-2 border">{u.userType || u.role}</td>
              <td className="p-2 border flex gap-2">
                <button
                  onClick={() =>
                    changeRole(
                      u.id,
                      u.userType === "admin" ? "cliente" : "admin"
                    )
                  }
                  className="bg-yellow-500 text-white px-3 py-1 rounded"
                >
                  Toggle Rol
                </button>
                <button
                  onClick={() => handleDelete(u.id)}
                  className="bg-red-600 text-white px-3 py-1 rounded"
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
