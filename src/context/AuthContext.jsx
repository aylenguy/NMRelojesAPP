import React, { createContext, useContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext();
const API_BASE_URL = "https://localhost:7247";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) {
      try {
        const decoded = jwtDecode(savedToken);
        const now = Date.now() / 1000;
        if (decoded.exp && decoded.exp < now) {
          localStorage.removeItem("token");
        } else {
          setUser(normalizeDecoded(decoded));
          setToken(savedToken);
        }
      } catch (err) {
        console.error("Token inválido:", err);
        localStorage.removeItem("token");
      }
    }
    setLoading(false);
  }, []);

  const normalizeDecoded = (decoded) => {
    const role =
      decoded.role ||
      decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
      decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/role"] ||
      decoded["roles"] ||
      null;

    return {
      id: decoded.sub || decoded.nameid || decoded.id,
      email: decoded.email,
      name: decoded.username || decoded.name,
      role,
      exp: decoded.exp,
    };
  };

  const login = async (email, password, isAdmin = false) => {
    try {
      const url = isAdmin
        ? `${API_BASE_URL}/api/Auth/AdminLogin`
        : `${API_BASE_URL}/api/Client/login`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) return false;

      const data = await res.json();
      const token = data.token || data.Token;
      if (!token) return false;

      const decoded = jwtDecode(token);
      const normalized = normalizeDecoded(decoded);

      setUser(normalized);
      setToken(token);
      localStorage.setItem("token", token);
      return true;
    } catch (err) {
      console.error("Error login:", err);
      return false;
    }
  };

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

      return res.ok;
    } catch (err) {
      console.error("Error registro:", err);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
  };

  const hasRole = (role) => user?.role?.toLowerCase() === role.toLowerCase();

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
