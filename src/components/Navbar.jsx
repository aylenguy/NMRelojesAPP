import { useState, useEffect, useMemo } from "react";
import { FaShoppingCart, FaUser, FaSignOutAlt } from "react-icons/fa";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import LogoImg from "../assets/Logo.jpeg";
import RegisterModal from "./RegisterModal";
import LoginModal from "./LoginModal";
import CartSidebar from "./CartSidebar";

const Navbar = ({ searchText, setSearchText }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const { cart, cartSidebarOpen, setCartSidebarOpen } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const role = user?.role?.toLowerCase();

  const cartCount = useMemo(
    () =>
      cart?.items?.reduce((acc, item) => acc + (item.quantity || 1), 0) ?? 0,
    [cart]
  );

  const navLinks = useMemo(() => {
    if (role === "admin") return [{ label: "Panel Admin", to: "/admin" }];
    return [
      { label: "Inicio", to: "/" },
      { label: "Productos", to: "/producto" },
      { label: "Contacto", to: "/contacto" },
      { label: "¿Cómo comprar?", to: "/como-comprar" },
      { label: "Envíos", to: "/envio" },
    ];
  }, [role]);

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

  return (
    <nav className="bg-white shadow-md border-b border-gray-200 z-50 relative">
      {/* Spinner logout */}
      {loggingOut && (
        <div className="fixed inset-0 flex items-center justify-center bg-white/40 backdrop-blur-sm z-[9999]">
          <div className="w-20 h-20 rounded-full border-4 border-t-transparent animate-spin shadow-lg"></div>
        </div>
      )}

      {/* Barra superior promo animada */}
      <div className="bg-yellow-100 text-gray-800 text-sm font-medium overflow-hidden relative h-6">
        <div className="absolute whitespace-nowrap flex animate-marquee">
          {/* Texto duplicado para que sea continuo */}
          <span className="mr-8">
            20% de descuento abonando en efectivo/transferencia · Envío gratis a
            todo el país
          </span>
          <span className="mr-8">
            20% de descuento abonando en efectivo/transferencia · Envío gratis a
            todo el país
          </span>
          <span className="mr-8">
            20% de descuento abonando en efectivo/transferencia · Envío gratis a
            todo el país
          </span>
        </div>
      </div>

      {/* Barra principal */}
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4 gap-6">
        {/* Logo */}
        <Link to="/" className="flex-shrink-0">
          <img src={LogoImg} alt="Logo" className="h-24 cursor-pointer" />
        </Link>

        {/* Buscador */}
        <div className="flex-1 max-w-lg">
          <input
            type="text"
            placeholder="¿Qué buscás?"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        {/* Usuario / Carrito */}
        <div className="flex items-center gap-5">
          {isAuthenticated ? (
            <>
              <span className="font-medium text-gray-700 hidden md:block font-poppins">
                {user?.name} {user?.lastName}
              </span>

              {/* Carrito */}
              {role === "client" && (
                <button
                  onClick={() => setCartSidebarOpen(!cartSidebarOpen)}
                  className="relative flex items-center justify-center text-gray-700 hover:text-black"
                  aria-label="Abrir carrito"
                >
                  <FaShoppingCart className="text-xl" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                      {cartCount}
                    </span>
                  )}
                </button>
              )}

              <button
                onClick={handleLogout}
                className="text-red-600 hover:text-red-800"
                aria-label="Cerrar sesión"
              >
                <FaSignOutAlt className="text-xl" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setShowLogin(true)}
                className="flex items-center gap-2 text-gray-700 hover:text-gray-900"
                aria-label="Iniciar sesión"
              >
                <span className="hidden md:inline font-poppins">
                  Iniciar sesión
                </span>
                <FaUser className="text-xl" />
              </button>

              {/* Carrito visible también si no está logueado */}
              <button
                onClick={() => setCartSidebarOpen(true)}
                className="relative flex items-center justify-center text-gray-700 hover:text-black"
                aria-label="Abrir carrito"
              >
                <FaShoppingCart className="text-xl" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                    {cartCount}
                  </span>
                )}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Links de navegación */}
      <div className="bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto flex items-center gap-8 py-3 pl-12 text-gray-700 text-base font-poppins">
          {navLinks.map((link) => (
            <Link key={link.to} to={link.to} className="hover:text-black">
              {link.label}
            </Link>
          ))}
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
