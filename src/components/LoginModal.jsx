import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const LoginModal = ({ show, onClose, onSwitchToRegister }) => {
  const emailInputRef = useRef(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (show && emailInputRef.current) emailInputRef.current.focus();
  }, [show]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (show) window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [show, onClose]);

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    // Validación del email
    if (!email.trim()) newErrors.email = "El email es obligatorio";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      newErrors.email = "Ingresa un email válido";

    // Validación de la contraseña
    if (!password.trim()) newErrors.password = "La contraseña es obligatoria";
    else if (!passwordRegex.test(password))
      newErrors.password = "Contraseña incorrecta";

    // Si hay errores, los mostramos
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Intentamos loguear
    setLoading(true);
    try {
      const { success, role } = await login(email.trim(), password);
      if (success) {
        onClose();
        if (role?.toLowerCase() === "admin") navigate("/admin");
        else navigate("/");
      } else {
        setErrors({ api: "Email o contraseña incorrectos" });
      }
    } catch (err) {
      console.error(err);
      setErrors({ api: "Error en el servidor. Inténtalo más tarde." });
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
        <div className="w-[360px] max-w-[90vw] bg-white p-6 rounded-lg shadow-2xl">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900 font-mono">
              Iniciar Sesión
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-800 text-xl font-bold"
            >
              &times;
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-base font-semibold text-gray-800 mb-2">
                Email
              </label>
              <input
                type="text"
                ref={emailInputRef}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErrors((prev) => ({ ...prev, email: null }));
                }}
                placeholder="ejemplo@correo.com"
                className={`w-full p-2 text-sm border rounded-xl focus:outline-none focus:ring-2 ${
                  errors.email
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-black"
                }`}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            {/* Contraseña */}
            <div>
              <label className="block text-base font-semibold text-gray-800 mb-2">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrors((prev) => ({ ...prev, password: null }));
                }}
                placeholder="********"
                className={`w-full p-2 text-sm border rounded-xl focus:outline-none focus:ring-2 ${
                  errors.password
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-black"
                }`}
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-black text-white py-2 rounded-xl hover:bg-gray-800 shadow transition-all text-sm disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Cargando..." : "Iniciar Sesión"}
            </button>

            {/* Error general */}
            {errors.api && (
              <p className="text-red-500 text-sm text-center mt-2">
                {errors.api}
              </p>
            )}
          </form>

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
