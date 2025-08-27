import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CheckoutProgress from "../components/CheckoutProgress";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { addVenta, createFromCart } from "../api/orders";

export default function CheckoutStep3() {
  const { cart, fetchCart, clearCart, loading: cartLoading } = useCart();
  const { token } = useAuth();
  const navigate = useNavigate();

  const checkoutData = JSON.parse(localStorage.getItem("checkoutData") || "{}");
  const guestCart = JSON.parse(localStorage.getItem("guestCart")) || {
    items: [],
    total: 0,
  };

  const [paymentMethod, setPaymentMethod] = useState("vendedor");
  const [loading, setLoading] = useState(false);
  const [orderNotes, setOrderNotes] = useState("");

  const currentCart = token ? cart : guestCart;

  useEffect(() => {
    if (token) fetchCart();
  }, [token, fetchCart]);

  const handleConfirmOrder = async () => {
    try {
      setLoading(true);
      let newVenta;

      if (token) {
        // 🔹 Logueado: armar DTO con datos del checkout y enviar al backend
        if (!currentCart.items || currentCart.items.length === 0) {
          alert("El carrito está vacío");
          setLoading(false);
          return;
        }

        const dto = {
          customerEmail: checkoutData.email,
          customerName: checkoutData.name,
          customerLastname: checkoutData.lastname,
          shippingAddress: checkoutData.street + " " + checkoutData.number,
          postalCode: checkoutData.postalCode,
          province: checkoutData.province,
          city: checkoutData.city,
          department: checkoutData.department,
          street: checkoutData.street,
          number: checkoutData.number,
          paymentMethod,
          shippingMethod: checkoutData.shippingOption?.name ?? "",
          shippingCost: checkoutData.shippingOption?.cost ?? 0,
          notes: orderNotes,
        };

        newVenta = await createFromCart(dto, token);
      } else {
        // 🔹 Invitado: armar DTO completo con items
        if (!currentCart.items || currentCart.items.length === 0) {
          alert("El carrito está vacío");
          setLoading(false);
          return;
        }

        const orderPayload = {
          customerName: checkoutData.name,
          customerLastname: checkoutData.lastname,
          customerEmail: checkoutData.email,
          street: checkoutData.street,
          number: checkoutData.number,
          department: checkoutData.department,
          city: checkoutData.city,
          province: checkoutData.province,
          postalCode: checkoutData.postalCode,
          shippingMethod: checkoutData.shippingOption?.name ?? "",
          shippingCost: checkoutData.shippingOption?.cost ?? 0,
          paymentMethod,
          notes: orderNotes || "",
          items: currentCart.items.map((item) => ({
            productId: item.productId || item.id,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            subtotal: item.subtotal ?? item.quantity * item.unitPrice,
          })),
          total:
            (currentCart.items?.reduce(
              (acc, it) => acc + (it.subtotal || it.quantity * it.unitPrice),
              0
            ) || 0) + (checkoutData.shippingOption?.cost || 0),
        };

        console.log("DTO invitado:", orderPayload);
        newVenta = await addVenta(orderPayload);
      }

      console.log("Venta creada:", newVenta);

      // 🔹 Limpiar carrito y checkoutData
      clearCart();
      localStorage.removeItem("checkoutData");
      if (!token) localStorage.removeItem("guestCart");

      navigate("/checkout/success", { state: { venta: newVenta } });
    } catch (err) {
      console.error("Error al confirmar venta:", err);
      alert(err.message || "Hubo un error al procesar tu pedido.");
    } finally {
      setLoading(false);
    }
  };

  if (token && cartLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500 text-lg">Cargando carrito...</p>
      </div>
    );
  }

  const paymentOptions = [
    { id: "vendedor", title: "Acordar con el vendedor" },
    {
      id: "mercadopago",
      title: "Mercado Pago",
      logo: "/img/mercadopago.png",
      badge: "Hasta 6 cuotas sin interés con tarjetas seleccionadas",
    },
    {
      id: "transferencia",
      title: "Transferencia o depósito bancario",
      badge: "20% de descuento",
    },
    { id: "efectivo", title: "Efectivo", badge: "20% de descuento" },
  ];

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <CheckoutProgress step={3} />
      <h2 className="text-3xl font-bold text-center mb-6">Pago</h2>

      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-[1fr_350px] gap-8">
        {/* IZQUIERDA */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h3 className="text-xl font-bold mb-4">Método de pago</h3>
          <div className="space-y-4">
            {paymentOptions.map((option) => (
              <label
                key={option.id}
                className={`flex items-center gap-4 border rounded-xl p-4 cursor-pointer shadow-sm transition-all ${
                  paymentMethod === option.id
                    ? "border-gray-400 bg-white"
                    : "border-gray-200 bg-white hover:shadow-md"
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value={option.id}
                  checked={paymentMethod === option.id}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-5 h-5 text-gray-800 focus:ring-gray-500" // <- antes era green
                />
                {option.logo && (
                  <img
                    src={option.logo}
                    alt={option.title}
                    className="h-8 object-contain"
                  />
                )}
                <div className="flex-1">
                  <p className="font-semibold text-lg">{option.title}</p>
                  {option.badge && (
                    <span className="text-sm bg-green-100 text-green-700 px-2 py-0.5 rounded-md font-medium">
                      {option.badge}
                    </span>
                  )}
                </div>
              </label>
            ))}
          </div>

          <h3 className="text-xl font-bold mt-8 mb-2">Notas del pedido</h3>
          <textarea
            rows="3"
            value={orderNotes}
            onChange={(e) => setOrderNotes(e.target.value)}
            placeholder="Escribí un comentario sobre tu pedido..."
            className="w-full border rounded-lg p-3 focus:ring-green-500 focus:border-green-500"
          />
        </div>

        {/* DERECHA */}
        <div className="bg-white p-6 rounded-xl shadow-md h-fit">
          <h3 className="text-xl font-bold mb-4">Mi pedido</h3>

          {currentCart?.items?.length > 0 ? (
            currentCart.items.map((item) => (
              <div
                key={item.productId || item.id}
                className="flex justify-between border-b pb-2 mb-2 text-lg"
              >
                <span>
                  {item.productName || item.name} x {item.quantity}
                </span>
                <span>
                  $
                  {(
                    item.subtotal ?? item.quantity * item.unitPrice
                  ).toLocaleString("es-AR")}
                </span>
              </div>
            ))
          ) : (
            <p className="text-gray-500">El carrito está vacío</p>
          )}

          <h4 className="mt-4 text-2xl font-bold">
            Total: ${(currentCart?.total ?? 0).toLocaleString("es-AR")}
          </h4>

          <div className="flex justify-end mt-4">
            <button
              onClick={handleConfirmOrder}
              disabled={loading}
              className="py-2 px-6 bg-black text-white rounded-2xl text-sm font-semibold hover:bg-gray-800 focus:outline-none shadow-md disabled:opacity-50"
            >
              {loading ? "Procesando..." : "Pagar ahora"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
