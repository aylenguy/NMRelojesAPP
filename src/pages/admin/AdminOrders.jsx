import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";

const API_BASE_URL = "https://localhost:7247";

export default function AdminOrders() {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);

  // 📦 Obtener pedidos
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

  // 📦 Obtener productos
  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/Product/GetAllProducts`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Error al cargar productos");
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchOrders();
      fetchProducts();
    }
  }, [token]);

  // 🔹 Cambiar estado de pedido
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
      alert(err.message || "Error al actualizar el estado");
    }
  };

  // 🔹 Cancelar pedido
  const cancelOrder = async (orderId) => {
    if (!window.confirm("¿Estás seguro de cancelar esta venta?")) return;
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/Venta/CancelVenta/${orderId}/cancel`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData?.error || "Error cancelando la venta");
      }
      fetchOrders();
      fetchProducts();
    } catch (err) {
      console.error(err);
      alert(err.message || "Hubo un error al cancelar la venta");
    }
  };

  // 🔹 Colores según estado
  const statusColors = {
    Pendiente: "bg-yellow-200",
    Enviado: "bg-blue-200",
    Entregado: "bg-green-200",
    Cancelado: "bg-red-100",
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
            <tr key={o.orderId} className={statusColors[o.status] || ""}>
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
              <td className="p-2 border">{o.shippingMethod}</td>
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
                        {item.productName} (x{item.quantity}) - ${item.subtotal}{" "}
                        <span className="text-xs text-gray-500">
                          (Stock actual: {item.currentStock})
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  "Sin productos"
                )}
              </td>
              <td className="p-2 border">${o.total}</td>
              <td className="p-2 border font-bold">{o.status}</td>
              <td className="p-2 border flex gap-2 flex-wrap">
                <button
                  onClick={() => updateStatus(o.orderId, "Enviado")}
                  disabled={o.status === "Cancelado"}
                  className={`px-3 py-1 rounded text-white ${
                    o.status === "Cancelado" ? "bg-gray-400" : "bg-blue-600"
                  }`}
                >
                  Marcar Enviado
                </button>
                <button
                  onClick={() => updateStatus(o.orderId, "Entregado")}
                  disabled={o.status === "Cancelado"}
                  className={`px-3 py-1 rounded text-white ${
                    o.status === "Cancelado" ? "bg-gray-400" : "bg-green-600"
                  }`}
                >
                  Marcar Entregado
                </button>
                <button
                  onClick={() => cancelOrder(o.orderId)}
                  disabled={o.status === "Cancelado"}
                  className="bg-red-600 text-white px-3 py-1 rounded"
                >
                  Cancelar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
