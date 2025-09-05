import { useState, useEffect } from "react";

const Contacto = () => {
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    telefono: "",
    mensaje: "",
  });

  const [status, setStatus] = useState(null);
  const [statusType, setStatusType] = useState(null); // "success" o "error"
  const [isSubmitting, setIsSubmitting] = useState(false); // controla el spinner

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true); // activar spinner

    try {
      const response = await fetch("https://localhost:7247/api/contacto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setStatus("¡Mensaje enviado correctamente!");
        setStatusType("success");
        setFormData({ nombre: "", email: "", telefono: "", mensaje: "" });
      } else {
        setStatus("Error al enviar el mensaje.");
        setStatusType("error");
      }
    } catch (error) {
      console.error(error);
      setStatus("Error de conexión con el servidor.");
      setStatusType("error");
    } finally {
      setIsSubmitting(false); // desactivar spinner
    }
  };

  // Ocultar mensaje automáticamente después de 5s
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
    <div className="min-h-screen px-4 py-10">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold font-mono text-center text-gray-800 mb-10">
          Contacto
        </h1>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Nombre y Apellido
            </label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              E-mail
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Teléfono
            </label>
            <input
              type="tel"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Mensaje <span className="text-gray-400">(opcional)</span>
            </label>
            <textarea
              name="mensaje"
              value={formData.mensaje}
              onChange={handleChange}
              rows="5"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent resize-none"
            ></textarea>
          </div>

          <div className="text-center">
            <div className="text-center">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`py-2 px-9 bg-black text-white rounded-2xl hover:bg-gray-800 text-center shadow transition-all text-base flex items-center justify-center gap-2 min-w-[200px] mx-auto ${
                  isSubmitting ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {isSubmitting ? (
                  <>
                    {/* Spinner básico */}
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Enviando...
                  </>
                ) : (
                  "Enviar mensaje"
                )}
              </button>
            </div>

            {/* Mensaje debajo del botón */}
            {status && (
              <div
                className={`mt-4 px-4 py-2 rounded-md text-center font-medium text-[#005f73]`}
              >
                {status}
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default Contacto;
