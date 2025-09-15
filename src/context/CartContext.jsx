// src/context/CartContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const CartContext = createContext();
export const useCart = () => useContext(CartContext);

// API base
const API_URL = `${import.meta.env.VITE_API_URL}/Cart`;

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
  const [cart, setCart] = useState(null);
  const [cartSidebarOpen, setCartSidebarOpen] = useState(false);
  const [token, setToken] = useState(localStorage.getItem("token"));
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
      const res = token
        ? await axios.get(API_URL, { headers: getHeaders() })
        : await axios.get(`${API_URL}/guest`, {
            params: { guestId: getGuestId() },
          });

      const { items = [], total = 0 } = res.data;

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
      setCart({ items: [], total: 0 });
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Agregar producto
  const addToCart = async (productId, quantity = 1) => {
    try {
      if (token) {
        // Usuario logueado
        await axios.post(
          `${API_URL}/add`,
          { productId, quantity },
          { headers: getHeaders() }
        );
      } else {
        // Invitado
        await axios.post(`${API_URL}/guest/add?guestId=${getGuestId()}`, {
          productId,
          quantity,
        });
      }

      const updatedCart = await fetchCart();
      setCartSidebarOpen(true); // abrir sidebar automáticamente
      return updatedCart;
    } catch (err) {
      console.error("Error al agregar producto:", err);
      setError(err.response?.data?.message || "No se pudo agregar el producto");
    }
  };

  // 🔹 Eliminar producto
  const removeFromCart = async (cartItemId) => {
    try {
      const url = token
        ? `${API_URL}/item/${cartItemId}`
        : `${API_URL}/guest/item/${cartItemId}`;

      if (token) {
        await axios.delete(url, { headers: getHeaders() });
      } else {
        await axios.post(url, { guestId: getGuestId() });
      }

      return await fetchCart();
    } catch (err) {
      console.error("Error al eliminar producto:", err);
      setError(
        err.response?.data?.message || "No se pudo eliminar el producto"
      );
    }
  };

  // 🔹 Vaciar carrito
  const clearCart = async () => {
    try {
      if (token) {
        await axios.post(`${API_URL}/clear`, {}, { headers: getHeaders() });
      } else {
        await axios.post(`${API_URL}/guest/clear`, { guestId: getGuestId() });
      }
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
