import { useState, useEffect } from "react";
import { FaShoppingCart, FaUser, FaSignOutAlt } from "react-icons/fa";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import LogoImg from "../assets/Logo.jpeg";
import RegisterModal from "./RegisterModal";
import LoginModal from "./LoginModal";
import CartSidebar from "./CartSidebar";
import GlobalSpinner from "./GlobalSpinner";

const Navbar = ({ searchText, setSearchText }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const { cart, cartSidebarOpen, setCartSidebarOpen } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false); // spinner logout

  useEffect(() => {
    setShowLogin(false);
    setShowRegister(false);
  }, [location.pathname]);

  useEffect(() => {
    const onEsc = (e) => {
      if (e.key === "Escape") {
        setShowLogin(false);
        setShowRegister(false);
        setCartSidebarOpen(false);
      }
    };
    if (showLogin || showRegister || cartSidebarOpen) {
      window.addEventListener("keydown", onEsc);
    }
    return () => window.removeEventListener("keydown", onEsc);
  }, [showLogin, showRegister, cartSidebarOpen, setCartSidebarOpen]);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
      setTimeout(() => {
        setLoggingOut(false);
        navigate("/");
      }, 1000);
    } catch (error) {
      console.error(error);
      setLoggingOut(false);
    }
  };

  const role = user?.role?.toLowerCase();
  const cartCount =
    cart?.items?.reduce((acc, item) => acc + (item.quantity || 1), 0) ?? 0;

  return (
    <nav className="bg-white shadow-md py-5 px-8 border-b border-gray-200 z-50 relative">
      {loggingOut && (
        <div className="fixed inset-0 flex items-center justify-center bg-white/40 backdrop-blur-sm z-[9999]">
          <div className="w-20 h-20 rounded-full border-4 border-t-transparent animate-spin shadow-lg"></div>
        </div>
      )}

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

        {/* Menú */}
        <div className="flex flex-wrap gap-4 justify-center text-base lg:text-lg font-semibold font-mono">
          {role === "admin" ? (
            <Link to="/admin" className="hover:text-black">
              Panel Admin
            </Link>
          ) : (
            <>
              <Link to="/como-comprar" className="hover:text-black">
                Cómo Comprar
              </Link>
              <Link to="/contacto" className="hover:text-black">
                Contacto
              </Link>
              <Link to="/envio" className="hover:text-black">
                Envío
              </Link>
              <Link to="/producto" className="hover:text-black">
                Productos
              </Link>
            </>
          )}
        </div>

        {/* Usuario / Carrito */}
        <div className="flex items-center gap-5 relative">
          {isAuthenticated ? (
            <>
              <span className="font-semibold mr-2 text-gray-700">
                Hola, {user?.name || user?.email}
              </span>

              {role === "client" && (
                <button
                  onClick={() => navigate("/profilepage")}
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

              {role === "client" && (
                <button
                  onClick={() => setCartSidebarOpen(!cartSidebarOpen)}
                  className="relative text-gray-700 hover:text-black"
                  aria-label="Abrir carrito"
                >
                  <FaShoppingCart className="text-xl" />
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      {cartCount}
                    </span>
                  )}
                </button>
              )}
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
                onClick={() => setCartSidebarOpen(true)}
                className="relative text-gray-700 hover:text-black"
                aria-label="Abrir carrito"
              >
                <FaShoppingCart className="text-xl" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {cartCount}
                  </span>
                )}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Modales */}
      {location.pathname !== "/login" && location.pathname !== "/register" && (
        <>
          <LoginModal
            show={showLogin}
            onClose={() => setShowLogin(false)}
            onSwitchToRegister={() => {
              setShowLogin(false);
              setShowRegister(true);
            }}
            onLoginSuccess={() => setShowLogin(false)}
          />

          <RegisterModal
            show={showRegister}
            onClose={() => setShowRegister(false)}
            onSwitchToLogin={() => {
              setShowRegister(false);
              setShowLogin(true);
            }}
          />
        </>
      )}

      {/* Sidebar */}
      <CartSidebar />
    </nav>
  );
};

export default Navbar;
