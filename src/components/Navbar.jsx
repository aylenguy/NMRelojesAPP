import { useState, useEffect, useMemo } from "react";
import { FaShoppingCart, FaUser, FaSignOutAlt, FaSearch } from "react-icons/fa";
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

  const [showProductosSubmenu, setShowProductosSubmenu] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  const role = user?.role?.toLowerCase();

  const getItemCantidad = (item) =>
    item.cantidad || item.Cantidad || item.quantity || 1;

  const cartCount = useMemo(
    () =>
      cart?.items?.reduce((acc, item) => acc + getItemCantidad(item), 0) ?? 0,
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

  const marcas = ["Rolex", "Casio", "Seiko", "Citizen", "Fossil"];

  useEffect(() => {
    setShowLogin(false);
    setShowRegister(false);
    setMobileMenuOpen(false);
    setShowSearch(false);
  }, [location.pathname]);

  useEffect(() => {
    const onEsc = (e) => {
      if (e.key === "Escape") {
        setShowLogin(false);
        setShowRegister(false);
        setCartSidebarOpen(false);
        setMobileMenuOpen(false);
        setShowSearch(false);
      }
    };
    if (
      showLogin ||
      showRegister ||
      cartSidebarOpen ||
      mobileMenuOpen ||
      showSearch
    ) {
      window.addEventListener("keydown", onEsc);
    }
    return () => window.removeEventListener("keydown", onEsc);
  }, [
    showLogin,
    showRegister,
    cartSidebarOpen,
    mobileMenuOpen,
    showSearch,
    setCartSidebarOpen,
  ]);

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

      {/* Barra superior promo */}
      <div className="bg-yellow-100 text-gray-800 text-sm font-medium overflow-hidden relative h-6">
        <div className="absolute whitespace-nowrap flex animate-marquee">
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
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3 md:px-6 md:py-4 gap-4">
        {/* Logo + hamburguesa */}
        <div className="flex items-center gap-2">
          <Link to="/" className="flex-shrink-0">
            <img
              src={LogoImg}
              alt="Logo"
              className="h-16 md:h-24 cursor-pointer"
            />
          </Link>
          <button
            className="md:hidden text-2xl text-gray-700"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            ☰
          </button>
        </div>

        {/* Buscador desktop */}
        <div className="hidden md:flex flex-1 max-w-lg">
          <input
            type="text"
            placeholder="¿Qué buscás?"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        {/* Usuario / Carrito */}
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <span className="font-medium text-gray-700 hidden md:block font-poppins">
                {user?.name} {user?.lastName}
              </span>

              <Link
                to="/profilepage"
                className="flex items-center gap-2 text-gray-700 hover:text-black hidden md:flex"
              >
                <FaUser className="text-xl" />
                <span className="hidden md:inline">Mi perfil</span>
              </Link>

              {role === "client" && (
                <button
                  onClick={() => setCartSidebarOpen(!cartSidebarOpen)}
                  className="relative flex items-center justify-center text-gray-700 hover:text-black"
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
              >
                <FaSignOutAlt className="text-xl" />
              </button>
            </>
          ) : (
            <>
              {/* 🔹 Mostrar iniciar sesión con icono solo en desktop */}
              <button
                onClick={() => setShowLogin(true)}
                className="hidden md:flex items-center gap-2 text-gray-700 hover:text-black"
              >
                <FaUser className="text-xl" />
                <span>Iniciar sesión</span>
              </button>

              <button
                onClick={() => setCartSidebarOpen(true)}
                className="relative flex items-center justify-center text-gray-700 hover:text-black"
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

          {/* Botón búsqueda mobile */}
          <button
            className="md:hidden text-xl text-gray-700"
            onClick={() => setShowSearch(!showSearch)}
          >
            <FaSearch />
          </button>
        </div>
      </div>

      {/* Input búsqueda mobile */}
      {showSearch && (
        <div className="md:hidden px-4 py-2 bg-white border-t border-gray-200">
          <input
            type="text"
            placeholder="¿Qué buscás?"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>
      )}

      {/* Links navegación desktop */}
      <div className="hidden md:block bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto flex items-center gap-8 py-3 pl-12 text-gray-700 text-base font-poppins">
          {navLinks.map((link) => (
            <Link key={link.to} to={link.to} className="hover:text-black">
              {link.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Menú móvil */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-gray-50 border-t border-gray-200 px-4 py-3 space-y-4">
          <div className="flex flex-col gap-3">
            {navLinks.map((link) => (
              <div key={link.to}>
                <button
                  className="w-full text-left text-gray-700 hover:text-black flex justify-between items-center"
                  onClick={() => {
                    if (link.label === "Productos") {
                      setShowProductosSubmenu(!showProductosSubmenu);
                    } else {
                      setMobileMenuOpen(false);
                      navigate(link.to);
                    }
                  }}
                >
                  {link.label}
                  {link.label === "Productos" && (
                    <span className="ml-2">
                      {showProductosSubmenu ? "▲" : "▼"}
                    </span>
                  )}
                </button>

                {/* Submenú marcas */}
                {link.label === "Productos" && showProductosSubmenu && (
                  <div className="flex flex-col pl-4 mt-1 space-y-1">
                    <Link
                      to="/producto"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block text-sm pl-4 py-2 rounded text-gray-700 hover:text-gray-900"
                    >
                      Ver todos los productos
                    </Link>

                    {marcas.map((marca) => {
                      const linkTo = `/producto?marca=${encodeURIComponent(
                        marca
                      )}`;
                      return (
                        <Link
                          key={marca}
                          to={linkTo}
                          onClick={() => setMobileMenuOpen(false)}
                          className="block text-sm pl-4 py-2 rounded text-gray-600 hover:text-gray-900"
                        >
                          {marca}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}

            {/* Opciones login/registro en mobile */}
            {!isAuthenticated && (
              <div className="flex flex-col gap-1 mt-4 border-t pt-3 text-center">
                <button
                  onClick={() => {
                    setShowLogin(true);
                    setMobileMenuOpen(false);
                  }}
                  className="text-black text-sm hover:underline"
                >
                  Iniciar sesión
                </button>
                <button
                  onClick={() => {
                    setShowRegister(true);
                    setMobileMenuOpen(false);
                  }}
                  className="text-black text-sm hover:underline"
                >
                  Registrarse
                </button>
              </div>
            )}
          </div>
        </div>
      )}

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

      {/* Sidebar carrito */}
      <CartSidebar
        isOpen={cartSidebarOpen}
        onClose={() => setCartSidebarOpen(false)}
      />
    </nav>
  );
};

export default Navbar;
