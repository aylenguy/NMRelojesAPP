// src/components/ArrepentimientoModal.jsx
import { useState } from "react";

const ArrepentimientoModal = ({ onClose }) => {
  const [formData, setFormData] = useState({
    nombre: "",
    telefono: "",
    email: "",
    codigoCompra: "",
    inconveniente: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await fetch("/api/arrepentimiento", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      alert("Tu solicitud de arrepentimiento ha sido enviada.");
      onClose();
    } catch (error) {
      console.error(error);
      alert("Hubo un error al enviar la solicitud.");
    }
  };

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
            className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400"
          />
          <input
            type="tel"
            name="telefono"
            placeholder="Teléfono"
            value={formData.telefono}
            onChange={handleChange}
            required
            className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400"
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400"
          />

          <textarea
            name="inconveniente"
            placeholder="Describa el inconveniente"
            value={formData.inconveniente}
            onChange={handleChange}
            required
            className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400"
          ></textarea>

          <button
            type="submit"
            className="bg-black text-white py-2 rounded-2xl hover:bg-gray-800 transition"
          >
            Enviar
          </button>
        </form>
      </div>
    </div>
  );
};

export default ArrepentimientoModal;
