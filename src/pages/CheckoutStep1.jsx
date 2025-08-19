import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CheckoutProgress from "../components/CheckoutProgress";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export default function CheckoutStep1() {
  const { cart, fetchCart, loading: cartLoading } = useCart();
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState(user?.email || "");

  useEffect(() => {
    if (token) fetchCart();
  }, [token, fetchCart]);

  const handleNext = () => {
    if (cartLoading) return;
    if (!email.trim()) {
      alert("Por favor ingresa tu email");
      return;
    }
    if (!cart?.items || cart.items.length === 0) {
      alert("El carrito está vacío");
      return;
    }

    localStorage.setItem("checkoutData", JSON.stringify({ email }));
    navigate("/checkout/paso-2");
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
      <CheckoutProgress step={1} />

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-[1fr_350px] gap-10">
        {/* Datos de contacto */}
        <div className="bg-white p-12 rounded-2xl shadow-sm">
          <h2 className="text-3xl font-bold mb-8 tracking-tight">
            Datos de contacto
          </h2>

          <div className="mb-8">
            <label className="block text-base font-semibold text-gray-800 mb-2">
              Correo electrónico
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tuemail@email.com"
              className="w-full p-4 text-lg border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <button
            onClick={handleNext}
            disabled={cartLoading}
            className="w-full py-4 text-lg bg-black text-white font-semibold rounded-xl hover:bg-gray-800 transition-colors"
          >
            Continuar con el envío
          </button>

          <button
            onClick={() => navigate("/productos")}
            className="block mt-4 text-base text-gray-600 hover:underline"
          >
            Seguir comprando
          </button>
        </div>

        {/* Resumen de pedido */}
        <div className="bg-white p-8 rounded-2xl shadow-sm h-fit">
          <h3 className="text-xl font-bold mb-6 tracking-tight">Mi pedido</h3>

          {cart?.items?.length > 0 ? (
            cart.items.map((item) => (
              <div
                key={item.productId}
                className="flex justify-between items-center border-b pb-4 mb-4"
              >
                <div>
                  <p className="font-semibold text-gray-900 text-base">
                    {item.productName}
                  </p>
                  <p className="text-sm text-gray-500">
                    {item.quantity} unidad
                  </p>
                </div>
                <span className="font-semibold text-base text-gray-900">
                  ${item.subtotal.toLocaleString()}
                </span>
              </div>
            ))
          ) : (
            <p className="text-gray-500">El carrito está vacío</p>
          )}

          <div className="mt-6 flex justify-between font-bold text-xl text-gray-900">
            <span>Total</span>
            <span>${cart?.total?.toLocaleString() ?? 0}</span>
          </div>

          <div className="mt-6">
            <button className="w-full border border-gray-300 py-3 rounded-xl text-base font-medium text-gray-700 hover:bg-gray-50">
              ¿Tenés un cupón de descuento?
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
