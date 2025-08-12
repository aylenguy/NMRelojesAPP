// src/components/LoginModal.jsx
import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const LoginModal = ({ show, onClose, onSwitchToRegister }) => {
  const emailInputRef = useRef(null);
  const { login } = useAuth(); // 🔹 ahora login devolverá { success, role }
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Autofocus en email
  useEffect(() => {
    if (show && emailInputRef.current) {
      emailInputRef.current.focus();
    }
  }, [show]);

  // Cerrar con Escape
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (show) window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [show, onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // 🔹 login ahora devuelve { success, role }
      const { success, role } = await login(email.trim(), password);

      if (success) {
        onClose();
        if (role?.toLowerCase() === "admin") {
          navigate("/admin");
        } else {
          navigate("/");
        }
      } else {
        setError("❌ Email o contraseña incorrectos");
      }
    } catch (err) {
      console.error(err);
      setError("⚠️ Error en el servidor. Inténtalo más tarde.");
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <>
      {/* Fondo oscuro */}
      <div
        className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm z-40"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
        <div className="w-[110%] max-w-md bg-white p-6 rounded-lg shadow-2xl">
          {/* Encabezado */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900 font-mono">
              Iniciar Sesión
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-800 text-xl font-bold"
              aria-label="Cerrar modal"
            >
              &times;
            </button>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit}>
            <label className="block mb-3 text-sm font-medium text-gray-700">
              Email
              <input
                type="email"
                ref={emailInputRef}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full mt-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-800"
                placeholder="ejemplo@correo.com"
                required
              />
            </label>

            <label className="block mb-3 text-sm font-medium text-gray-700">
              Contraseña
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full mt-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-800"
                placeholder="********"
                required
              />
            </label>

            {error && (
              <p className="text-red-500 text-sm mb-2" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="w-full bg-gray-900 hover:bg-gray-800 text-white py-2 rounded text-sm mt-2 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Cargando..." : "Iniciar Sesión"}
            </button>
          </form>

          {/* Links */}
          <div className="mt-4 text-center text-sm text-gray-600 space-y-1">
            <p>
              ¿No tenés cuenta?{" "}
              <button
                onClick={() => {
                  onClose();
                  onSwitchToRegister();
                }}
                className="text-gray-900 underline"
              >
                Registrate
              </button>
            </p>
            <p>
              <Link to="/recuperar" className="text-gray-900 underline">
                ¿Olvidaste tu contraseña?
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginModal;
