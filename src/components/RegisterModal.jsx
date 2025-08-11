import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

const RegisterModal = ({ show, onClose, onSwitchToLogin }) => {
  const { register, login } = useAuth();
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  if (!show) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    const registered = await register(
      name,
      lastName,
      userName,
      email,
      password
    );

    if (registered) {
      alert("✅ Registro exitoso");

      // Intentar login automático
      const loggedIn = await login(email, password);

      if (loggedIn) {
        onClose(); // Cierra el modal solo si el login fue exitoso
      } else {
        alert(
          "⚠️ Registrado pero no se pudo iniciar sesión automáticamente. Probá iniciar sesión manualmente."
        );
        onClose();
        onSwitchToLogin(); // Abre el modal de login
      }
    } else {
      alert("❌ Error en el registro");
    }
  };

  return (
    <>
      {/* Fondo oscuro */}
      <div
        className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm z-40 transition-opacity duration-700"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
        <div className="w-[110%] max-w-md bg-white p-6 rounded-lg shadow-2xl">
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

          {/* Formulario */}
          <form onSubmit={handleSubmit}>
            <label className="block mb-3 text-sm font-medium text-gray-700">
              Nombre
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full mt-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-800"
                required
              />
            </label>
            <label className="block mb-3 text-sm font-medium text-gray-700">
              Apellido
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full mt-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-800"
                required
              />
            </label>
            <label className="block mb-3 text-sm font-medium text-gray-700">
              Usuario
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full mt-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-800"
                required
              />
            </label>
            <label className="block mb-3 text-sm font-medium text-gray-700">
              Email
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full mt-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-800"
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

          {/* Enlace para cambiar a login */}
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
