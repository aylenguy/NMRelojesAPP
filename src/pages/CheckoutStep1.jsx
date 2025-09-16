import { useState } from "react";
import { useNavigate } from "react-router-dom";
import CheckoutProgress from "../components/CheckoutProgress";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

const API_URL = import.meta.env.VITE_API_URL; // ✅ variable de entorno

export default function CheckoutStep1() {
  const { cart, loading: cartLoading } = useCart();
  const { user, token } = useAuth();
  const [errors, setErrors] = useState({});
  const [couponCode, setCouponCode] = useState("");
  const [couponError, setCouponError] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const navigate = useNavigate();

  const savedCheckout = JSON.parse(localStorage.getItem("checkoutData")) || {};
  const savedShipping = JSON.parse(localStorage.getItem("shippingData")) || {};

  const [email, setEmail] = useState(user?.email || savedCheckout.email || "");
  const [postalCode, setPostalCode] = useState(
    savedCheckout.postalCode || savedShipping.postalCode || ""
  );
  const [shippingOption] = useState(savedShipping.shippingOption || null);

  const currentCart = cart;
  const subtotal = currentCart?.total || 0;
  const total = subtotal - couponDiscount;

  const handleNext = () => {
    if (cartLoading) return;

    const newErrors = {};
    if (!token) {
      if (!email.trim()) newErrors.email = "El email es obligatorio";
      else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email))
          newErrors.email = "Por favor ingresa un email válido";
      }
    }

    if (!postalCode.trim())
      newErrors.postalCode = "Por favor ingresa tu código postal";
    if (!currentCart?.items || currentCart.items.length === 0)
      newErrors.cart = "El carrito está vacío";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    const checkoutPayload = {
      email: token ? user.email : email,
      name: savedCheckout.name || "",
      lastname: savedCheckout.lastname || "",
      postalCode,
      shippingOption,
      clientId: user?.id ?? 0,
      items: currentCart.items,
      couponCode: couponCode || "",
      couponDiscount,
    };

    localStorage.setItem("checkoutData", JSON.stringify(checkoutPayload));
    navigate("/checkout/paso-2");
  };

  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError("Ingresa un cupón válido");
      setCouponDiscount(0);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/coupon/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode, total: subtotal }),
      });

      if (!response.ok) {
        const error = await response.json();
        setCouponError(error.error || "Cupón inválido");
        setCouponDiscount(0);
        return;
      }

      const data = await response.json();
      setCouponDiscount(data.discount || 0);
      setCouponError("");
    } catch (error) {
      console.error("Error aplicando cupón:", error);
      setCouponError("Error al validar el cupón");
      setCouponDiscount(0);
    }
  };

  const getItemFullName = (item) => {
    const brand = item.brand || item.Brand || item.Marca || "";
    const name = item.productName || item.name || "Producto";
    return brand ? `${brand} ${name}` : name;
  };

  if (cartLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500 text-lg">Cargando carrito...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <CheckoutProgress step={1} />

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-[1fr_350px] gap-10">
        {/* Datos de contacto */}
        <div className="bg-white p-12 rounded-2xl shadow-sm border-2 border-gray-300 hover:shadow-lg hover:bg-gray-50 transition-all duration-300">
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
                  ? "border-[#005f73] focus:ring-[#005f73]"
                  : "border-gray-300 focus:ring-black"
              }`}
            />
            {errors.email && (
              <p className="text-[#005f73] font-semibold text-sm mt-1">
                {errors.email}
              </p>
            )}
          </div>

          <div className="mb-6">
            <label className="block text-base font-semibold text-gray-800 mb-2">
              Código postal
            </label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={postalCode}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "");
                setPostalCode(value);
                setErrors((prev) => ({ ...prev, postalCode: null }));
              }}
              placeholder="Ingrese su código postal"
              className={`w-full p-2 text-sm border rounded-xl focus:outline-none focus:ring-2 ${
                errors.postalCode
                  ? "border-[#005f73] focus:ring-[#005f73]"
                  : "border-gray-300 focus:ring-black"
              }`}
            />

            {errors.postalCode && (
              <p className="text-[#005f73] font-semibold text-sm mt-1">
                {errors.postalCode}
              </p>
            )}

            {postalCode && (
              <p className="text-sm text-gray-600 mt-2">
                Código postal seleccionado:{" "}
                <span className="font-bold">{postalCode}</span>
              </p>
            )}

            {shippingOption && (
              <p className="text-sm text-gray-600 mt-1">
                Envío:{" "}
                <span className="font-semibold">{shippingOption.name}</span> –{" "}
                {shippingOption.cost === 0
                  ? "Gratis"
                  : `$${shippingOption.cost.toLocaleString("es-AR")}`}
              </p>
            )}
          </div>

          <div className="flex justify-between items-center mt-4">
            <button
              onClick={() => navigate("/")}
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
        <div className="bg-white p-8 rounded-2xl shadow-sm border-2 border-gray-300 hover:shadow-lg hover:bg-gray-50 transition-all duration-300 h-fit">
          <h3 className="text-xl font-bold mb-6 tracking-tight">Mi pedido</h3>

          {currentCart?.items?.length > 0 ? (
            currentCart.items.map((item) => (
              <div
                key={item.productId || item.id}
                className="flex items-center justify-between border-b pb-4 mb-4"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={item.imageUrl || "/placeholder.jpg"}
                    alt={item.productName || item.name}
                    className="w-16 h-16 object-cover rounded-lg border"
                  />
                  <div>
                    <p className="font-semibold text-gray-900 text-base">
                      {getItemFullName(item)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {item.quantity} unidad
                    </p>
                  </div>
                </div>
                <span className="font-semibold text-base text-gray-900">
                  ${item.subtotal?.toLocaleString() || 0}
                </span>
              </div>
            ))
          ) : (
            <p className="text-gray-500">El carrito está vacío</p>
          )}

          {/* Cupón dentro del resumen */}
          <div className="mb-4">
            <label className="block text-base font-semibold text-gray-800 mb-2">
              Cupón de descuento
            </label>

            <div className="flex items-center gap-3">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => {
                  setCouponCode(e.target.value);
                  setCouponError("");
                }}
                placeholder="Ingresa tu cupón"
                className={`flex-1 px-4 py-2 text-sm border rounded-xl focus:outline-none focus:ring-2 transition ${
                  couponError
                    ? "border-[#005f73] focus:ring-[#005f73]"
                    : "border-gray-300 focus:ring-black"
                }`}
              />
              <button
                type="button"
                onClick={applyCoupon}
                className="py-2 px-7 bg-black text-white rounded-2xl hover:bg-gray-800 shadow transition-all text-sm"
              >
                Aplicar
              </button>
            </div>

            {couponError && (
              <p className="text-[#005f73] font-semibold text-sm mt-1">
                {couponError}
              </p>
            )}
            {couponDiscount > 0 && (
              <div className="flex justify-between text-sm text-[#006d77] mt-2">
                <span>¡Cupón aplicado!</span>
                <span>- ${couponDiscount.toLocaleString("es-AR")}</span>
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-between font-bold text-xl text-gray-900">
            <span>Total</span>
            <span>${total.toLocaleString() || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
