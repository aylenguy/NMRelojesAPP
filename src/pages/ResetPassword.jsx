// src/pages/ResetPassword.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const API_BASE_URL = import.meta.env.VITE_API_URL;

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { logout } = useAuth(); // si tu AuthContext tiene logout

  // Leer el token de la URL
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");

  // Validar token al cargar la página
  useEffect(() => {
    if (!token) {
      setMessage(
        "❌ Error al restablecer la contraseña. Solicita un nuevo enlace."
      );
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!token) return;

    if (password !== confirm) {
      setMessage("❌ Las contraseñas no coinciden");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/Client/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ Token: token, NewPassword: password }),
      });

      const data = await res.json().catch(() => ({
        message: "Error desconocido",
      }));

      if (!res.ok) {
        setMessage(data.message || "⚠️ Error al restablecer la contraseña");
        return;
      }

      setMessage(
        "✅ Contraseña restablecida correctamente. Serás redirigido al home."
      );
      logout?.(); // cerrar sesión si aplica

      setTimeout(() => {
        navigate("/"); // redirige al home
      }, 2000);
    } catch (error) {
      console.error(error);
      setMessage("⚠️ Error al restablecer la contraseña. Intenta más tarde.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-center">
        Restablecer contraseña
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="password"
          placeholder="Nueva contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-800"
        />
        <input
          type="password"
          placeholder="Confirmar contraseña"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-800"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gray-900 text-white py-2 rounded hover:bg-gray-800 font-bold disabled:opacity-50"
        >
          {loading ? "Restableciendo..." : "Restablecer"}
        </button>
      </form>
      {message && (
        <p
          className={`mt-4 text-center text-sm ${
            message.startsWith("✅") ? "text-green-500" : "text-red-500"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
