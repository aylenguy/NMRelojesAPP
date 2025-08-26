import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

export default function ProfilePage() {
  const { token, user } = useAuth();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (!token) return;

    const fetchOrders = async () => {
      try {
        const res = await fetch("https://localhost:7247/api/Venta/MyOrders", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Error cargando tus pedidos");
        const data = await res.json();
        setOrders(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchOrders();
  }, [token]);

  return (
    <div className="max-w-4xl mx-auto p-5">
      <h1 className="text-2xl font-bold mb-4">Hola, {user?.name}</h1>

      {orders.length === 0 ? (
        <p className="text-gray-600">Todavía no realizaste ninguna compra.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <div key={o.orderId} className="border p-4 rounded shadow">
              <p>
                <strong>Pedido #{o.orderId}</strong>
              </p>
              <p>Fecha: {new Date(o.date).toLocaleDateString()}</p>
              <p>Estado: {o.status}</p>
              <ul className="list-disc pl-5">
                {o.items.map((item) => (
                  <li key={item.productId}>
                    {item.productName} x{item.quantity} - ${item.subtotal}
                  </li>
                ))}
              </ul>
              <p className="font-bold">Total: ${o.total}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
