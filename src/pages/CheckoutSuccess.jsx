// src/pages/CheckoutSuccess.jsx
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import axios from "axios";

export default function CheckoutSuccess() {
  const { state, search } = useLocation();
  const { clearCart } = useCart();
  const navigate = useNavigate();
  const [venta, setVenta] = useState(null);
  const [loading, setLoading] = useState(true);

  const params = new URLSearchParams(search);
  const paymentId = params.get("payment_id");
  const status = params.get("status");
  const externalRef = params.get("external_reference");

  useEffect(() => {
    clearCart().catch(console.error);
  }, [clearCart]);

  useEffect(() => {
    if (state?.venta) {
      setVenta(state.venta);
      setLoading(false);
      return;
    }

    if (externalRef) {
      const fetchVenta = async () => {
        try {
          const res = await axios.get(
            `https://localhost:7247/api/Venta/GetByExternalReference/external/${externalRef}`
          );

          const data = res.data;

          const clientAddress = [
            data.street,
            data.number,
            data.city,
            data.province,
            data.postalCode,
          ]
            .filter(Boolean)
            .join(", ");

          setVenta({
            ...data,
            client: {
              name: data.customerName,
              lastName: data.customerLastname,
              email: data.customerEmail,
              address: clientAddress || "Sin dirección",
            },
          });
        } catch (err) {
          console.error("Error al obtener la venta:", err);
          setVenta(null);
        } finally {
          setLoading(false);
        }
      };
      fetchVenta();
      return;
    }

    setLoading(false);
  }, [state, externalRef]);

  const handleBackToHome = () => navigate("/");

  if (loading)
    return (
      <p className="text-center mt-10 text-gray-500">
        Cargando datos de la venta...
      </p>
    );

  if (!venta)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-xl font-bold text-red-600 mb-4">
          No hay información de la venta
        </h1>
        <button
          onClick={handleBackToHome}
          className="px-6 py-2 bg-black text-white rounded-2xl hover:bg-gray-800 transition-all"
        >
          Volver al inicio
        </button>
      </div>
    );

  const method = (venta.paymentMethod || "").toLowerCase();
  const isTransfer = method === "transferencia";
  const isCash = method === "efectivo";
  const isArrange = method === "acordar" || method === "vendedor";
  const isCard = method === "tarjeta" || method === "mercadopago";

  // 🔹 Calcular subtotal, descuento y total final
  const subtotal =
    venta.detalleVentas?.reduce(
      (acc, i) => acc + (i.subtotal ?? i.quantity * i.product.price),
      0
    ) ?? 0;

  const paymentDiscount = isCash || isTransfer ? 0.2 * subtotal : 0;
  const totalFinal = subtotal - paymentDiscount;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center py-10 px-4">
      <div className="max-w-5xl w-full grid md:grid-cols-2 gap-8">
        {/* 🛍️ Resumen de venta */}
        <div className="bg-white rounded-3xl shadow-lg p-6 space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-extrabold text-gray-900">
              ¡Compra confirmada!
            </h1>
            <p className="text-gray-600 mt-2">
              Gracias por comprar en <strong>NM Relojes</strong>.
            </p>
          </div>

          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-xl shadow-md flex flex-col space-y-4">
              <h2 className="text-lg font-bold text-gray-800">
                Resumen de la venta
              </h2>
              <p className="text-gray-700">
                <strong>Cliente:</strong> {venta.client?.name}{" "}
                {venta.client?.lastName}
              </p>
              <p className="text-gray-700">
                <strong>Subtotal:</strong> ${subtotal.toLocaleString("es-AR")}
              </p>
              {paymentDiscount > 0 && (
                <p className="text-[#006d77]">
                  <strong>Descuento por pago:</strong> -$
                  {paymentDiscount.toLocaleString("es-AR")}
                </p>
              )}
              <p className="text-gray-900 font-semibold">
                <strong>Total final:</strong> $
                {totalFinal.toLocaleString("es-AR")}
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-xl shadow-md">
              <h3 className="text-gray-800 font-semibold mb-2">Productos</h3>
              <ul className="space-y-1">
                {venta.detalleVentas?.map((d) => (
                  <li
                    key={d.id}
                    className="flex justify-between items-center p-2 rounded-lg hover:bg-gray-100 transition"
                  >
                    <span>{d.product?.name}</span>
                    <span className="text-gray-700">
                      {d.quantity} x ${d.product?.price.toLocaleString("es-AR")}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-gray-50 p-4 rounded-xl shadow-md">
              <h3 className="text-gray-800 font-semibold mb-2">
                Datos del cliente
              </h3>
              <p className="text-gray-700">
                <strong>Email:</strong> {venta.client?.email} <br />
                <strong>Dirección:</strong>{" "}
                {venta.client?.address || "Sin dirección"}
              </p>
            </div>
          </div>
        </div>

        {/* 💳 Detalles de pago */}
        {(isTransfer || isCash || isArrange || isCard) && (
          <div
            className={`p-6 rounded-3xl shadow-lg space-y-4 ${
              isTransfer || isCash || isArrange ? "bg-blue-50" : "bg-green-50"
            }`}
          >
            {isTransfer && (
              <>
                <h2 className="text-lg font-bold text-blue-800">
                  Para completar tu compra, realiza la transferencia bancaria
                </h2>
                <p>
                  <strong>ID de pago:</strong> {paymentId || "Pendiente"}
                </p>
                <p>
                  <strong>Estado:</strong> Pendiente
                </p>
                <p>
                  <strong>Referencia:</strong> {externalRef || venta.id}
                </p>
                <p className="flex items-center gap-2">
                  <strong>CBU:</strong>
                  <span className="font-semibold text-blue-700">
                    1234567890123456789012
                  </span>
                  <button
                    onClick={() =>
                      navigator.clipboard.writeText("1234567890123456789012")
                    }
                    className="bg-blue-600 text-white text-xs px-2 py-1 rounded hover:bg-blue-700 transition"
                  >
                    Copiar
                  </button>
                </p>
                <p>
                  <strong>Alias:</strong> NM.RELOJES.TRANSFER
                </p>
                <p>
                  <strong>Banco:</strong> Banco de Ejemplo
                </p>
                <p>
                  <strong>Monto a transferir:</strong>{" "}
                  <span className="font-semibold text-blue-700">
                    ${totalFinal.toLocaleString("es-AR")}
                  </span>
                </p>
              </>
            )}

            {isCash && (
              <>
                <h2 className="text-lg font-bold text-blue-800">
                  Pago en efectivo
                </h2>
                <p>
                  Podés abonar en efectivo al retirar el pedido en nuestra
                  tienda o en la dirección indicada.
                </p>
                <div className="bg-blue-100 text-blue-900 p-3 rounded-lg shadow-sm mt-2">
                  En breve nos comunicaremos contigo para coordinar el pago y la
                  entrega de tu pedido.
                </div>
                <p>
                  <strong>Monto a abonar:</strong>{" "}
                  <span className="font-semibold text-blue-700">
                    ${totalFinal.toLocaleString("es-AR")}
                  </span>
                </p>
              </>
            )}

            {isArrange && (
              <>
                <h2 className="text-lg font-bold text-blue-800">
                  Coordinar con el vendedor
                </h2>
                <div className="bg-blue-100 text-blue-900 p-3 rounded-lg shadow-sm mt-2">
                  En breve nos comunicaremos contigo para coordinar el pago y la
                  entrega de tu pedido.
                </div>
              </>
            )}

            {isCard && (
              <>
                <h2 className="text-lg font-bold text-green-800">
                  ¡Pago con tarjeta confirmado!
                </h2>
                <p>
                  Tu pago fue procesado exitosamente a través de Mercado Pago.
                </p>
                <p>
                  <strong>ID de pago:</strong> {paymentId || venta.id}
                </p>
                <p>
                  <strong>Estado:</strong> {status || "Aprobado"}
                </p>
              </>
            )}
          </div>
        )}

        <div className="md:col-span-2 flex justify-center mt-6">
          <button
            onClick={handleBackToHome}
            className="py-2 px-9 bg-black text-white rounded-2xl hover:bg-gray-800 shadow transition-all text-sm"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    </div>
  );
}
