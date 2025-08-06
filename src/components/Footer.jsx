import {
  FaInstagram,
  FaFacebook,
  FaWhatsapp,
  FaCcVisa,
  FaCcMastercard,
  FaCcAmex,
  FaCcPaypal,
} from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-black text-white py-12 mt-20">
      <div className="max-w-6xl mx-auto px-6 text-center">
        {/* Marca */}
        <h3 className="text-3xl font-bold tracking-wide mb-4">N&M Relojes</h3>

        {/* Redes Sociales */}
        <div className="flex justify-center gap-6 mb-8">
          <a
            href="https://www.instagram.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white text-black hover:bg-pink-500 hover:text-white transition"
          >
            <FaInstagram />
          </a>
          <a
            href="https://www.facebook.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white text-black hover:bg-blue-600 hover:text-white transition"
          >
            <FaFacebook />
          </a>
          <a
            href="https://wa.me/549XXXXXXXXXX"
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white text-black hover:bg-green-500 hover:text-white transition"
          >
            <FaWhatsapp />
          </a>
        </div>

        {/* Métodos de pago */}
        <div className="mb-8">
          <h4 className="text-lg font-semibold mb-3">Métodos de pago</h4>
          <div className="flex justify-center gap-6 text-3xl text-gray-300">
            <FaCcVisa className="hover:text-white transition" />
            <FaCcMastercard className="hover:text-white transition" />
            <FaCcAmex className="hover:text-white transition" />
            <FaCcPaypal className="hover:text-white transition" />
          </div>
        </div>

        {/* Derechos reservados */}
        <div className="text-xs text-gray-500">
          © {new Date().getFullYear()} N&M Relojes. Todos los derechos
          reservados.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
