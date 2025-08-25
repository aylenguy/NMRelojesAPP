import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";

const API_BASE_URL = "https://localhost:7247";

export default function AdminOrders() {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/Venta/GetAll/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Error al cargar pedidos");
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (token) fetchOrders();
  }, [token]);

  const updateStatus = async (orderId, status) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/Venta/${orderId}/status`, {
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
      <table className="w-full bg-white rounded shadow overflow-hidden text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="p-2 border">ID</th>
            <th className="p-2 border">Cliente</th>
            <th className="p-2 border">Email</th>
            <th className="p-2 border">Dirección</th>
            <th className="p-2 border">Método Envío</th>
            <th className="p-2 border">Costo Envío</th>
            <th className="p-2 border">Método Pago</th>
            <th className="p-2 border">Notas</th>
            <th className="p-2 border">Fecha</th>
            <th className="p-2 border">Productos</th>
            <th className="p-2 border">Total</th>
            <th className="p-2 border">Estado</th>
            <th className="p-2 border">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.orderId}>
              <td className="p-2 border">{o.orderId}</td>
              <td className="p-2 border">
                {o.customerName} {o.customerLastname}
                <br />
                {o.clientId ? (
                  <span className="text-xs text-green-600">(Registrado)</span>
                ) : (
                  <span className="text-xs text-gray-500">(Invitado)</span>
                )}
              </td>
              <td className="p-2 border">{o.customerEmail}</td>
              <td className="p-2 border">
                {o.street} {o.number} {o.department}, {o.city}, {o.province},{" "}
                {o.postalCode}
              </td>
              <td className="p-2 border">{o.ShippingMethod}</td>
              <td className="p-2 border">${o.shippingCost}</td>
              <td className="p-2 border">{o.paymentMethod}</td>
              <td className="p-2 border">{o.notes}</td>
              <td className="p-2 border">
                {new Date(o.date).toLocaleString("es-AR", {
                  timeZone: "America/Argentina/Buenos_Aires",
                  dateStyle: "short",
                  timeStyle: "short",
                })}
              </td>
              <td className="p-2 border">
                {o.items && o.items.length > 0 ? (
                  <ul className="list-disc pl-4">
                    {o.items.map((item) => (
                      <li key={item.productId}>
                        {item.productName} (x{item.quantity}) - ${item.subtotal}
                      </li>
                    ))}
                  </ul>
                ) : (
                  "Sin productos"
                )}
              </td>
              <td className="p-2 border">${o.total}</td>
              <td className="p-2 border">{o.status}</td>
              <td className="p-2 border flex gap-2">
                <button
                  onClick={() => updateStatus(o.orderId, "Enviado")}
                  className="bg-blue-600 text-white px-3 py-1 rounded"
                >
                  Marcar Enviado
                </button>
                <button
                  onClick={() => updateStatus(o.orderId, "Entregado")}
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
