import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";

const API_BASE_URL = import.meta.env.VITE_API_URL;

export default function AdminPanel() {
  const { token } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    id: null,
    name: "",
    price: "",
    image: "",
  });
  const [isEditing, setIsEditing] = useState(false);

  // Cargar productos
  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/Product`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Error al cargar productos");
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Guardar producto (crear o editar)
  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const method = isEditing ? "PUT" : "POST";
      const url = isEditing
        ? `${API_BASE_URL}/api/Product/${formData.id}`
        : `${API_BASE_URL}/api/Product`;

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          Name: formData.name,
          Price: parseFloat(formData.price),
          Image: formData.image,
        }),
      });

      if (!res.ok) throw new Error("Error al guardar producto");

      await fetchProducts();
      setFormData({ id: null, name: "", price: "", image: "" });
      setIsEditing(false);
    } catch (err) {
      console.error(err);
    }
  };

  // Editar producto
  const handleEdit = (product) => {
    setFormData({
      id: product.id,
      name: product.name || product.nombre,
      price: product.price || product.precio,
      image: product.image || product.imagen,
    });
    setIsEditing(true);
  };

  // Eliminar producto
  const handleDelete = async (id) => {
    if (!window.confirm("¿Seguro que quieres eliminar este producto?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/Product/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Error al eliminar producto");
      await fetchProducts();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="p-6">Cargando productos...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Panel de Administración</h1>

      {/* Formulario */}
      <form onSubmit={handleSave} className="mb-6 space-y-4">
        <input
          type="text"
          placeholder="Nombre"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="border p-2 w-full rounded"
          required
        />
        <input
          type="number"
          placeholder="Precio"
          value={formData.price}
          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
          className="border p-2 w-full rounded"
          required
        />
        <input
          type="text"
          placeholder="URL Imagen"
          value={formData.image}
          onChange={(e) => setFormData({ ...formData, image: e.target.value })}
          className="border p-2 w-full rounded"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-500"
        >
          {isEditing ? "Actualizar Producto" : "Agregar Producto"}
        </button>
      </form>

      {/* Lista de productos */}
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2 border">ID</th>
            <th className="p-2 border">Nombre</th>
            <th className="p-2 border">Precio</th>
            <th className="p-2 border">Imagen</th>
            <th className="p-2 border">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id}>
              <td className="p-2 border">{p.id}</td>
              <td className="p-2 border">{p.name || p.nombre}</td>
              <td className="p-2 border">${p.price || p.precio}</td>
              <td className="p-2 border">
                {p.image || p.imagen ? (
                  <img
                    src={p.image || p.imagen}
                    alt={p.name}
                    className="w-16 h-16 object-cover"
                  />
                ) : (
                  "Sin imagen"
                )}
              </td>
              <td className="p-2 border space-x-2">
                <button
                  onClick={() => handleEdit(p)}
                  className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-400"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(p.id)}
                  className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-500"
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
