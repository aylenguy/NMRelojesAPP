// src/components/ArrepentimientoModal.jsx
import { useState, useEffect } from "react";

const ArrepentimientoModal = ({ onClose }) => {
  const [formData, setFormData] = useState({
    nombre: "",
    telefono: "",
    email: "",
    NumeroPedido: "",
    inconveniente: "",
  });

  const [status, setStatus] = useState(null); // Mensaje de estado
  const [statusType, setStatusType] = useState(null); // "success" o "error"
  const [isSubmitting, setIsSubmitting] = useState(false); // Spinner

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/Arrepentimiento`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      if (response.ok) {
        setStatus("¡Solicitud enviada correctamente!");
        setStatusType("success");
        setFormData({
          nombre: "",
          telefono: "",
          email: "",
          NumeroPedido: "",
          inconveniente: "",
        });
      } else {
        setStatus("Error al enviar la solicitud.");
        setStatusType("error");
      }
    } catch (error) {
      console.error(error);
      setStatus("Error de conexión con el servidor.");
      setStatusType("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Ocultar mensaje automáticamente después de 5 segundos
  useEffect(() => {
    if (status) {
      const timer = setTimeout(() => {
        setStatus(null);
        setStatusType(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 relative shadow-lg">
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
        >
          ✕
        </button>

        {/* Título del modal */}
        <h2 className="text-gray-600 text-xl mb-4">
          Arrepentimiento de compra
        </h2>

        {/* Texto informativo */}
        <p className="text-gray-600 text-sm mb-4">
          La solicitud es válida si se realiza dentro de los plazos establecidos
          en la{" "}
          <a
            href="https://www.boletinoficial.gob.ar/detalleAviso/primera/235729/20201005"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-gray-500 hover:text-gray-800"
          >
            <strong>Resolución 424/2020</strong>
          </a>{" "}
          del Ministerio de Comercio Interior y no se traten de productos que
          estén exentos como productos personalizados y todos los comprendidos
          en el artículo 1116 del Código Civil y Comercial de la Nación.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="text"
            name="nombre"
            placeholder="Nombre completo"
            value={formData.nombre}
            onChange={handleChange}
            required
            className="border rounded px-3 py-2 focus:outline-none text-black focus:ring-2 focus:ring-gray-400"
          />
          <input
            type="tel"
            name="telefono"
            placeholder="Teléfono"
            value={formData.telefono}
            onChange={handleChange}
            required
            className="border rounded px-3 py-2 focus:outline-none text-black focus:ring-2 focus:ring-gray-400"
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            className="border rounded px-3 py-2 focus:outline-none text-black focus:ring-2 focus:ring-gray-400"
          />
          <input
            type="text"
            name="NumeroPedido"
            placeholder="Número de pedido"
            value={formData.NumeroPedido}
            onChange={handleChange}
            required
            className="border rounded px-3 py-2 focus:outline-none text-black focus:ring-2 focus:ring-gray-400"
          />
          <textarea
            name="inconveniente"
            placeholder="Describa el inconveniente"
            value={formData.inconveniente}
            onChange={handleChange}
            required
            className="border rounded px-3 py-2 focus:outline-none text-black focus:ring-2 focus:ring-gray-400"
          ></textarea>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`bg-black text-white py-2 rounded-2xl hover:bg-gray-800 transition flex items-center justify-center gap-2 ${
              isSubmitting ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Enviando...
              </>
            ) : (
              "Enviar"
            )}
          </button>

          {/* Mensaje de estado debajo del botón */}
          {status && (
            <div
              className={`mt-3 px-4 py-2 rounded-md text-center font-medium ${
                statusType === "success"
                  ? "border-[#005f73] focus:ring-[#005f73]"
                  : "border-gray-300 focus:ring-black"
              }`}
            >
              {status}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default ArrepentimientoModal;
