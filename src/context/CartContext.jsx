import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import api from "../api/api.js";
import { useAuth } from "./AuthContext";

const CartContext = createContext();
const GUEST_CART_KEY = "guest_cart_id";

// Generar o recuperar guestId
const getGuestId = () => {
  let guestId = localStorage.getItem(GUEST_CART_KEY);
  if (!guestId) {
    guestId = crypto.randomUUID();
    localStorage.setItem(GUEST_CART_KEY, guestId);
  }
  return guestId;
};

export const CartProvider = ({ children }) => {
  const { token } = useAuth();
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(false);
  const [cartSidebarOpen, setCartSidebarOpen] = useState(false);

  // 🔹 Obtener carrito
  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const url = token ? "/cart" : `/cart/guest?guestId=${getGuestId()}`;

      const res = await api.get(url, { headers });
      setCart(res.data || { items: [], total: 0 });
    } catch (err) {
      console.error("Error al obtener carrito:", err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // 🔹 Agregar producto al carrito
  const addToCart = async (productId, cantidad = 1) => {
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const url = token
        ? "/cart/add"
        : `/cart/guest/add?guestId=${getGuestId()}`;

      await api.post(url, { productId, quantity: cantidad }, { headers });
      await fetchCart();

      setCartSidebarOpen(true);
    } catch (err) {
      console.error("Error al agregar producto:", err);
    }
  };

  // 🔹 Actualizar cantidad de item
  const updateItem = async (cartItemId, cantidad) => {
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const url = token
        ? `/cart/item/${cartItemId}`
        : `/cart/guest/item/${cartItemId}?guestId=${getGuestId()}`;

      await api.put(url, { quantity: cantidad }, { headers });
      await fetchCart();
    } catch (err) {
      console.error("Error al actualizar item:", err);
    }
  };

  // 🔹 Eliminar item
  const removeFromCart = async (cartItemId) => {
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const url = token
        ? `/cart/item/${cartItemId}`
        : `/cart/guest/item/${cartItemId}?guestId=${getGuestId()}`;

      await api.delete(url, { headers });
      setTimeout(() => {
        fetchCart();
      }, 500);
    } catch (err) {
      console.error("Error al eliminar item:", err);
    }
  };

  // 🔹 Vaciar carrito
  const clearCart = async () => {
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const url = token
        ? "/cart/clear"
        : `/cart/guest/clear?guestId=${getGuestId()}`;

      await api.post(url, {}, { headers });
      await fetchCart();
    } catch (err) {
      console.error("Error al vaciar carrito:", err);
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        cartSidebarOpen,
        setCartSidebarOpen,
        fetchCart,
        addToCart,
        updateItem,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
