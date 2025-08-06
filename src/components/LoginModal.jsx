// src/components/LoginModal.jsx
import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";

const LoginModal = ({ show, onClose, onSwitchToRegister }) => {
  const emailInputRef = useRef(null);

  // Pone el foco en el campo de email cuando se muestra el modal
  useEffect(() => {
    if (show && emailInputRef.current) {
      emailInputRef.current.focus();
    }
  }, [show]);

  // Permite cerrar el modal con la tecla Escape
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (show) {
      window.addEventListener("keydown", handleEsc);
    }
    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
  }, [show, onClose]);

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Iniciando sesión...");
    onClose();
  };

  if (!show) return null;

  return (
    <>
      {/* Fondo oscuro */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm z-40 transition-opacity duration-700 ${
          show ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      ></div>

      {/* Contenedor del modal */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
        <div
          className={`w-[110%] max-w-md bg-white p-6 rounded-lg shadow-2xl transition-transform transition-opacity duration-700 ${
            show ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-8"
          }`}
        >
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

          <form onSubmit={handleSubmit}>
            <label className="block mb-3 text-sm font-medium text-gray-700">
              Email
              <input
                type="email"
                ref={emailInputRef}
                className="w-full mt-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-800"
                required
              />
            </label>
            <label className="block mb-3 text-sm font-medium text-gray-700">
              Contraseña
              <input
                type="password"
                className="w-full mt-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-800"
                required
              />
            </label>
            <button
              type="submit"
              className="w-full bg-gray-900 hover:bg-gray-800 text-white py-2 rounded text-sm mt-2"
            >
              Iniciar Sesión
            </button>
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
