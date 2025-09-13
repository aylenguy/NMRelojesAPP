// src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const AuthContext = createContext();
// 🔹 URL base del backend
const API_BASE_URL = import.meta.env.VITE_API_URL;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // 🔹 Normalizar datos del token
  const normalizeDecoded = (decoded, userTypeFromApi) => {
    let role =
      decoded.role ||
      decoded.Role ||
      decoded.userType ||
      decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
      decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/role"] ||
      decoded.roles ||
      userTypeFromApi ||
      null;

    if (Array.isArray(role)) role = role[0];

    return {
      id: decoded.sub || decoded.nameid || decoded.id || null,
      email: decoded.email || null,
      name: decoded.name || decoded.username || decoded.unique_name || null,
      lastName: decoded.lastName || decoded.family_name || null,
      role: role || null,
    };
  };

  // 🔹 Recuperar sesión al recargar la página
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) {
      try {
        const decoded = jwtDecode(savedToken);
        const notExpired = !decoded.exp || decoded.exp * 1000 > Date.now();
        if (notExpired) {
          const normalized = normalizeDecoded(
            decoded,
            localStorage.getItem("userType")
          );
          setUser(normalized);
          setToken(savedToken);
          // 👉 Inyectar token a axios
          axios.defaults.headers.common[
            "Authorization"
          ] = `Bearer ${savedToken}`;
        } else {
          localStorage.removeItem("token");
          localStorage.removeItem("userType");
        }
      } catch (err) {
        console.error("Token inválido:", err);
        localStorage.removeItem("token");
        localStorage.removeItem("userType");
      }
    }
    setLoading(false);
  }, []);

  // 🔹 Login (admin o cliente)
  const login = async (email, password) => {
    try {
      let data = {};
      let res;

      // 👉 primero admin
      try {
        res = await axios.post(`${API_BASE_URL}/Auth/admin-login`, {
          Email: email,
          Password: password,
        });
        data = res.data;
      } catch {
        data = {};
      }

      // 👉 si admin falló, probamos cliente
      if (!data.token) {
        try {
          res = await axios.post(`${API_BASE_URL}/Client/login`, {
            Email: email,
            Password: password,
          });
          data = res.data;
        } catch {
          data = {};
        }
      }

      if (data.token) {
        const decoded = jwtDecode(data.token);
        const normalized = normalizeDecoded(decoded, data.userType);

        setUser(normalized);
        setToken(data.token);
        localStorage.setItem("token", data.token);
        localStorage.setItem("userType", normalized.role);

        // 👉 Inyectar token a axios
        axios.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;

        return { success: true, role: normalized.role };
      } else {
        return {
          success: false,
          error: data.error || data.Error || "login_failed",
        };
      }
    } catch (err) {
      console.error("Error login:", err);
      return { success: false, error: "server_error" };
    }
  };

  // 🔹 Registro cliente
  const register = async (name, lastName, userName, email, password) => {
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/Client/register`, {
        Name: name,
        LastName: lastName,
        UserName: userName,
        Email: email,
        Password: password,
      });

      if (res.status !== 200 && res.status !== 201) {
        return {
          success: false,
          message: res.data?.message || "Error en el registro",
        };
      }

      return { success: true };
    } catch (err) {
      console.error("Error registro:", err);
      return { success: false, message: "Error de conexión con el servidor" };
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Logout (limpia carrito y sesión)
  const logout = () => {
    if (user?.id) {
      localStorage.removeItem(`cart_${user.id}`);
    }
    localStorage.removeItem("cart");
    localStorage.removeItem("token");
    localStorage.removeItem("userType");
    setUser(null);
    setToken(null);

    // 👉 limpiar headers
    delete axios.defaults.headers.common["Authorization"];

    navigate("/");
  };

  // 🔹 Verificar rol
  const hasRole = (role) => user?.role === role;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        hasRole,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
