import { useState, useEffect } from "react";
import { FaShoppingCart, FaUser } from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";
import LogoImg from "../assets/Logo.jpeg";
import RegisterModal from "./RegisterModal";
import LoginModal from "./LoginModal";

const Navbar = ({ onCartClick, searchText, setSearchText }) => {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  const location = useLocation();

  useEffect(() => {
    setShowLogin(false);
    setShowRegister(false);
  }, [location.pathname]);

  useEffect(() => {
    const onEsc = (e) => {
      if (e.key === "Escape") {
        setShowLogin(false);
        setShowRegister(false);
      }
    };
    if (showLogin || showRegister) {
      window.addEventListener("keydown", onEsc);
    }
    return () => {
      window.removeEventListener("keydown", onEsc);
    };
  }, [showLogin, showRegister]);

  return (
    <nav className="bg-white shadow-md py-5 px-8 border-b border-gray-200 z-50 relative">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-6">
        <Link to="/">
          <img src={LogoImg} alt="Logo" className="h-28 cursor-pointer" />
        </Link>

        {/* Buscador */}
        <div className="w-full lg:w-1/3">
          <input
            type="text"
            placeholder="Buscar relojes..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full px-5 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-800"
          />
        </div>

        {/* Navegación */}
        <div className="flex flex-wrap gap-4 justify-center text-base lg:text-lg font-semibold font-mono">
          {[
            { to: "/como-comprar", label: "Cómo Comprar" },
            { to: "/contacto", label: "Contacto" },
            { to: "/envio", label: "Envío" },
            { to: "/producto", label: "Productos" },
          ].map((item, idx) => (
            <Link
              key={idx}
              to={item.to}
              className="relative inline-block px-4 py-2 rounded-md text-gray-700 hover:text-black transition-all duration-200 group"
            >
              <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-black transition-all duration-300 group-hover:w-full"></span>
              {item.label}
            </Link>
          ))}
        </div>

        {/* Iconos */}
        <div className="flex items-center gap-5 relative">
          <button
            onClick={() => setShowLogin(true)}
            className="text-gray-700 hover:text-gray-900"
            aria-label="Abrir modal de inicio de sesión"
          >
            <FaUser className="text-xl" />
          </button>

          <button
            onClick={onCartClick}
            className="text-gray-700 hover:text-yellow-500"
            aria-label="Abrir carrito"
          >
            <FaShoppingCart className="text-xl" />
          </button>
        </div>
      </div>

      {/* Modales */}
      <LoginModal
        show={showLogin}
        onClose={() => setShowLogin(false)}
        onSwitchToRegister={() => {
          setShowLogin(false);
          setShowRegister(true);
        }}
      />

      <RegisterModal
        show={showRegister}
        onClose={() => setShowRegister(false)}
        onSwitchToLogin={() => {
          setShowRegister(false);
          setShowLogin(true);
        }}
      />
    </nav>
  );
};

export default Navbar;
