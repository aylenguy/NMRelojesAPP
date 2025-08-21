import { useLocation } from "react-router-dom";

export default function CheckoutSuccess() {
  const { state } = useLocation();
  const venta = state?.venta;

  if (!venta) return <p>No hay información de la venta.</p>;

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-xl shadow-md">
        <h1 className="text-3xl font-bold mb-4">¡Pedido confirmado!</h1>
        <p className="text-lg mb-2">
          <strong>ID de la venta:</strong> {venta.id}
        </p>
        <p className="text-lg mb-4">
          <strong>Total:</strong> ${venta.total.toLocaleString("es-AR")}
        </p>

        <h2 className="text-2xl font-bold mb-2">Detalles de la venta</h2>
        <ul className="mb-4">
          {venta.items.map((item) => (
            <li key={item.id} className="mb-2 border-b pb-1">
              <p>
                <strong>Detalle ID:</strong> {item.id}
              </p>
              <p>
                Producto {item.productId} x {item.quantity} = $
                {item.subtotal.toLocaleString("es-AR")}
              </p>
            </li>
          ))}
        </ul>

        <h3 className="text-xl font-bold mb-2">Dirección y método de pago</h3>
        <p>Dirección: {venta.shippingAddress}</p>
        <p>Método de pago: {venta.paymentMethod}</p>
      </div>
    </div>
  );
}
