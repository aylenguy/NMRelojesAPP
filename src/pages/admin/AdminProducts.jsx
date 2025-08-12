// src/pages/admin/Products.jsx
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../api";

export default function AdminProducts() {
  const { token } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    oldPrice: "",
    imageFile: null,
    description: "",
    color: "",
    caracteristicas: [],
    stock: "",
  });

  const baseApiUrl = api.defaults.baseURL?.replace(/\/$/, "") ?? "";

  const normalizeServerProduct = (p) => ({
    id: p.Id ?? p.id,
    name: p.Nombre ?? p.nombre ?? p.name ?? p.Name,
    price: p.Precio ?? p.precio ?? p.price ?? p.Price,
    image: p.Imagen ?? p.imagen ?? p.image ?? p.Image,
    description:
      p.Descripcion ?? p.descripcion ?? p.description ?? p.Description,
  });

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get("/Product/GetAllProducts", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const normalized = (res.data || []).map(normalizeServerProduct);
      setProducts(normalized);
    } catch (err) {
      console.error("Error al cargar productos:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchProducts();
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({ ...prev, imageFile: e.target.files[0] || null }));
  };

  const handleCaracteristicaChange = (e) => {
    const arr = e.target.value
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean);
    setFormData((prev) => ({ ...prev, caracteristicas: arr }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert("El nombre es obligatorio");
      return;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      alert("El precio debe ser mayor que 0");
      return;
    }
    if (!formData.stock || parseInt(formData.stock) < 0) {
      alert("El stock no puede ser negativo");
      return;
    }

    try {
      const data = new FormData();
      data.append("Name", formData.name);
      data.append("Price", parseFloat(formData.price));
      if (formData.oldPrice) {
        data.append("OldPrice", parseFloat(formData.oldPrice));
      }
      data.append("Description", formData.description);
      data.append("Color", formData.color);
      data.append("Stock", parseInt(formData.stock));
      data.append("Specs", JSON.stringify(formData.caracteristicas));

      if (formData.imageFile) {
        data.append("imageFile", formData.imageFile);
        data.append("Image", formData.imageFile.name);
      } else {
        data.append("Image", "");
      }

      await api.post("/Product/AddProduct", data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      await fetchProducts();

      setFormData({
        name: "",
        price: "",
        oldPrice: "",
        imageFile: null,
        description: "",
        color: "",
        caracteristicas: [],
        stock: "",
      });
    } catch (err) {
      console.error("Error al crear producto:", err);
      alert("Error al crear producto. Revisa consola y backend.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar este producto?")) return;

    try {
      await api.delete(`/Product/DeleteProduct/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error("Error al eliminar producto:", err);
      alert("No se pudo eliminar el producto. Revisa consola y backend.");
    }
  };

  const resolveImageUrl = (img) => {
    if (!img) return null;
    if (/^https?:\/\//i.test(img)) return img;
    return `${baseApiUrl}/uploads/${img.replace(/^\/+/, "")}`;
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Gestión de Productos</h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-4 rounded shadow mb-6 max-w-lg"
        encType="multipart/form-data"
      >
        <input
          type="text"
          name="name"
          placeholder="Nombre"
          value={formData.name}
          onChange={handleChange}
          className="border p-2 w-full mb-2"
          required
        />
        <input
          type="number"
          name="price"
          placeholder="Precio"
          value={formData.price}
          onChange={handleChange}
          className="border p-2 w-full mb-2"
          min="0.01"
          step="0.01"
          required
        />
        <input
          type="number"
          name="oldPrice"
          placeholder="Precio Anterior"
          value={formData.oldPrice}
          onChange={handleChange}
          className="border p-2 w-full mb-2"
          step="0.01"
        />
        <input
          type="file"
          name="imageFile"
          accept="image/*"
          onChange={handleFileChange}
          className="border p-2 w-full mb-2"
        />
        <textarea
          name="description"
          placeholder="Descripción"
          value={formData.description}
          onChange={handleChange}
          className="border p-2 w-full mb-2"
        />
        <input
          type="text"
          name="color"
          placeholder="Color"
          value={formData.color}
          onChange={handleChange}
          className="border p-2 w-full mb-2"
        />
        <input
          type="text"
          name="caracteristicas"
          placeholder="Características (separadas por coma)"
          value={formData.caracteristicas.join(", ")}
          onChange={handleCaracteristicaChange}
          className="border p-2 w-full mb-2"
        />
        <input
          type="number"
          name="stock"
          placeholder="Stock"
          value={formData.stock}
          onChange={handleChange}
          className="border p-2 w-full mb-2"
          min="0"
          required
        />
        <div className="flex gap-2">
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Guardar
          </button>
          <button
            type="button"
            onClick={() =>
              setFormData({
                name: "",
                price: "",
                oldPrice: "",
                imageFile: null,
                description: "",
                color: "",
                caracteristicas: [],
                stock: "",
              })
            }
            className="bg-gray-300 px-4 py-2 rounded"
          >
            Limpiar
          </button>
        </div>
      </form>

      <h2 className="text-xl font-semibold mb-2">Lista de productos</h2>

      {loading ? (
        <div>Cargando productos...</div>
      ) : products.length === 0 ? (
        <p className="text-gray-500">No hay productos cargados.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {products.map((product) => (
            <div
              key={product.id}
              className="border p-4 rounded shadow bg-white flex flex-col"
            >
              {product.image ? (
                <img
                  src={resolveImageUrl(product.image)}
                  alt={product.name}
                  className="h-40 object-cover mb-2 rounded"
                />
              ) : (
                <div className="h-40 bg-gray-100 mb-2 rounded flex items-center justify-center text-gray-400">
                  Sin imagen
                </div>
              )}
              <h3 className="font-bold">{product.name}</h3>
              <p>${product.price}</p>
              <p className="text-sm text-gray-600 flex-grow">
                {product.description}
              </p>
              <button
                onClick={() => handleDelete(product.id)}
                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 mt-2"
              >
                Eliminar
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
