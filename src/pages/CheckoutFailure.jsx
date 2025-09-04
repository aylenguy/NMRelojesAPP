// src/pages/CheckoutFailure.jsx
import { useLocation, useNavigate } from "react-router-dom";

export default function CheckoutFailure() {
  const { search } = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(search);

  const paymentId = params.get("payment_id");
  const status = params.get("status");
  const externalRef = params.get("external_reference");

  const handleBackToHome = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-10 px-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-lg p-6 space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900">
            Pago rechazado
          </h1>
          <p className="text-gray-600 mt-2">
            Hubo un problema procesando tu pago. Por favor, intenta nuevamente.
          </p>
        </div>

        <div className="mt-6 space-y-2 text-left bg-white p-4 rounded shadow">
          <p>
            <span className="font-semibold">ID de pago:</span>{" "}
            <span className="text-gray-800">{paymentId}</span>
          </p>
          <p>
            <span className="font-semibold">Estado:</span>{" "}
            <span className="capitalize text-red-500 font-bold">{status}</span>
          </p>
          <p>
            <span className="font-semibold">Referencia:</span>{" "}
            <span className="text-gray-800">{externalRef}</span>
          </p>
        </div>

        <button
          onClick={handleBackToHome}
          className="mt-6 py-2 px-9 bg-black text-white rounded-2xl hover:bg-gray-800 shadow transition-all text-sm mx-auto block"
        >
          Volver al inicio
        </button>
      </div>
    </div>
  );
}
