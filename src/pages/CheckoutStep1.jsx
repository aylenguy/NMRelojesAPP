import { useState } from "react";
import { useNavigate } from "react-router-dom";
import CheckoutProgress from "../components/CheckoutProgress";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

export default function CheckoutStep1() {
  const { cartItems } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const handleNext = () => {
    if (!name.trim() || !email.trim() || !phone.trim() || !address.trim()) {
      alert("Por favor completa todos los campos");
      return;
    }
    if (cartItems.length === 0) {
      alert("El carrito está vacío");
      return;
    }

    // Guardar datos del cliente en localStorage
    localStorage.setItem(
      "checkoutData",
      JSON.stringify({
        clientId: user?.id ?? 0,
        name,
        email,
        phone,
        address,
      })
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
          className="w-full py-3 bg-black text-white rounded-lg text-lg font-semibold hover:bg-gray-800"
        >
          Continuar al pago
        </button>
      </div>
    </div>
  );
}
