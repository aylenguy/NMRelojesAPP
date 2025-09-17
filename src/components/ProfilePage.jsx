import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

const API_BASE_URL = import.meta.env.VITE_API_URL;

export default function ProfilePage() {
  const { token, user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);

    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(`${API_BASE_URL}/Venta/MyOrdersAll/MyOrdersAll`, {
        headers,
      });
      if (!res.ok) throw new Error("Error cargando tus pedidos");
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "pendiente":
        return "bg-yellow-100 text-yellow-800";
      case "enviado":
        return "bg-blue-100 text-blue-800";
      case "entregado":
        return "bg-green-100 text-green-800";
      case "cancelado":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        Hola, {user?.name || "invitado"}
      </h1>

      {loading ? (
        <p className="text-gray-600">Cargando tus pedidos...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : orders.length === 0 ? (
        <p className="text-gray-600">Todavía no realizaste ninguna compra.</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {orders.map((o) => {
            const paymentDiscount = o.paymentDiscount || 0;
            const couponDiscount = o.couponDiscount || 0;
            const totalFinal = o.totalConDescuento || o.total;

            return (
              <div
                key={o.orderId}
                className="bg-white rounded-xl shadow-md p-5 border border-gray-100 hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-center mb-3">
                  <p className="text-lg font-semibold text-gray-700">
                    Pedido #{o.orderId}
                  </p>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                      o.status
                    )}`}
                  >
                    {o.status}
                  </span>
                </div>

                <p className="text-gray-500 text-sm mb-2">
                  Fecha: {new Date(o.date).toLocaleDateString()}
                </p>

                <ul className="mb-3 list-disc list-inside text-gray-700">
                  {o.items.map((item) => (
                    <li key={item.productId}>
                      {item.productName} x{item.quantity} - ${item.subtotal}
                    </li>
                  ))}
                </ul>

                <div className="text-right text-gray-700 mb-1">
                  {paymentDiscount > 0 && (
                    <p className="text-green-700">
                      Descuento por pago: -${paymentDiscount.toFixed(2)}
                    </p>
                  )}
                  {couponDiscount > 0 && (
                    <p className="text-green-700">
                      Descuento por cupón: -${couponDiscount.toFixed(2)}
                    </p>
                  )}
                  <p className="font-bold text-gray-800">
                    Total final: ${totalFinal.toFixed(2)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <button
        onClick={fetchOrders}
        className="mt-6 px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
      >
        Refrescar pedidos
      </button>
    </div>
  );
}
