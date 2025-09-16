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

  const passwordRegex = /^.{8,}$/;
  const isFormFilled = email.trim() !== "" && password.trim() !== "";

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!email.trim()) newErrors.email = "El email es obligatorio";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      newErrors.email = "Ingresa un email válido";

    if (!password.trim()) newErrors.password = "La contraseña es obligatoria";
    else if (!passwordRegex.test(password))
      newErrors.password = "La contraseña debe tener al menos 8 caracteres";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const result = await login(email.trim(), password);

      if (result.success) {
        onClose();
        if (result.role?.toLowerCase() === "admin") navigate("/admin");
        else navigate("/");
      } else {
        switch (result.error) {
          case "user_not_found":
            setErrors({ email: "El e-mail no es correcto ¿Sos nuevo?" });
            break;
          case "wrong_password":
            setErrors({ password: "Contraseña incorrecta" });
            break;
          case "invalid_email":
            setErrors({ email: "El email ingresado no es válido" });
            break;
          default:
            setErrors({ api: "Error en el inicio de sesión" });
            break;
        }
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
      {/* Fondo */}
      <div
        className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
        <div className="w-[360px] max-w-[90vw] h-[320px] max-h-[90vh] bg-white p-6 rounded-3xl shadow-2xl flex flex-col overflow-y-auto">
          {/* Barra tipo “notch” */}
          <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-4"></div>

          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900 font-poppins">
              Iniciar Sesión
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-800 text-xl font-bold"
            >
              &times;
            </button>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-3 flex-1">
            <div>
              <input
                type="text"
                ref={emailInputRef}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErrors((prev) => ({ ...prev, email: null }));
                }}
                placeholder="Correo electrónico"
                className={`w-full p-2 text-sm border rounded-xl focus:outline-none focus:ring-2 ${
                  errors.email
                    ? "border-[#005f73] focus:ring-[#005f73]"
                    : "border-gray-300 focus:ring-black"
                }`}
              />
              {errors.email && (
                <p className="text-[#005f73] font-semibold text-sm mt-1">
                  {errors.email}
                </p>
              )}
            </div>

            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrors((prev) => ({ ...prev, password: null }));
                }}
                placeholder="Contraseña"
                className={`w-full p-2 text-sm border rounded-xl focus:outline-none focus:ring-2 ${
                  errors.password
                    ? "border-[#005f73] focus:ring-[#005f73]"
                    : "border-gray-300 focus:ring-black"
                }`}
              />
              {errors.password && (
                <p className="text-[#005f73] font-semibold text-sm mt-1">
                  {errors.password}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={!isFormFilled || loading}
              className={`w-full py-2 rounded-xl shadow text-sm transition-all ${
                isFormFilled
                  ? "bg-black text-white hover:bg-gray-800"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              {loading ? "Cargando..." : "Iniciar Sesión"}
            </button>

            {errors.api && (
              <p className="text-[#005f73] font-semibold text-sm mt-1">
                {errors.api}
              </p>
            )}
          </form>

          {/* Footer */}
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
