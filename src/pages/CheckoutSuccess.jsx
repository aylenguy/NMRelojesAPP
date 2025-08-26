import { useLocation, useNavigate } from "react-router-dom";

export default function CheckoutSuccess() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const rawVenta = state?.venta;

  if (!rawVenta) return <p>No hay información de la venta.</p>;

  // 🔹 Mapear las propiedades a lo que espera el componente
  const venta = {
    id: rawVenta.orderId,
    total: rawVenta.total,
    items: rawVenta.items.map((item) => ({
      id: item.productId,
      productId: item.productId,
      quantity: item.quantity,
      subtotal: item.subtotal,
    })),
    shippingAddress: `${rawVenta.street} ${rawVenta.number}${
      rawVenta.department ? ", " + rawVenta.department : ""
    }, ${rawVenta.city}, ${rawVenta.province}, ${rawVenta.postalCode}`,
    paymentMethod: rawVenta.paymentMethod,
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-xl shadow-md">
        <h1 className="text-3xl font-bold mb-6 text-center">
          ¡Pedido confirmado!
        </h1>

        <div className="mb-6">
          <p className="text-lg mb-2">
            <strong>ID de la venta:</strong> {venta.id}
          </p>
          <p className="text-lg">
            <strong>Total:</strong> ${venta.total.toLocaleString("es-AR")}
          </p>
        </div>

        <h2 className="text-2xl font-bold mb-3">Detalles de la venta</h2>
        <ul className="mb-6 border rounded-md overflow-hidden">
          {venta.items.map((item) => (
            <li
              key={item.id}
              className="flex justify-between p-3 border-b last:border-b-0"
            >
              <span>
                {item.productId} x {item.quantity}
              </span>
              <span>${item.subtotal.toLocaleString("es-AR")}</span>
            </li>
          ))}
        </ul>

        <h3 className="text-xl font-bold mb-2">Dirección y método de pago</h3>
        <p className="mb-1">
          <strong>Dirección:</strong> {venta.shippingAddress}
        </p>
        <p className="mb-4">
          <strong>Método de pago:</strong> {venta.paymentMethod}
        </p>

        <div className="text-center">
          <button
            onClick={() => navigate("/")}
            className="mt-4 px-6 py-3 bg-black text-white font-bold rounded-lg hover:bg-gray-800 transition-colors"
          >
            Volver a la tienda
          </button>
        </div>
      </div>
    </div>
  );
}
