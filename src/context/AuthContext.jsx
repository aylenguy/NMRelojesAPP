// src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();
const API_BASE_URL = "https://localhost:7247";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // 🔹 Función para normalizar datos del token
  const normalizeDecoded = (decoded, userTypeFromApi) => {
    let role =
      decoded.role ||
      decoded.Role ||
      decoded.userType || // 👈 tu caso, usertype en el token
      decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
      decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/role"] ||
      decoded.roles ||
      userTypeFromApi ||
      null;

    if (Array.isArray(role)) role = role[0];

    return {
      id: decoded.sub || decoded.nameid || decoded.id || null,
      email: decoded.email || null,
      name: decoded.username || decoded.name || decoded.unique_name || null,
      role: role ? role.toLowerCase() : null,
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
          const normalized = normalizeDecoded(decoded);
          setUser(normalized);
          setToken(savedToken);
        } else {
          localStorage.removeItem("token");
        }
      } catch (err) {
        console.error("Token inválido:", err);
        localStorage.removeItem("token");
      }
    }
    setLoading(false);
  }, []);

  // 🔹 Login (primero intenta admin, luego cliente)
  const login = async (email, password) => {
    try {
      // 1️⃣ Intentar login admin
      let res = await fetch(
        `${API_BASE_URL}/api/Authenticate/authenticate-admin`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );
      let data = await res.json();

      // 2️⃣ Si no es admin, intentar login cliente
      if (!res.ok || !data.token) {
        res = await fetch(`${API_BASE_URL}/api/Authenticate/authenticate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        data = await res.json();
      }

      // 3️⃣ Si sigue fallando, error
      if (!res.ok || !data.token) {
        return {
          success: false,
          message: data.message || "Usuario o contraseña incorrectos",
        };
      }

      // 4️⃣ Guardar datos y token
      const decoded = jwtDecode(data.token);
      const normalized = normalizeDecoded(decoded, data.userType);

      setUser(normalized);
      setToken(data.token);
      localStorage.setItem("token", data.token);

      // 5️⃣ Redirigir según rol
      if (normalized.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }

      return { success: true };
    } catch (err) {
      console.error("Error login:", err);
      return { success: false, message: "Error de conexión con el servidor" };
    }
  };

  // 🔹 Registro cliente
  const register = async (name, lastName, userName, email, password) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/Client/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Name: name,
          LastName: lastName,
          UserName: userName,
          Email: email,
          Password: password,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        return {
          success: false,
          message: errData.message || "Error en el registro",
        };
      }

      return { success: true };
    } catch (err) {
      console.error("Error registro:", err);
      return { success: false, message: "Error de conexión con el servidor" };
    }
  };

  // 🔹 Logout
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    navigate("/");
  };

  // 🔹 Verificar rol
  const hasRole = (role) => user?.role === role.toLowerCase();

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
