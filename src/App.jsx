import { useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import ComoComprar from "./pages/ComoComprar";
import Contacto from "./pages/Contacto";
import Envio from "./pages/Envio";
import CartSidebar from "./components/CartSidebar";
import Footer from "./components/Footer";
import DetailProduct from "./components/DetailProduct";
import Productos from "./pages/Productos";

function App() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchText, setSearchText] = useState("");

  const navigate = useNavigate();

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

  return (
    <div className="font-sans">
      <Navbar
        onCartClick={() => setIsCartOpen(true)}
        searchText={searchText}
        setSearchText={setSearchText}
      />

      <Routes>
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
      </Routes>

      <CartSidebar
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        removeFromCart={removeFromCart}
        decreaseQuantity={decreaseQuantity}
      />

      <Footer />
    </div>
  );
}

export default App;
