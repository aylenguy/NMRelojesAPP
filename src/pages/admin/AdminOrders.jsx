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
    const confirmMsg = `¿Estás seguro que querés cambiar el estado del pedido #${orderId} a "${status}"?`;
    if (!window.confirm(confirmMsg)) return;

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/Venta/UpdateStatus/${orderId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status }),
        }
      );
      if (!res.ok) throw new Error("Error actualizando estado");
      fetchOrders();
    } catch (err) {
      console.error(err);
      alert(err.message || "Error al actualizar el estado");
    }
  };

  const cancelOrder = async (orderId) => {
    if (!window.confirm("¿Seguro querés cancelar esta venta?")) return;
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/Venta/CancelVenta/${orderId}/cancel`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) throw new Error("Error cancelando venta");
      fetchOrders();
    } catch (err) {
      console.error(err);
      alert(err.message || "Hubo un error al cancelar la venta");
    }
  };

  const statusColors = {
    Pendiente: "bg-yellow-100 text-yellow-800 border border-yellow-300",
    Enviado: "bg-blue-100 text-blue-800 border border-blue-300",
    Entregado: "bg-green-100 text-green-800 border border-green-300",
    Cancelado: "bg-red-100 text-red-800 border border-red-300",
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6"> Pedidos</h1>

      {orders.length === 0 ? (
        <p className="text-gray-500">No hay pedidos aún.</p>
      ) : (
        <div className="space-y-6">
          {orders.map((o) => (
            <div
              key={o.orderId}
              className="bg-white shadow-md rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition"
            >
              {/* Header */}
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Pedido #{o.orderId}</h2>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    statusColors[o.status]
                  }`}
                >
                  {o.status}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Cliente */}
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Cliente</h3>
                  <p className="text-gray-800">
                    {o.customerName} {o.customerLastname}
                  </p>
                  <p className="text-gray-600 text-sm">{o.customerEmail}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {o.clientId ? "Cliente registrado ✅" : "Invitado "}
                  </p>
                </div>

                {/* Dirección */}
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">
                    📍 Dirección de envío
                  </h3>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {o.street} {o.number} {o.department}, {o.city}, {o.province}
                    , CP {o.postalCode}
                  </p>
                </div>
              </div>

              {/* Productos */}
              <div className="mt-6">
                <h3 className="font-semibold text-gray-700 mb-2">Productos</h3>
                {o.items && o.items.length > 0 ? (
                  <div className="divide-y divide-gray-200 text-sm">
                    {o.items.map((item) => (
                      <div
                        key={item.productId}
                        className="flex justify-between py-2"
                      >
                        <span>
                          {item.productName}{" "}
                          <span className="text-gray-500">
                            x{item.quantity}
                          </span>
                        </span>
                        <span className="font-medium">${item.subtotal}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">Sin productos</p>
                )}
              </div>

              {/* Totales */}
              <div className="mt-6 border-t pt-4 text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Método de Envío:</span>
                  <span>
                    {o.shippingMethod} (${o.shippingCost})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Método de Pago:</span>
                  <span>{o.paymentMethod}</span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span>${o.total}</span>
                </div>
              </div>

              {/* Acciones */}
              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  onClick={() => updateStatus(o.orderId, "Enviado")}
                  disabled={o.status === "Cancelado"}
                  className={`px-4 py-2 rounded-lg text-white text-sm ${
                    o.status === "Cancelado"
                      ? "bg-gray-400"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  Marcar Enviado
                </button>
                <button
                  onClick={() => updateStatus(o.orderId, "Entregado")}
                  disabled={o.status === "Cancelado"}
                  className={`px-4 py-2 rounded-lg text-white text-sm ${
                    o.status === "Cancelado"
                      ? "bg-gray-400"
                      : "bg-green-600 hover:bg-green-700"
                  }`}
                >
                  Marcar Entregado
                </button>
                <button
                  onClick={() => cancelOrder(o.orderId)}
                  disabled={o.status === "Cancelado"}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
