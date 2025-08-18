import { useState } from "react";
import { useNavigate } from "react-router-dom";
import CheckoutProgress from "../components/CheckoutProgress";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { addVenta } from "../api/orders";

export default function CheckoutStep2() {
  const { cartItems, clearCart } = useCart();
  const { token } = useAuth();
  const navigate = useNavigate();

  // Los datos del cliente siguen viniendo de localStorage
  const checkoutData = JSON.parse(localStorage.getItem("checkoutData") || "{}");

  const [payment, setPayment] = useState("tarjeta");

  const handleConfirm = async () => {
    if (!checkoutData.clientId || cartItems.length === 0) {
      alert("No hay datos de compra válidos.");
      return;
    }

    try {
      const venta = {
        clientId: checkoutData.clientId,
        address: checkoutData.address,
        paymentMethod: payment,
        items: cartItems.map((item) => ({
          productId: item.id,
          cantidad: item.quantity,
        })),
      };

      await addVenta(venta, token);
      alert("Compra realizada con éxito 🎉");

      // Limpiar datos
      clearCart();
      localStorage.removeItem("checkoutData");

      navigate("/");
    } catch (error) {
      console.error("Error al confirmar la compra:", error);
      alert("Hubo un error al procesar la compra. Intenta de nuevo.");
    }
  };

  const total = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <CheckoutProgress step={2} />
      <h2 className="text-3xl font-bold text-center mb-6">Confirmar y pagar</h2>

      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-[1fr_350px] gap-8">
        {/* Datos del cliente */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h3 className="text-lg font-bold mb-4">Datos del cliente</h3>
          <p>
            <strong>Nombre:</strong> {checkoutData.name}
          </p>
          <p>
            <strong>Email:</strong> {checkoutData.email}
          </p>
          <p>
            <strong>Teléfono:</strong> {checkoutData.phone}
          </p>
          <p>
            <strong>Dirección:</strong> {checkoutData.address}
          </p>

          <h3 className="text-lg font-bold mt-6 mb-4">Método de pago</h3>
          <select
            value={payment}
            onChange={(e) => setPayment(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg"
          >
            <option value="tarjeta">Tarjeta</option>
            <option value="transferencia">Transferencia bancaria</option>
            <option value="contraentrega">Pago contra entrega</option>
          </select>
        </div>

        {/* Resumen del pedido */}
        <div className="bg-white p-6 rounded-xl shadow-md h-fit">
          <h3 className="text-lg font-bold mb-4">Resumen del pedido</h3>
          {cartItems.length > 0 ? (
            cartItems.map((item) => (
              <div
                key={item.id}
                className="flex justify-between border-b pb-2 mb-2"
              >
                <span>
                  {item.name} x {item.quantity}
                </span>
                <span>${item.price * item.quantity}</span>
              </div>
            ))
          ) : (
            <p className="text-gray-500">El carrito está vacío</p>
          )}
          <h4 className="mt-4 text-xl font-bold">Total: ${total}</h4>
          <button
            onClick={handleConfirm}
            className="w-full mt-4 py-3 bg-green-600 text-white rounded-lg text-lg font-semibold hover:bg-green-700"
          >
            Pagar ahora
          </button>
        </div>
      </div>
    </div>
  );
}
