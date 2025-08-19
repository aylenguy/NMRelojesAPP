import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";
import toast from "react-hot-toast";

const CartContext = createContext();
const API_URL = "https://localhost:7247/api/cart"; // Ajusta al puerto de tu backend

export const CartProvider = ({ children }) => {
  const { token } = useAuth();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);

  // Traer carrito del backend
  const fetchCart = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCart(res.data);
    } catch (err) {
      console.error("Error al obtener carrito:", err);
      toast.error("No se pudo cargar el carrito");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) fetchCart();
    else setCart(null);
  }, [token, fetchCart]);

  // Agregar producto al carrito
  const addToCart = async (productId, cantidad = 1) => {
    try {
      await axios.post(
        `${API_URL}/add`,
        { productId, cantidad },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchCart();
      toast.success("Producto agregado 🛒");
    } catch (err) {
      console.error("Error al agregar producto:", err);
      toast.error("No se pudo agregar el producto");
    }
  };

  // Actualizar cantidad de un item
  const updateItem = async (cartItemId, cantidad) => {
    try {
      await axios.put(
        `${API_URL}/item/${cartItemId}`,
        { Cantidad: cantidad }, // ⚡ coincide con backend
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchCart();
      toast.success("Cantidad actualizada ✅");
    } catch (err) {
      console.error("Error al actualizar item:", err);
      toast.error("No se pudo actualizar la cantidad");
    }
  };

  // Eliminar item del carrito
  const removeFromCart = async (cartItemId) => {
    try {
      await axios.delete(`${API_URL}/item/${cartItemId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchCart();
      toast.success("Producto eliminado 🗑️");
    } catch (err) {
      console.error("Error al eliminar item:", err);
      toast.error("No se pudo eliminar el producto");
    }
  };

  // Vaciar carrito completo
  const clearCart = async () => {
    try {
      await axios.post(
        `${API_URL}/clear`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchCart();
      toast.success("Carrito vaciado 🧹");
    } catch (err) {
      console.error("Error al vaciar carrito:", err);
      toast.error("No se pudo vaciar el carrito");
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
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
