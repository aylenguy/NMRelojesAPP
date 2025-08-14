import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/api";

export default function AdminProducts() {
  const { token } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const emptyForm = {
    id: null,
    name: "",
    price: "",
    oldPrice: "",
    imageFile: null,
    description: "",
    color: "",
    caracteristicas: [],
    stock: "",
  };

  const [formData, setFormData] = useState(emptyForm);
  const [showModal, setShowModal] = useState(false);
  const baseApiUrl = api.defaults.baseURL?.replace(/\/$/, "") ?? "";

  const normalizeServerProduct = (p) => ({
    id: p.Id ?? p.id,
    name: p.Nombre ?? p.nombre ?? p.name,
    price: p.Precio ?? p.precio ?? p.price,
    image: p.Imagen ?? p.imagen ?? p.image,
    description: p.Descripcion ?? p.descripcion ?? p.description,
    color: p.Color ?? p.color ?? "",
    oldPrice: p.OldPrice ?? p.oldPrice ?? "",
    caracteristicas: p.Caracteristicas ?? p.caracteristicas ?? [],
    stock: p.Stock ?? p.stock ?? 0,
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
      alert("No se pudieron cargar los productos.");
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

  const handleEditClick = (product) => {
    setFormData({
      id: product.id,
      name: product.name,
      price: product.price,
      oldPrice: product.oldPrice || "",
      imageFile: null,
      description: product.description,
      color: product.color || "",
      caracteristicas: product.caracteristicas || [],
      stock: product.stock || "",
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) return alert("El nombre es obligatorio");
    if (!formData.price || parseFloat(formData.price) <= 0)
      return alert("El precio debe ser mayor que 0");
    if (!formData.stock || parseInt(formData.stock) < 0)
      return alert("El stock no puede ser negativo");

    try {
      if (formData.id) {
        // EDITAR → enviar JSON
        const updateData = {
          name: formData.name,
          price: parseFloat(formData.price),
          oldPrice: formData.oldPrice ? parseFloat(formData.oldPrice) : null,
          description: formData.description,
          color: formData.color,
          caracteristicas: formData.caracteristicas,
          stock: parseInt(formData.stock),
        };

        await api.put(`/Product/UpdateProduct/${formData.id}`, updateData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
      } else {
        // CREAR → enviar FormData (incluyendo imagen)
        const data = new FormData();
        data.append("Name", formData.name);
        data.append("Price", parseFloat(formData.price));
        if (formData.oldPrice)
          data.append("OldPrice", parseFloat(formData.oldPrice));
        data.append("Description", formData.description);
        data.append("Color", formData.color);
        data.append("Stock", parseInt(formData.stock));
        data.append(
          "Caracteristicas",
          JSON.stringify(formData.caracteristicas)
        );

        if (formData.imageFile) {
          data.append("imageFile", formData.imageFile);
        }

        await api.post("/Product/AddProduct", data, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
      }

      await fetchProducts();
      setShowModal(false);
      setFormData(emptyForm);
    } catch (err) {
      console.error("Error al guardar producto:", err);
      alert("Error al guardar producto.");
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
      alert("No se pudo eliminar el producto.");
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

      <button
        onClick={() => {
          setFormData(emptyForm);
          setShowModal(true);
        }}
        className="mb-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
      >
        Nuevo Producto
      </button>

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
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => handleEditClick(product)}
                  className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(product.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4">
              {formData.id ? "Editar Producto" : "Nuevo Producto"}
            </h2>
            <form onSubmit={handleSubmit} encType="multipart/form-data">
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

              {!formData.id && (
                <input
                  type="file"
                  name="imageFile"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="border p-2 w-full mb-2"
                />
              )}

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
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setFormData(emptyForm);
                  }}
                  className="bg-gray-300 px-4 py-2 rounded"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
