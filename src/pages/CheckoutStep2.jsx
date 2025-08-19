import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CheckoutProgress from "../components/CheckoutProgress";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

const API_URL = "https://localhost:7247/api/venta"; // ⚠️ Ajusta puerto real

export default function CheckoutStep2() {
  const { cart, fetchCart, clearCart, loading: cartLoading } = useCart();
  const { token } = useAuth();
  const navigate = useNavigate();

  const checkoutData = JSON.parse(localStorage.getItem("checkoutData") || "{}");
  const [payment, setPayment] = useState("tarjeta");
  const [loading, setLoading] = useState(false);

  // 🔄 Cargar carrito actualizado al entrar a este paso
  useEffect(() => {
    if (token) {
      fetchCart();
    }
  }, [token, fetchCart]);

  const handleConfirm = async () => {
    if (!cart || !cart.items || cart.items.length === 0) {
      alert("El carrito está vacío");
      return;
    }

    setLoading(true);
    try {
      await axios.post(
        `${API_URL}/CreateFromCart`,
        { paymentMethod: payment },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert("Compra realizada con éxito 🎉");
      await clearCart();
      await fetchCart(); // 🔄 refrescar para ver carrito vacío
      localStorage.removeItem("checkoutData");
      navigate("/");
    } catch (error) {
      console.error("Error al confirmar la compra:", error);
      alert("Hubo un error al procesar la compra. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  if (cartLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500 text-lg">Cargando carrito...</p>
      </div>
    );
  }

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

          {cart?.items?.length > 0 ? (
            cart.items.map((item) => (
              <div
                key={item.productId}
                className="flex justify-between border-b pb-2 mb-2"
              >
                <span>
                  {item.productName} x {item.quantity}
                </span>
                <span>${item.subtotal}</span>
              </div>
            ))
          ) : (
            <p className="text-gray-500">El carrito está vacío</p>
          )}

          <h4 className="mt-4 text-xl font-bold">Total: ${cart?.total ?? 0}</h4>

          <button
            onClick={handleConfirm}
            disabled={loading}
            className="w-full mt-4 py-3 bg-green-600 text-white rounded-lg text-lg font-semibold hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? "Procesando..." : "Pagar ahora"}
          </button>
        </div>
      </div>
    </div>
  );
}
