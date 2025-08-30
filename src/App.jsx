// src/App.jsx
import { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";

// Contextos
import { useLoader } from "./context/LoaderContext";
import { useAuth } from "./context/AuthContext";

// Componentes
import Navbar from "./components/Navbar";
import CartSidebar from "./components/CartSidebar";
import Footer from "./components/Footer";
import DetailProduct from "./components/DetailProduct";
import Login from "./components/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import GlobalSpinner from "./components/GlobalSpinner";
import ScrollToTop from "./components/ScrollToTop";

// Páginas
import Home from "./pages/Home";
import ComoComprar from "./pages/ComoComprar";
import Contacto from "./pages/Contacto";
import Envio from "./pages/Envio";
import Productos from "./pages/Productos";
import ResetPassword from "./pages/ResetPassword";

// Nuevo flujo checkout
import CheckoutStep1 from "./pages/CheckoutStep1";
import CheckoutStep2 from "./pages/CheckoutStep2";
import CheckoutStep3 from "./pages/CheckoutStep3";
import CheckoutSuccess from "./pages/CheckoutSuccess";

// Admin
import AdminLayout from "./pages/admin/AdminLayout";

import AdminProducts from "./pages/admin/AdminProducts";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminOrders from "./pages/admin/AdminOrders";
import EditProduct from "./pages/admin/EditProduct";
import ProfilePage from "./components/ProfilePage";
import Recuperar from "./pages/Recuperar";

function App() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchText, setSearchText] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { setIsLoading } = useLoader();

  // Mostrar spinner en cambios de ruta
  useEffect(() => {
    setIsLoading(true);
    const timeout = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timeout);
  }, [location.pathname, setIsLoading]);

  // Cargar carrito desde localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
  }, []);

  // Guardar carrito en localStorage
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product) => {
    const normalizedProduct = {
      id: product.id,
      name: product.name || product.nombre,
      price: product.price || product.precio,
      image: product.image || product.imagen,
      quantity: 1,
    };

    setCartItems((prevItems) => {
      const itemExists = prevItems.find(
        (item) => item.id === normalizedProduct.id
      );
      if (itemExists) {
        return prevItems.map((item) =>
          item.id === normalizedProduct.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prevItems, normalizedProduct];
      }
    });
  };

  const removeFromCart = (productId) => {
    setCartItems((prevItems) =>
      prevItems.filter((item) => item.id !== productId)
    );
  };

  const decreaseQuantity = (productId) => {
    setCartItems((prevItems) =>
      prevItems
        .map((item) =>
          item.id === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const handleProductClick = (product) => {
    setSelectedProduct(product);
    navigate(`/producto/${product.id}`);
  };

  const finalizePurchase = () => {
    navigate("/checkout/paso-1");
    setIsCartOpen(false);
  };

  return (
    <div className="font-sans">
      <GlobalSpinner /> {/* Spinner global siempre disponible */}
      <Navbar
        onCartClick={() => setIsCartOpen(true)}
        searchText={searchText}
        setSearchText={setSearchText}
      />
      <ScrollToTop /> {/* <-- Colocalo aquí */}
      <Routes>
        {/* Rutas públicas */}
        <Route
          path="/"
          element={
            <Home
              onAddToCart={addToCart}
              onProductClick={handleProductClick}
              searchText={searchText}
            />
          }
        />
        <Route
          path="/producto"
          element={
            <Productos
              onAddToCart={addToCart}
              onProductClick={handleProductClick}
              searchText={searchText}
            />
          }
        />
        <Route
          path="/producto/:id"
          element={
            <DetailProduct product={selectedProduct} addToCart={addToCart} />
          }
        />
        <Route path="/como-comprar" element={<ComoComprar />} />
        <Route path="/contacto" element={<Contacto />} />
        <Route path="/envio" element={<Envio />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profilepage" element={<ProfilePage />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/recuperar" element={<Recuperar />} />

        {/* Rutas protegidas para clientes */}
        <Route element={<ProtectedRoute allowGuest={true} />}>
          <Route path="/checkout/paso-1" element={<CheckoutStep1 />} />
          <Route path="/checkout/paso-2" element={<CheckoutStep2 />} />
          <Route path="/checkout/paso-3" element={<CheckoutStep3 />} />
          <Route path="/checkout/success" element={<CheckoutSuccess />} />
        </Route>

        {/* Rutas protegidas: admin */}
        <Route element={<ProtectedRoute requiredRole="admin" />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="products" element={<AdminProducts />} />
            <Route path="products/edit/:id" element={<EditProduct />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="orders" element={<AdminOrders />} />
          </Route>
        </Route>
      </Routes>
      <CartSidebar
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        removeFromCart={removeFromCart}
        decreaseQuantity={decreaseQuantity}
        finalizePurchase={finalizePurchase}
      />
      <Footer />
    </div>
  );
}

export default App;
