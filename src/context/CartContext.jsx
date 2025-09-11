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
  const [cart, setCart] = useState([]);
  const token = localStorage.getItem("token");

  // Cargar carrito
  const fetchCart = async () => {
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const url = token
        ? `${API_URL}`
        : `${API_URL}/guest?guestId=${getGuestId()}`;
      const res = await axios.get(url, { headers });
      setCart(res.data);
    } catch (err) {
      console.error("Error al obtener carrito:", err);
    }
  };

  // Agregar producto
  const addToCart = async (productId, quantity = 1) => {
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const url = token
        ? `${API_URL}/add`
        : `${API_URL}/guest/add?guestId=${getGuestId()}`;
      await axios.post(url, { productId, quantity }, { headers });
      fetchCart();
    } catch (err) {
      console.error("Error al agregar producto:", err);
    }
  };

  // Eliminar producto
  const removeFromCart = async (productId) => {
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const url = token
        ? `${API_URL}/remove/${productId}`
        : `${API_URL}/guest/remove/${productId}?guestId=${getGuestId()}`;
      await axios.delete(url, { headers });
      fetchCart();
    } catch (err) {
      console.error("Error al eliminar producto:", err);
    }
  };

  // Vaciar carrito
  const clearCart = async () => {
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const url = token
        ? `${API_URL}/clear`
        : `${API_URL}/guest/clear?guestId=${getGuestId()}`;
      await axios.delete(url, { headers });
      fetchCart();
    } catch (err) {
      console.error("Error al vaciar carrito:", err);
    }
  };

  // Cargar carrito al inicio o si cambia el token
  useEffect(() => {
    fetchCart();
  }, [token]);

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
};
