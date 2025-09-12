// src/pages/admin/AdminOrders.jsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";

const API_BASE_URL = import.meta.env.VITE_API_URL;

export default function AdminOrders() {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/Venta/All`, {
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
    if (
      !window.confirm(
        `¿Cambiar el estado del pedido #${orderId} a "${status}"?`
      )
    )
      return;
    try {
      const res = await fetch(`${API_BASE_URL}/Venta/UpdateStatus/${orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }), // 👈 manda el body
      });
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
      const res = await fetch(`${API_BASE_URL}/Venta/Cancel/${orderId}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Error cancelando venta");
      fetchOrders();
    } catch (err) {
      console.error(err);
      alert(err.message || "Hubo un error al cancelar la venta");
    }
  };

  const statusColors = {
    Pendiente: "bg-yellow-100 text-yellow-800",
    Enviado: "bg-blue-100 text-blue-800",
    Entregado: "bg-green-100 text-green-800",
    Cancelado: "bg-red-100 text-red-800",
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Pedidos</h1>

      {orders.length === 0 ? (
        <p className="text-gray-500">No hay pedidos aún.</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {orders.map((o) => {
            // 🔹 Calcular subtotal, descuentos y total final
            const subtotal =
              o.items?.reduce(
                (acc, i) => acc + (i.subtotal ?? i.quantity * i.price),
                0
              ) || 0;

            const method = (o.paymentMethod || "").toLowerCase();
            const paymentDiscount = o.paymentDiscount || 0;
            const couponDiscount = o.couponDiscount || 0;

            const totalFinal =
              subtotal -
              paymentDiscount -
              couponDiscount +
              (o.shippingCost || 0);

            return (
              <div
                key={o.orderId}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition p-6 border border-gray-200 flex flex-col justify-between min-h-[400px]"
              >
                {/* Header */}
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-bold">Pedido #{o.orderId}</h2>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      statusColors[o.status]
                    }`}
                  >
                    {o.status}
                  </span>
                </div>

                {/* Cliente y Dirección */}
                <div className="mb-4 space-y-2 flex flex-col gap-1">
                  <div className="flex flex-col">
                    <h3 className="font-semibold text-gray-700">Cliente</h3>
                    <p className="text-gray-600 text-sm w-full">
                      {o.customerName} {o.customerLastname}
                    </p>
                    <p className="text-gray-600 text-sm w-full">
                      {o.customerEmail}
                    </p>
                    <p className="text-xs text-gray-500 w-full">
                      {o.clientId ? "Cliente registrado ✅" : "Invitado"}
                    </p>
                  </div>
                  <div className="flex flex-col">
                    <h3 className="font-semibold text-gray-700">Dirección</h3>
                    <p className="text-gray-700 text-sm leading-relaxed w-full">
                      {o.street} {o.number} {o.department}, {o.city},{" "}
                      {o.province}, CP {o.postalCode}
                    </p>
                  </div>
                </div>

                {/* Productos */}
                <div className="mb-4 flex flex-col">
                  <h3 className="font-semibold text-gray-700 mb-2">
                    Productos
                  </h3>
                  {o.items && o.items.length > 0 ? (
                    <ul className="divide-y divide-gray-200 text-sm w-full">
                      {o.items.map((item) => (
                        <li
                          key={item.productId}
                          className="py-1 flex justify-between w-full"
                        >
                          <span className="w-2/3">
                            {item.productName}{" "}
                            <span className="text-gray-500">
                              x{item.quantity}
                            </span>
                          </span>
                          <span className="font-medium w-1/3 text-right">
                            ${item.subtotal}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500 text-sm">Sin productos</p>
                  )}
                </div>

                {/* Totales */}
                <div className="mb-4 border-t pt-3 text-sm space-y-1 flex flex-col">
                  <div className="flex justify-between w-full">
                    <span className="text-gray-600">Envío:</span>
                    <span>
                      ${o.shippingCost} ({o.shippingMethod})
                    </span>
                  </div>
                  <div className="flex justify-between w-full">
                    <span className="text-gray-600">Pago:</span>
                    <span>{o.paymentMethod}</span>
                  </div>

                  {paymentDiscount > 0 && (
                    <div className="flex justify-between w-full text-green-700">
                      <span>Descuento por pago:</span>
                      <span>- ${paymentDiscount.toFixed(2)}</span>
                    </div>
                  )}

                  {couponDiscount > 0 && (
                    <div className="flex justify-between w-full text-green-700">
                      <span>Descuento por cupón:</span>
                      <span>- ${couponDiscount.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between font-bold text-lg w-full">
                    <span>Total final:</span>
                    <span>${totalFinal.toFixed(2)}</span>
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex flex-col gap-2 mt-auto">
                  <button
                    onClick={() => updateStatus(o.orderId, "Enviado")}
                    disabled={o.status === "Cancelado"}
                    className={`w-full px-2 py-1.5 rounded-lg text-white text-xs font-medium transition ${
                      o.status === "Cancelado"
                        ? "bg-gray-300 cursor-not-allowed"
                        : "bg-blue-400 hover:bg-blue-500"
                    }`}
                  >
                    Enviar
                  </button>

                  <button
                    onClick={() => updateStatus(o.orderId, "Entregado")}
                    disabled={o.status === "Cancelado"}
                    className={`w-full px-2 py-1.5 rounded-lg text-white text-xs font-medium transition ${
                      o.status === "Cancelado"
                        ? "bg-gray-300 cursor-not-allowed"
                        : "bg-green-400 hover:bg-green-500"
                    }`}
                  >
                    Entregado
                  </button>

                  <button
                    onClick={() => cancelOrder(o.orderId)}
                    disabled={o.status === "Cancelado"}
                    className="w-full px-2 py-1.5 rounded-lg text-white text-xs font-medium bg-red-400 hover:bg-red-500 transition"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
