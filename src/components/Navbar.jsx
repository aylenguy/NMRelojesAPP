import { useState, useEffect } from "react";
import { FaShoppingCart, FaUser, FaSignOutAlt } from "react-icons/fa";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LogoImg from "../assets/Logo.jpeg";
import RegisterModal from "./RegisterModal";
import LoginModal from "./LoginModal";

const Navbar = ({ onCartClick, searchText, setSearchText }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

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
    return () => window.removeEventListener("keydown", onEsc);
  }, [showLogin, showRegister]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="bg-white shadow-md py-5 px-8 border-b border-gray-200 z-50 relative">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-6">
        {/* Logo */}
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

        {/* Usuario e íconos */}
        <div className="flex items-center gap-5 relative">
          {isAuthenticated ? (
            <>
              <span className="font-semibold mr-2 text-gray-700">
                Hola, {user?.name || user?.email}
              </span>

              {user?.role?.toLowerCase() === "admin" && (
                <Link
                  to="/admin"
                  className="text-gray-700 hover:text-black font-semibold mr-4"
                >
                  Panel Admin
                </Link>
              )}

              {user?.role?.toLowerCase() === "client" && (
                <button
                  onClick={() => navigate("/profile")}
                  className="text-gray-700 hover:text-black font-semibold mr-4"
                >
                  Mi perfil
                </button>
              )}

              <button
                onClick={handleLogout}
                className="text-red-600 hover:text-red-800"
                aria-label="Cerrar sesión"
              >
                <FaSignOutAlt className="text-xl" />
              </button>

              <button
                onClick={onCartClick}
                className="text-gray-700 hover:text-yellow-500"
                aria-label="Abrir carrito"
              >
                <FaShoppingCart className="text-xl" />
              </button>
            </>
          ) : (
            <>
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
            </>
          )}
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
        onLoginSuccess={() => setShowLogin(false)} // 👈 cerrar modal al loguear
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
