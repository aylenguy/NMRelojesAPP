import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

const RegisterModal = ({ show, onClose, onSwitchToLogin }) => {
  const { register, login, loading } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const isFormFilled = Object.values(formData).every(
    (value) => value.trim() !== ""
  );

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "El nombre es obligatorio.";
    if (!formData.lastName.trim())
      newErrors.lastName = "El apellido es obligatorio.";
    if (!formData.email.trim()) newErrors.email = "El email es obligatorio.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = "El email no es válido.";
    if (!formData.password.trim())
      newErrors.password = "La contraseña es obligatoria.";
    else if (formData.password.length < 8)
      newErrors.password = "La contraseña debe tener al menos 8 caracteres.";
    return newErrors;
  };

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const regResult = await register(
        formData.name,
        formData.lastName,
        "",
        formData.email,
        formData.password
      );

      if (!regResult.success) {
        setErrors({ api: regResult.message || "Error al registrarse." });
        return;
      }

      await login(formData.email, formData.password);
      setShowSuccessModal(true);
    } catch (err) {
      setErrors({
        api:
          err.response?.data?.Message ||
          "Error al registrarse. Intente de nuevo.",
      });
    }
  };

  if (!show) return null;

  return (
    <>
      {/* Fondo modal */}
      <div
        className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Modal principal */}
      {!showSuccessModal && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
          <div className="w-[360px] max-w-[90vw] h-[340px] max-h-[90vh] bg-white p-6 rounded-3xl shadow-2xl flex flex-col overflow-y-auto">
            {/* Barra tipo “notch” */}
            <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-4"></div>

            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900 font-poppins">
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
            <form onSubmit={handleSubmit} className="space-y-3 flex-1">
              {/* Nombre */}
              <div>
                <input
                  type="text"
                  name="name"
                  placeholder="Nombre"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full p-2 text-sm border rounded-xl focus:outline-none focus:ring-2 ${
                    errors.name
                      ? "border-[#005f73] focus:ring-[#005f73]"
                      : "border-gray-300 focus:ring-black"
                  }`}
                />
                {errors.name && (
                  <p className="text-[#005f73] font-semibold text-sm mt-1">
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Apellido */}
              <div>
                <input
                  type="text"
                  name="lastName"
                  placeholder="Apellido"
                  value={formData.lastName}
                  onChange={handleChange}
                  className={`w-full p-2 text-sm border rounded-xl focus:outline-none focus:ring-2 ${
                    errors.lastName
                      ? "border-[#005f73] focus:ring-[#005f73]"
                      : "border-gray-300 focus:ring-black"
                  }`}
                />
                {errors.lastName && (
                  <p className="text-[#005f73] font-semibold text-sm mt-1">
                    {errors.lastName}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <input
                  type="text"
                  name="email"
                  placeholder="Correo electrónico"
                  value={formData.email}
                  onChange={handleChange}
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

              {/* Contraseña */}
              <div>
                <input
                  type="password"
                  name="password"
                  placeholder="Contraseña"
                  value={formData.password}
                  onChange={handleChange}
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

              {errors.api && (
                <p className="text-[#005f73] font-semibold text-sm mt-1 text-center">
                  {errors.api}
                </p>
              )}

              <button
                type="submit"
                disabled={!isFormFilled || loading}
                className={`w-full py-2 rounded-xl shadow text-sm transition-all ${
                  isFormFilled
                    ? "bg-black text-white hover:bg-gray-800"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                {loading ? "Cargando..." : "Registrarse"}
              </button>
            </form>

            {/* Footer */}
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
      )}

      {/* Modal de éxito */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="bg-white w-[360px] max-w-[90vw] p-6 rounded-3xl shadow-2xl text-center">
            <h2 className="text-2xl font-bold mb-4">Crear cuenta</h2>
            <p className="mb-6">
              ¡Bienvenido a N&M Relojes! Tu registro fue exitoso.
            </p>
            <button
              onClick={() => {
                setShowSuccessModal(false);
                onClose();
              }}
              className="bg-black text-white py-2 px-4 rounded-xl hover:bg-gray-800"
            >
              ¡Entendido!
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default RegisterModal;
