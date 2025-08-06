// src/components/RegisterModal.jsx
import React from "react";

const RegisterModal = ({ show, onClose, onSwitchToLogin }) => {
  if (!show) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Registrando...");
    onClose();
  };

  return (
    <>
      {/* Fondo oscuro */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm z-40 transition-opacity duration-700 ${
          show ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      ></div>

      {/* Contenedor modal */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
        <div
          className={`w-[110%] max-w-md bg-white p-6 rounded-lg shadow-2xl transition-transform transition-opacity duration-700 ${
            show ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-8"
          }`}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900 font-mono">
              Registrarse
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-800 text-xl font-bold"
            >
              &times;
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <label className="block mb-3 text-sm font-medium text-gray-700">
              Nombre
              <input
                type="text"
                className="w-full mt-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-800"
                required
              />
            </label>
            <label className="block mb-3 text-sm font-medium text-gray-700">
              Email
              <input
                type="email"
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
              Registrarse
            </button>
          </form>

          <div className="mt-4 text-center text-sm text-gray-600">
            <p>
              ¿Ya tenés cuenta?{" "}
              <button
                onClick={() => {
                  onClose();
                  onSwitchToLogin();
                }}
                className="text-gray-900 underline"
              >
                Iniciar sesión
              </button>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default RegisterModal;
