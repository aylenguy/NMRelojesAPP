import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import GlobalSpinner from "./GlobalSpinner";

const RegisterModal = ({ show, onClose, onSwitchToLogin }) => {
  const { register, loading } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    lastName: "",
    userName: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});

  // 🔹 Regex igual al back
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

  const getPasswordStrength = (pwd) => {
    if (pwd.length < 8)
      return { label: "Muy débil", color: "bg-red-500 w-1/4" };
    if (!/[a-z]/.test(pwd))
      return { label: "Débil", color: "bg-red-500 w-1/4" };
    if (!/[A-Z]/.test(pwd))
      return { label: "Débil", color: "bg-red-500 w-1/4" };
    if (!/[0-9]/.test(pwd))
      return { label: "Media", color: "bg-yellow-500 w-2/4" };
    if (pwd.length >= 8)
      return { label: "Fuerte", color: "bg-green-500 w-full" };
    return { label: "Muy débil", color: "bg-red-500 w-1/4" };
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "El nombre es obligatorio.";
    if (!formData.lastName.trim())
      newErrors.lastName = "El apellido es obligatorio.";

    // 🔹 Usuario opcional, no ponemos error
    if (!formData.userName.trim())
      newErrors.userName = "El usuario es obligatorio.";

    if (!formData.email.trim()) newErrors.email = "El email es obligatorio.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = "El email no es válido.";

    if (!formData.password.trim())
      newErrors.password = "La contraseña es obligatoria.";
    //else if (!passwordRegex.test(formData.password))
    // newErrors.password =
    //"Debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número.";

    return newErrors;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Generar usuario automáticamente si está vacío
    let userNameToSend = formData.userName.trim();
    if (!userNameToSend) {
      const randomNum = Math.floor(Math.random() * 1000); // 0-999
      userNameToSend =
        formData.name.trim().toLowerCase() +
        "." +
        formData.lastName.trim().toLowerCase() +
        randomNum;
    }

    try {
      await register(
        formData.name,
        formData.lastName,
        userNameToSend,
        formData.email,
        formData.password
      );
      onClose();
    } catch (error) {
      setErrors({ api: "Error al registrarse. Intente de nuevo." });
    }
  };

  if (!show) return null;

  const strength = getPasswordStrength(formData.password);

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm z-40"
        onClick={onClose}
      />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
        <div className="w-[400px] bg-white p-6 rounded-lg shadow-2xl relative">
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

          <form onSubmit={handleSubmit} className="space-y-1">
            {/* Nombre */}
            <div>
              <label className="block text-base font-semibold text-gray-800 mb-1">
                Nombre
              </label>
              <input
                type="text"
                name="name"
                placeholder="Nombre"
                value={formData.name}
                onChange={handleChange}
                className={`w-full border rounded px-3 py-2 min-h-[44px] ${
                  errors.name ? "border-red-500" : "border-gray-300"
                }`}
              />
              <div className="h-5 text-sm text-red-500">
                {errors.name || ""}
              </div>
            </div>

            {/* Apellido */}
            <div>
              <label className="block text-base font-semibold text-gray-800 mb-1">
                Apellido
              </label>
              <input
                type="text"
                name="lastName"
                placeholder="Apellido"
                value={formData.lastName}
                onChange={handleChange}
                className={`w-full border rounded px-3 py-2 min-h-[44px] ${
                  errors.lastName ? "border-red-500" : "border-gray-300"
                }`}
              />
              <div className="h-5 text-sm text-red-500">
                {errors.lastName || ""}
              </div>
            </div>

            {/* Usuario */}
            <div>
              <label className="block text-base font-semibold text-gray-800 mb-1">
                Usuario
              </label>
              <input
                type="text"
                name="userName"
                placeholder="Usuario"
                value={formData.userName}
                onChange={handleChange}
                className={`w-full border rounded px-3 py-2 min-h-[44px] ${
                  errors.userName ? "border-red-500" : "border-gray-300"
                }`}
              />
              <div className="h-5 text-sm text-red-500">
                {errors.userName || ""}
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-base font-semibold text-gray-800 mb-1">
                Email
              </label>
              <input
                type="text"
                name="email"
                placeholder="Correo electrónico"
                value={formData.email}
                onChange={handleChange}
                className={`w-full border rounded px-3 py-2 min-h-[44px] ${
                  errors.email ? "border-red-500" : "border-gray-300"
                }`}
              />
              <div className="h-5 text-sm text-red-500">
                {errors.email || ""}
              </div>
            </div>

            {/* Contraseña */}
            <div>
              <label className="block text-base font-semibold text-gray-800 mb-1">
                Contraseña
              </label>
              <input
                type="password"
                name="password"
                placeholder="Contraseña"
                value={formData.password}
                onChange={handleChange}
                className={`w-full border rounded px-3 py-2 min-h-[44px] ${
                  errors.password ? "border-red-500" : "border-gray-300"
                }`}
              />

              {/* Guía de reglas en vivo */}
              {formData.password && (
                <div className="mt-2 text-xs text-gray-600">
                  <p
                    className={
                      formData.password.length >= 8 ? "text-green-600" : ""
                    }
                  >
                    {formData.password.length >= 8 ? "" : ""} Mínimo 8
                    caracteres
                  </p>
                  <p
                    className={
                      /[A-Z]/.test(formData.password) ? "text-green-600" : ""
                    }
                  >
                    {/[A-Z]/.test(formData.password) ? "" : ""} Al menos una
                    mayúscula
                  </p>
                  <p
                    className={
                      /[a-z]/.test(formData.password) ? "text-green-600" : ""
                    }
                  >
                    {/[a-z]/.test(formData.password) ? "" : ""} Al menos una
                    minúscula
                  </p>
                  <p
                    className={
                      /\d/.test(formData.password) ? "text-green-600" : ""
                    }
                  >
                    {/\d/.test(formData.password) ? "" : ""} Al menos un número
                  </p>
                </div>
              )}
              <div className="h-5 text-sm text-red-500">
                {errors.password || ""}
              </div>
            </div>

            {/* Error general */}
            {errors.api && (
              <p className="text-red-500 text-sm text-center">{errors.api}</p>
            )}

            {/* Botón */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-2 rounded-xl hover:bg-gray-800 shadow transition-all text-sm disabled:opacity-50"
            >
              {loading ? "Cargando..." : "Iniciar Sesión"}
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
