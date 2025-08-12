import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";

const API_BASE_URL = "https://localhost:7247";

export default function AdminOrders() {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/Order`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [token]);

  const updateStatus = async (id, status) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/Order/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Error actualizando estado");
      fetchOrders();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Pedidos</h1>
      <table className="w-full bg-white rounded shadow overflow-hidden">
        <thead className="bg-gray-50">
          <tr>
            <th className="p-2 border">ID</th>
            <th className="p-2 border">Usuario</th>
            <th className="p-2 border">Total</th>
            <th className="p-2 border">Estado</th>
            <th className="p-2 border">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id}>
              <td className="p-2 border">{o.id}</td>
              <td className="p-2 border">{o.userEmail || o.user?.email}</td>
              <td className="p-2 border">${o.total}</td>
              <td className="p-2 border">{o.status}</td>
              <td className="p-2 border flex gap-2">
                <button
                  onClick={() => updateStatus(o.id, "enviado")}
                  className="bg-blue-600 text-white px-3 py-1 rounded"
                >
                  Marcar Enviado
                </button>
                <button
                  onClick={() => updateStatus(o.id, "entregado")}
                  className="bg-green-600 text-white px-3 py-1 rounded"
                >
                  Marcar Entregado
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
