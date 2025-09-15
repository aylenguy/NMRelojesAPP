// src/context/CartContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";

const CartContext = createContext();
export const useCart = () => useContext(CartContext);

// API base
const API_URL = `${import.meta.env.VITE_API_URL}/Cart`;

export const CartProvider = ({ children }) => {
  const { token } = useAuth();
  const [cart, setCart] = useState(null);
  const [cartSidebarOpen, setCartSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Headers con token si existe
  const getHeaders = () => (token ? { Authorization: `Bearer ${token}` } : {});

  // Fix HTTPS en imágenes
  const fixImageUrl = (url) => {
    if (!url) return null;
    return url.startsWith("http://") ? url.replace("http://", "https://") : url;
  };

  // 🔹 Cargar carrito
  const fetchCart = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log("📦 FetchCart → token:", token ? "sí" : "no");
      console.log("📦 FetchCart → URL:", token ? API_URL : `${API_URL}/guest`);

      const res = token
        ? await axios.get(API_URL, { headers: getHeaders() })
        : await axios.get(`${API_URL}/guest`);

      console.log("📦 Respuesta carrito:", res.data);

      const { items = [], total = 0 } = res.data;

      const cartWithHttpsImages = items.map((item) => ({
        ...item,
        image: item.image ? fixImageUrl(item.image) : null,
      }));

      const updatedCart = { items: cartWithHttpsImages, total };
      setCart(updatedCart);
      return updatedCart;
    } catch (err) {
      console.error("❌ Error al obtener carrito:", err);
      setError(err.response?.data?.message || "No se pudo cargar el carrito");
      setCart({ items: [], total: 0 });
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Agregar producto
  const addToCart = async (productId, quantity = 1) => {
    try {
      console.log("➕ addToCart →", { productId, quantity, token: !!token });
      if (token) {
        await axios.post(
          `${API_URL}/add`,
          { productId, quantity },
          { headers: getHeaders() }
        );
      } else {
        await axios.post(`${API_URL}/guest/add`, {
          productId,
          quantity,
        });
      }

      const updatedCart = await fetchCart();
      setCartSidebarOpen(true);
      return updatedCart;
    } catch (err) {
      console.error("❌ Error al agregar producto:", err);
      setError(err.response?.data?.message || "No se pudo agregar el producto");
    }
  };

  // 🔹 Eliminar producto
  const removeFromCart = async (cartItemId) => {
    try {
      console.log("🗑 removeFromCart →", { cartItemId, token: !!token });
      if (token) {
        await axios.delete(`${API_URL}/item/${cartItemId}`, {
          headers: getHeaders(),
        });
      } else {
        await axios.delete(`${API_URL}/guest/item/${cartItemId}`);
      }

      return await fetchCart();
    } catch (err) {
      console.error("❌ Error al eliminar producto:", err);
      setError(
        err.response?.data?.message || "No se pudo eliminar el producto"
      );
    }
  };

  // 🔹 Vaciar carrito
  const clearCart = async () => {
    try {
      console.log("🧹 clearCart →", { token: !!token });
      if (token) {
        await axios.post(`${API_URL}/clear`, {}, { headers: getHeaders() });
      } else {
        await axios.post(`${API_URL}/guest/clear`);
      }
      return await fetchCart();
    } catch (err) {
      console.error("❌ Error al vaciar carrito:", err);
      setError(err.response?.data?.message || "No se pudo vaciar el carrito");
    }
  };

  // Cargar carrito al inicio o si cambia el token
  useEffect(() => {
    fetchCart();
  }, [token]);

  return (
    <CartContext.Provider
      value={{
        cart,
        cartSidebarOpen,
        setCartSidebarOpen,
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
