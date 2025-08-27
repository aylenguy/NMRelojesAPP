import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CheckoutProgress from "../components/CheckoutProgress";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export default function CheckoutStep1() {
  const { cart, fetchCart, loading: cartLoading } = useCart();
  const { user, token } = useAuth();
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  // Traer del localStorage checkoutData y carrito invitado
  const savedCheckout = JSON.parse(localStorage.getItem("checkoutData")) || {};
  const savedShipping = JSON.parse(localStorage.getItem("shippingData")) || {};
  const guestCart = JSON.parse(localStorage.getItem("guestCart")) || {
    items: [],
    total: 0,
  };

  // Estados de los campos
  const [email, setEmail] = useState(user?.email || savedCheckout.email || "");
  const [postalCode, setPostalCode] = useState(
    savedCheckout.postalCode || savedShipping.postalCode || ""
  );
  const [shippingOption] = useState(savedShipping.shippingOption || null);

  // Si está logueado → cargar carrito desde API
  useEffect(() => {
    if (token) fetchCart();
  }, [token, fetchCart]);

  // Determinar carrito según contexto
  const currentCart = token ? cart : guestCart;
  const handleNext = () => {
    if (cartLoading) return;

    const newErrors = {};

    // Validación email solo si es invitado
    if (!token) {
      if (!email.trim()) {
        newErrors.email = "El email es obligatorio";
      } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          newErrors.email = "Por favor ingresa un email válido";
        }
      }
    }

    if (!postalCode.trim()) {
      newErrors.postalCode = "Por favor ingresa tu código postal";
    }

    if (!currentCart?.items || currentCart.items.length === 0) {
      newErrors.cart = "El carrito está vacío";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors); // 👈 muestra los errores debajo de los inputs
      return;
    }

    setErrors({}); // limpiar errores si todo está ok

    // Guardar carrito invitado
    if (!token) {
      localStorage.setItem("guestCart", JSON.stringify(currentCart));
    }

    const checkoutPayload = {
      email: token ? user.email : email,
      name: savedCheckout.name || "",
      lastname: savedCheckout.lastname || "",
      postalCode,
      shippingOption,
      clientId: user?.id ?? 0,
      items: currentCart.items,
    };
    localStorage.setItem("checkoutData", JSON.stringify(checkoutPayload));

    navigate("/checkout/paso-2");
  };

  if (token && cartLoading) {
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
          <h2 className="text-2xl font-bold mb-8 tracking-tight">
            Datos de contacto
          </h2>

          <div className="mb-6">
            <label className="block text-base font-semibold text-gray-800 mb-2">
              Correo electrónico
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrors((prev) => ({ ...prev, email: null }));
              }}
              placeholder="Ingresa tu email"
              className={`w-full p-2 text-sm border rounded-xl focus:outline-none focus:ring-2 ${
                errors.email
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:ring-black"
              }`}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          {/* Código postal */}
          {!postalCode ? (
            <div className="mb-8">
              <label className="block text-base font-semibold text-gray-800 mb-2">
                Código postal
              </label>
              <input
                type="text"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                placeholder="Ingrese su código postal"
                className="w-full p-4 text-lg border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
          ) : (
            <div className="mb-8">
              <p className="text-base text-gray-700">
                Código postal seleccionado:{" "}
                <span className="font-bold">{postalCode}</span>
              </p>
              {shippingOption && (
                <p className="text-sm text-gray-600">
                  Envío:{" "}
                  <span className="font-semibold">{shippingOption.name}</span> –{" "}
                  {shippingOption.cost === 0
                    ? "Gratis"
                    : `$${shippingOption.cost.toLocaleString("es-AR")}`}
                </p>
              )}
            </div>
          )}

          <div className="flex justify-between items-center mt-4">
            <button
              onClick={() => navigate("/productos")}
              className="text-base text-gray-600 hover:underline"
            >
              Seguir comprando
            </button>

            <button
              onClick={handleNext}
              disabled={cartLoading}
              className="py-2 px-9 bg-black text-white rounded-2xl hover:bg-gray-800 shadow transition-all text-sm"
            >
              Continuar con el envío
            </button>
          </div>
        </div>

        {/* Resumen de pedido */}
        <div className="bg-white p-8 rounded-2xl shadow-sm h-fit">
          <h3 className="text-xl font-bold mb-6 tracking-tight">Mi pedido</h3>

          {currentCart?.items?.length > 0 ? (
            currentCart.items.map((item) => (
              <div
                key={item.productId || item.id}
                className="flex justify-between items-center border-b pb-4 mb-4"
              >
                <div>
                  <p className="font-semibold text-gray-900 text-base">
                    {item.productName || item.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {item.quantity || item.cantidad} unidad
                  </p>
                </div>
                <span className="font-semibold text-base text-gray-900">
                  ${item.subtotal?.toLocaleString() || 0}
                </span>
              </div>
            ))
          ) : (
            <p className="text-gray-500">El carrito está vacío</p>
          )}

          <div className="mt-6 flex justify-between font-bold text-xl text-gray-900">
            <span>Total</span>
            <span>${currentCart?.total?.toLocaleString() || 0}</span>
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
