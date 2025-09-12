// src/context/CartContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const CartContext = createContext();
export const useCart = () => useContext(CartContext);

// API base (usando variable de entorno)
const API_URL = `${import.meta.env.VITE_API_URL}/cart`;

// Guest ID local (para carrito sin login)
const getGuestId = () => {
  let guestId = localStorage.getItem("guestId");
  if (!guestId) {
    guestId = crypto.randomUUID();
    localStorage.setItem("guestId", guestId);
  }
  return guestId;
};

export const CartProvider = ({ children }) => {
  // 👇 Inicializamos como objeto con items + total
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [cartSidebarOpen, setCartSidebarOpen] = useState(false); // ✅ Estado sidebar
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Obtener headers
  const getHeaders = () => (token ? { Authorization: `Bearer ${token}` } : {});

  // Ajuste para HTTPS en imágenes
  const fixImageUrl = (url) => {
    if (!url) return null;
    return url.startsWith("http://") ? url.replace("http://", "https://") : url;
  };

  // Cargar carrito
  const fetchCart = async () => {
    setLoading(true);
    setError(null);
    try {
      const url = token
        ? `${API_URL}`
        : `${API_URL}/guest?guestId=${getGuestId()}`;

      const res = await axios.get(url, { headers: getHeaders() });

      // 👇 Tu backend devuelve { items, total }
      const { items = [], total = 0 } = res.data;

      // Opcional: convertir todas las URLs de imagen a HTTPS
      const cartWithHttpsImages = items.map((item) => ({
        ...item,
        image: item.image ? fixImageUrl(item.image) : null,
      }));

      const updatedCart = { items: cartWithHttpsImages, total };
      setCart(updatedCart);
      return updatedCart;
    } catch (err) {
      console.error("Error al obtener carrito:", err);
      setError(err.response?.data?.message || "No se pudo cargar el carrito");
      setCart({ items: [], total: 0 }); // reset al fallar
    } finally {
      setLoading(false);
    }
  };

  // Agregar producto
  const addToCart = async (productId, quantity = 1) => {
    try {
      const url = token
        ? `${API_URL}/add`
        : `${API_URL}/guest/add?guestId=${getGuestId()}`;
      await axios.post(url, { productId, quantity }, { headers: getHeaders() });
      return await fetchCart();
    } catch (err) {
      console.error("Error al agregar producto:", err);
      setError(err.response?.data?.message || "No se pudo agregar el producto");
    }
  };

  // Eliminar producto
  const removeFromCart = async (productId) => {
    try {
      const url = token
        ? `${API_URL}/remove/${productId}`
        : `${API_URL}/guest/remove/${productId}?guestId=${getGuestId()}`;
      await axios.delete(url, { headers: getHeaders() });
      return await fetchCart();
    } catch (err) {
      console.error("Error al eliminar producto:", err);
      setError(
        err.response?.data?.message || "No se pudo eliminar el producto"
      );
    }
  };

  // Vaciar carrito
  const clearCart = async () => {
    try {
      const url = token
        ? `${API_URL}/clear`
        : `${API_URL}/guest/clear?guestId=${getGuestId()}`;
      await axios.delete(url, { headers: getHeaders() });
      return await fetchCart();
    } catch (err) {
      console.error("Error al vaciar carrito:", err);
      setError(err.response?.data?.message || "No se pudo vaciar el carrito");
    }
  };

  // Cargar carrito al inicio o si cambia el token
  useEffect(() => {
    fetchCart();
  }, [token]);

  // Escuchar cambios de token en localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      setToken(localStorage.getItem("token"));
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return (
    <CartContext.Provider
      value={{
        cart,
        cartSidebarOpen, // ✅ Expuesto para Navbar/CartSidebar
        setCartSidebarOpen, // ✅ Expuesto para Navbar/CartSidebar
        loading,
        error,
        fetchCart,
        addToCart,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
