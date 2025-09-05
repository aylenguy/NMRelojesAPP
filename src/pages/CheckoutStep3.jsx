import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CheckoutProgress from "../components/CheckoutProgress";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { addVenta, createFromCart } from "../api/orders";
import LogoImg from "../assets/LogoMP.png";

export default function CheckoutStep3() {
  const { cart, fetchCart, clearCart, loading: cartLoading } = useCart();
  const { token } = useAuth();
  const navigate = useNavigate();

  const checkoutData = JSON.parse(localStorage.getItem("checkoutData") || "{}");
  const guestCart = JSON.parse(localStorage.getItem("guestCart")) || {
    items: [],
    total: 0,
  };

  const [paymentMethod, setPaymentMethod] = useState("vendedor"); // Por defecto "Acordar con el vendedor"
  const [loading, setLoading] = useState(false);
  const [orderNotes, setOrderNotes] = useState("");

  const currentCart = token ? cart : guestCart;

  useEffect(() => {
    if (token) fetchCart();
  }, [token, fetchCart]);

  const handleConfirmOrder = async () => {
    try {
      setLoading(true);

      if (!currentCart.items || currentCart.items.length === 0) {
        alert("El carrito está vacío");
        setLoading(false);
        return;
      }

      // 🔹 Generar referencia externa
      const externalReference = `pedido-${Date.now()}`;
      localStorage.setItem("lastExternalReference", externalReference);

      // 🔹 Calcular subtotal y total
      const subtotal = currentCart.items.reduce(
        (acc, it) => acc + (it.subtotal ?? it.quantity * it.unitPrice),
        0
      );

      const shippingCost = checkoutData.shippingOption?.cost || 0;
      const couponDiscount = checkoutData.discount || 0;
      const paymentDiscount =
        paymentMethod === "efectivo" || paymentMethod === "transferencia"
          ? 0.2 * subtotal
          : 0;

      const totalFinal =
        subtotal + shippingCost - couponDiscount - paymentDiscount;

      // 🔹 Preparar payload de venta
      const ventaPayload = {
        clientId: checkoutData.clientId || 1, // si tu cliente tiene ID
        customerEmail: checkoutData.email || "sin-email@ejemplo.com",
        customerName: checkoutData.name || "Cliente",
        customerLastname: checkoutData.lastname || "",
        externalReference,
        couponCode: checkoutData.couponCode || "", // si aplica
        shippingAddress: checkoutData.street || "Sin dirección",
        postalCode: checkoutData.postalCode || "",
        paymentMethod,
        shippingMethod: checkoutData.shippingOption?.name || "",
        shippingCost,
        province: checkoutData.province || "",
        city: checkoutData.city || "",
        department: checkoutData.department || "",
        description: checkoutData.description || "",
        street: checkoutData.street || "",
        number: checkoutData.number || "",
        notes: orderNotes || "",
        items: currentCart.items.map((i) => ({
          productId: i.productId || i.id,
          quantity: i.quantity || 1,
          unitPrice: i.unitPrice || 0,
          subtotal: i.subtotal ?? i.quantity * i.unitPrice,
        })),
        total: totalFinal,
      };

      let newVenta;

      // 🔹 Si es Mercado Pago, crear la preferencia primero
      if (paymentMethod === "mercadopago") {
        const mpResponse = await fetch(
          "https://localhost:7247/api/Payment/create-checkout",
          {
            method: "POST",
            headers: { "Content-Type": "application/json-patch+json" },
            body: JSON.stringify({
              amount: totalFinal,
              description: "Compra en NM Relojes",
              payerEmail: checkoutData.email || "sin-email@ejemplo.com",
              currencyId: "ARS",
              quantity: 1,
              externalReference,
            }),
          }
        );

        let mpData;
        try {
          mpData = await mpResponse.json();
        } catch (e) {
          const text = await mpResponse.text();
          console.error("Respuesta inválida de backend MP:", text);
          throw new Error("Error al crear preferencia Mercado Pago");
        }

        if (mpData?.initPoint) {
          // 🔹 Guardamos la venta pendiente en localStorage
          localStorage.setItem("ventaPendiente", JSON.stringify(ventaPayload));
          window.location.href = mpData.initPoint;
          return;
        } else {
          throw new Error("No se pudo generar el checkout de Mercado Pago.");
        }
      }

      // 🔹 Crear la venta directamente (otros métodos)
      if (token) {
        newVenta = await createFromCart(ventaPayload, token);
      } else {
        newVenta = await addVenta(ventaPayload);
      }

      // 🔹 Transformar venta para CheckoutSuccess
      const clientAddress = [
        newVenta.street,
        newVenta.number,
        newVenta.department,
        newVenta.city,
        newVenta.province,
        newVenta.postalCode,
      ]
        .filter(Boolean)
        .join(", ");

      const ventaTransformada = {
        client: {
          name: newVenta.customerName,
          lastName: newVenta.customerLastname,
          email: newVenta.customerEmail,
          address: clientAddress || "Sin dirección",
        },
        detalleVentas: (newVenta.items || []).map((i) => ({
          id: i.productId,
          product: {
            name: i.productName || "Producto",
            price: i.unitPrice || 0,
          },
          quantity: i.quantity,
          subtotal: i.subtotal ?? i.quantity * i.unitPrice,
        })),
        total: newVenta.total,
        paymentMethod: newVenta.paymentMethod,
        paymentStatus: newVenta.paymentStatus,
        externalReference: newVenta.externalReference,
        notes: newVenta.notes || "",
      };

      // 🔹 Limpiar carrito y checkout
      clearCart();
      localStorage.removeItem("checkoutData");
      if (!token) localStorage.removeItem("guestCart");

      navigate("/checkout/success", { state: { venta: ventaTransformada } });
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

  const subtotal =
    currentCart.items?.reduce(
      (acc, it) => acc + (it.subtotal ?? it.quantity * it.unitPrice),
      0
    ) || 0;

  const shippingCost = checkoutData.shippingOption?.cost || 0;
  const couponDiscount = checkoutData.discount || 0;
  const paymentDiscount =
    paymentMethod === "efectivo" || paymentMethod === "transferencia"
      ? 0.2 * subtotal
      : 0;
  const totalFinal = subtotal + shippingCost - couponDiscount - paymentDiscount;

  const paymentOptions = [
    { id: "vendedor", title: "Acordar con el vendedor" },
    {
      id: "mercadopago",
      title: "Mercado Pago",
      logo: LogoImg,
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
    <div className="min-h-screen py-8">
      <CheckoutProgress step={3} />
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-[1fr_350px] gap-8">
        {/* IZQUIERDA */}
        <div className="bg-white p-12 rounded-2xl shadow-sm border-2 border-gray-300 transition-all duration-300 hover:shadow-lg hover:bg-gray-50">
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
                  className="w-5 h-5 text-gray-800 focus:ring-gray-500"
                />
                {option.logo && (
                  <img
                    src={option.logo}
                    alt={option.title}
                    className="w-20 h-auto"
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
        <div className="bg-white p-8 rounded-2xl shadow-sm border-2 border-gray-300 transition-all duration-300 hover:shadow-lg hover:bg-gray-50 h-fit">
          <h3 className="text-xl font-bold mb-4">Mi pedido</h3>
          {currentCart?.items?.length > 0 ? (
            currentCart.items.map((item) => (
              <div
                key={item.productId || item.id}
                className="flex justify-between border-b pb-2 mb-2 text-sm"
              >
                <img
                  src={
                    item.image ||
                    item.Image ||
                    item.imageUrl ||
                    item.imagen ||
                    item.Imagen ||
                    "https://localhost:7247/uploads/placeholder.png"
                  }
                  alt={item.name || item.productName || "Producto"}
                  className="w-12 h-12 object-cover rounded"
                />
                <span className="font-medium">
                  {(item.brand || item.Brand || "") +
                    " " +
                    (item.productName || item.name || "Producto")}{" "}
                  x {item.quantity || 1}
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
          {couponDiscount > 0 && (
            <p className="text-sm text-green-700">
              Descuento cupón: -${couponDiscount.toLocaleString("es-AR")}
            </p>
          )}
          {paymentDiscount > 0 && (
            <p className="text-sm   text-[#006d77]">
              Descuento pago: -${paymentDiscount.toLocaleString("es-AR")}
            </p>
          )}
          <h4 className="font-bold text-xl">
            Total: ${totalFinal.toLocaleString("es-AR")}
          </h4>
          <div className="flex justify-between mt-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="text-base text-gray-600 hover:underline"
            >
              Volver a envío
            </button>
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
