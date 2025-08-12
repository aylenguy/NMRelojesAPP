// src/App.jsx
import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
} from "react-router-dom";

// Contexto
import { useAuth } from "./context/AuthContext";

// Componentes
import Navbar from "./components/Navbar";
import CartSidebar from "./components/CartSidebar";
import Footer from "./components/Footer";
import DetailProduct from "./components/DetailProduct";
import Login from "./components/Login"; // login unificado
import ProtectedRoute from "./components/ProtectedRoute"; // ✅ Este reemplaza PrivateRoute

// Páginas
import Home from "./pages/Home";
import ComoComprar from "./pages/ComoComprar";
import Contacto from "./pages/Contacto";
import Envio from "./pages/Envio";
import Productos from "./pages/Productos";

// Admin
import AdminLayout from "./pages/admin/AdminLayout";
import Dashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminOrders from "./pages/admin/AdminOrders";

function App() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchText, setSearchText] = useState("");
  const navigate = useNavigate();

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
    navigate("/checkout");
    setIsCartOpen(false);
  };

  return (
    <div className="font-sans">
      <Navbar
        onCartClick={() => setIsCartOpen(true)}
        searchText={searchText}
        setSearchText={setSearchText}
      />

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

        {/* Ruta protegida: cliente */}
        <Route
          path="/checkout"
          element={
            <ProtectedRoute requiredRole="cliente">
              <div className="p-8">Página de compra (Checkout)</div>
            </ProtectedRoute>
          }
        />

        {/* Rutas protegidas: admin con layout */}
        <Route element={<ProtectedRoute requiredRole="admin" />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="products" element={<AdminProducts />} />
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
