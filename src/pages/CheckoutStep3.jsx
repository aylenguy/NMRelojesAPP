import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CheckoutProgress from "../components/CheckoutProgress";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { addVenta, createFromCart } from "../api/orders";

export default function CheckoutStep3() {
  const { cart, fetchCart, clearCart, loading: cartLoading } = useCart();
  const { token, user } = useAuth();
  const navigate = useNavigate();

  const checkoutData = JSON.parse(localStorage.getItem("checkoutData") || "{}");
  const [paymentMethod, setPaymentMethod] = useState("vendedor");
  const [loading, setLoading] = useState(false);
  const [orderNotes, setOrderNotes] = useState("");

  useEffect(() => {
    if (token) fetchCart();
  }, [token, fetchCart]);

  const handleConfirmOrder = async () => {
    try {
      setLoading(true);

      let newVenta;

      if (token) {
        // ✅ Usuario logueado → crear venta desde carrito del backend
        newVenta = await createFromCart(token);
      } else {
        // ✅ Invitado → armar DTO y enviar sin token
        const ventaDto = {
          clientId: 0, // o null → backend decide
          shippingAddress: checkoutData.street,
          postalCode: checkoutData.postalCode,
          paymentMethod: paymentMethod,
          shippingMethod: checkoutData.shipping,
          shippingCost: checkoutData.shippingOption?.cost || 0,
          notes: orderNotes || "",
          items: cart.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        };

        console.log("DTO enviado al backend:", ventaDto);
        newVenta = await addVenta(ventaDto);
      }

      console.log("Venta creada en backend:", newVenta);

      // Limpiar carrito y datos locales
      clearCart();
      localStorage.removeItem("checkoutData");

      // Redirigir a la pantalla de éxito
      navigate("/checkout/success", { state: { venta: newVenta } });
    } catch (err) {
      console.error("Error al confirmar la venta:", err);
      alert(err.message || "Hubo un error al procesar tu pedido.");
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
                    ? "border-green-600 bg-green-50"
                    : "border-gray-200 bg-white hover:shadow-md"
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value={option.id}
                  checked={paymentMethod === option.id}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-5 h-5 text-green-600 focus:ring-green-500"
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

          {cart?.items?.length > 0 ? (
            cart.items.map((item) => (
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
            Total: ${(cart?.total ?? 0).toLocaleString("es-AR")}
          </h4>

          <button
            onClick={handleConfirmOrder}
            disabled={loading}
            className="w-full mt-6 py-3 bg-green-600 text-white rounded-xl text-lg font-semibold hover:bg-green-700 shadow-md disabled:opacity-50"
          >
            {loading ? "Procesando..." : "Pagar ahora"}
          </button>
        </div>
      </div>
    </div>
  );
}
