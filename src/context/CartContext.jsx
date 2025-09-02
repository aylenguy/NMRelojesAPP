import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";
import { toast } from "sonner"; // 👈 usamos sonner

const CartContext = createContext();
const API_URL = "https://localhost:7247/api/cart";
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

  // 🔹 Obtener carrito (logueado o invitado)
  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const url = token ? API_URL : `${API_URL}/guest?guestId=${getGuestId()}`;

      const res = await axios.get(url, { headers });
      setCart(res.data || { items: [], total: 0 });
    } catch (err) {
      console.error("Error al obtener carrito:", err);
      toast.error("No se pudo cargar el carrito", {
        description: "Verificá tu conexión e intentá de nuevo",
      });
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
        ? `${API_URL}/add`
        : `${API_URL}/guest/add?guestId=${getGuestId()}`;

      await axios.post(url, { productId, cantidad }, { headers });
      await fetchCart();

      setCartSidebarOpen(true);
    } catch (err) {
      console.error("Error al agregar producto:", err);

      const message =
        err.response?.data?.message || "No se pudo agregar el producto";

      toast.error("Error al agregar producto", {
        description: message,
      });
    }
  };

  // 🔹 Actualizar cantidad de item
  const updateItem = async (cartItemId, cantidad) => {
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const url = token
        ? `${API_URL}/item/${cartItemId}`
        : `${API_URL}/guest/item/${cartItemId}?guestId=${getGuestId()}`;

      await axios.put(url, { cantidad }, { headers });
      await fetchCart();
    } catch (err) {
      console.error("Error al actualizar item:", err);

      const message =
        err.response?.data?.message || "No se pudo actualizar la cantidad";

      toast.error("Error al actualizar", {
        description: message,
      });
    }
  };

  // 🔹 Eliminar item
  // 🔹 Eliminar item
  const removeFromCart = async (cartItemId) => {
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const url = token
        ? `${API_URL}/item/${cartItemId}`
        : `${API_URL}/guest/item/${cartItemId}?guestId=${getGuestId()}`;

      await axios.delete(url, { headers });

      // 🕑 Delay de 500ms antes de refrescar el carrito
      setTimeout(() => {
        fetchCart();
      }, 500);
    } catch (err) {
      console.error("Error al eliminar item:", err);

      const message =
        err.response?.data?.message || "No se pudo eliminar el producto";

      toast.error("Error al eliminar", {
        description: message,
      });
    }
  };

  // 🔹 Vaciar carrito
  const clearCart = async () => {
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const url = token
        ? `${API_URL}/clear`
        : `${API_URL}/guest/clear?guestId=${getGuestId()}`;

      await axios.post(url, {}, { headers });
      await fetchCart();

      toast.success("Carrito vacío", {
        description: "Se eliminaron todos los productos",
      });
    } catch (err) {
      console.error("Error al vaciar carrito:", err);

      const message =
        err.response?.data?.message || "No se pudo vaciar el carrito";

      toast.error("Error al vaciar", {
        description: message,
      });
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
