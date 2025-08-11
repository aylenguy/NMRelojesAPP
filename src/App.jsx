import { useState, useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

// 📌 Componentes
import Navbar from "./components/Navbar";
import CartSidebar from "./components/CartSidebar";
import Footer from "./components/Footer";
import DetailProduct from "./components/DetailProduct";

// 📌 Páginas
import Home from "./pages/Home";
import ComoComprar from "./pages/ComoComprar";
import Contacto from "./pages/Contacto";
import Envio from "./pages/Envio";
import Productos from "./pages/Productos";
import LoginClient from "./components/LoginClient";
import LoginAdmin from "./components/LoginAdmin";

// 🔹 Rutas privadas
const PrivateRoute = ({ children, role }) => {
  const { user } = useAuth();

  if (!user) {
    return <div className="p-8 text-center">⚠️ Debes iniciar sesión</div>;
  }

  if (role && user.role !== role) {
    return <div className="p-8 text-center">🚫 No tienes permisos</div>;
  }

  return children;
};

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
        <Route path="/login-cliente" element={<LoginClient />} />
        <Route path="/login-admin" element={<LoginAdmin />} />

        {/* Rutas protegidas */}
        <Route
          path="/admin"
          element={
            <PrivateRoute role="admin">
              <LoginAdmin />
            </PrivateRoute>
          }
        />

        <Route
          path="/checkout"
          element={
            <PrivateRoute role="cliente">
              <div className="p-8">Página de compra (Checkout)</div>
            </PrivateRoute>
          }
        />
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
