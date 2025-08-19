import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CheckoutProgress from "../components/CheckoutProgress";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export default function CheckoutStep1() {
  const { cart, fetchCart, loading: cartLoading } = useCart();
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  // 🔄 Al cargar el paso 1, traer carrito actualizado
  useEffect(() => {
    if (token) {
      fetchCart();
    }
  }, [token, fetchCart]);

  const handleNext = () => {
    if (cartLoading) return;

    if (!name.trim() || !email.trim() || !phone.trim() || !address.trim()) {
      alert("Por favor completa todos los campos");
      return;
    }
    if (!cart || !cart.items || cart.items.length === 0) {
      alert("El carrito está vacío");
      return;
    }

    localStorage.setItem(
      "checkoutData",
      JSON.stringify({ name, email, phone, address })
    );

    navigate("/checkout/paso-2");
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <CheckoutProgress step={1} />
      <h2 className="text-3xl font-bold text-center mb-6">Datos del cliente</h2>

      <div className="max-w-xl mx-auto bg-white p-6 rounded-xl shadow-md">
        <label className="font-bold block mb-2">Nombre completo:</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg mb-4"
        />

        <label className="font-bold block mb-2">Email:</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg mb-4"
        />

        <label className="font-bold block mb-2">Teléfono:</label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg mb-4"
        />

        <label className="font-bold block mb-2">Dirección de envío:</label>
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg mb-6"
        />

        <button
          onClick={handleNext}
          disabled={cartLoading}
          className="w-full py-3 bg-black text-white rounded-lg text-lg font-semibold hover:bg-gray-800 disabled:opacity-50"
        >
          {cartLoading ? "Cargando carrito..." : "Continuar al pago"}
        </button>
      </div>
    </div>
  );
}
