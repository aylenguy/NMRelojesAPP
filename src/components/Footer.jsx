import { useState } from "react";
import { FaInstagram, FaWhatsapp, FaEnvelope } from "react-icons/fa";
import TarjetasLogos from "../assets/Logostarjeta.png";
import EnviosLogos from "../assets/Logosenvios.png";
import ArrepentimientoModal from "./ArrepentimientoModal"; // <-- importamos el modal

const Footer = () => {
  const [showModal, setShowModal] = useState(false);

  return (
    <footer className="bg-black text-white py-12">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between gap-12">
        {/* Marca + slogan */}
        <div className="flex flex-col items-center md:items-start gap-3 md:w-1/3">
          <h3 className="text-4xl font-bold tracking-wide">N&M Relojes</h3>
          <p className="text-gray-400 text-center md:text-left">
            Calidad y estilo en cada reloj.
          </p>
        </div>

        {/* Contacto */}
        <div className="flex flex-col gap-4 md:w-1/3">
          <h4 className="text-lg font-semibold mb-2">Contacto</h4>
          <div className="flex flex-col gap-3">
            <a
              href="https://www.instagram.com/nm_relojes/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 text-white hover:text-pink-500 transition"
            >
              <FaInstagram className="text-2xl" /> @nm_relojes
            </a>
            <a
              href="https://wa.me/5493416000927"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 text-white hover:text-green-400 transition"
            >
              <FaWhatsapp className="text-2xl" /> +54 9 341 600 0927
            </a>
            <a
              href="mailto:nmrelojes@hotmail.com"
              className="flex items-center gap-3 text-white hover:text-blue-400 transition"
            >
              <FaEnvelope className="text-2xl" /> nmrelojes@hotmail.com
            </a>
          </div>
        </div>

        {/* Métodos de pago + envío */}
        <div className="flex flex-col gap-6 md:w-1/3">
          {/* Métodos de pago */}
          <div>
            <h4 className="text-lg font-semibold mb-2">Métodos de pago</h4>
            <div className="flex flex-wrap gap-4 items-center">
              <img src={TarjetasLogos} alt="Tarjetas" className="h-10" />
            </div>
          </div>

          {/* Métodos de envío */}
          <div>
            <h4 className="text-lg font-semibold mb-2">Métodos de envío</h4>
            <div className="flex flex-wrap gap-4 items-start justify-start">
              <img src={EnviosLogos} alt="Métodos de envío" className="h-8" />
            </div>
          </div>
        </div>
      </div>

      {/* Derechos reservados */}
      <div className="mt-12 text-center text-gray-500 text-sm">
        © {new Date().getFullYear()} N&M Relojes. Todos los derechos reservados.
      </div>

      {/* Información legal y botón de arrepentimiento */}
      <div className="mt-2 text-center text-gray-400 text-xs flex flex-wrap justify-center items-center gap-2">
        <span>
          Defensa de las y los consumidores. Para reclamos{" "}
          <a
            href="https://autogestion.produccion.gob.ar/consumidores"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-white transition"
          >
            ingresá acá
          </a>
          /
        </span>
        <button
          onClick={() => setShowModal(true)}
          className="underline hover:text-white transition text-xs"
        >
          Botón de arrepentimiento
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <ArrepentimientoModal onClose={() => setShowModal(false)} />
      )}
    </footer>
  );
};

export default Footer;
