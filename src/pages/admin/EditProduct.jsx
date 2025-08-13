import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api";
import { useAuth } from "../../context/AuthContext";

export default function EditProduct() {
  const { id } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    oldPrice: "",
    description: "",
    color: "",
    caracteristicas: "",
    stock: "",
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/products/${id}`);
        const product = res.data;

        setFormData({
          name: product.name || "",
          price: product.price || "",
          oldPrice: product.oldPrice || "",
          description: product.description || "",
          color: product.color || "",
          caracteristicas: product.caracteristicas
            ? product.caracteristicas.join(", ")
            : "",
          stock: product.stock || "",
        });
      } catch (error) {
        console.error("Error cargando producto", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      Price: parseFloat(formData.price),
      OldPrice: formData.oldPrice ? parseFloat(formData.oldPrice) : null,
      Description: formData.description || "",
      Color: formData.color || "",
      Caracteristicas: formData.caracteristicas
        ? formData.caracteristicas.split(",").map((c) => c.trim())
        : [],
      Stock: parseInt(formData.stock),
    };

    try {
      const res = await fetch(`https://localhost:7247/api/product/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Error al guardar producto");
      }

      alert("Producto actualizado correctamente");
      navigate("/admin/products");
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  if (loading) return <p>Cargando producto...</p>;

  return (
    <div className="edit-product">
      <h2>Editar Producto</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Nombre"
          value={formData.name}
          onChange={handleChange}
          required
        />

        <input
          type="number"
          name="price"
          placeholder="Precio"
          value={formData.price}
          onChange={handleChange}
          required
        />

        <input
          type="number"
          name="oldPrice"
          placeholder="Precio Anterior"
          value={formData.oldPrice}
          onChange={handleChange}
        />

        <textarea
          name="description"
          placeholder="Descripción"
          value={formData.description}
          onChange={handleChange}
        />

        <input
          type="text"
          name="color"
          placeholder="Color"
          value={formData.color}
          onChange={handleChange}
        />

        <input
          type="text"
          name="caracteristicas"
          placeholder="Características (separadas por coma)"
          value={formData.caracteristicas}
          onChange={handleChange}
        />

        <input
          type="number"
          name="stock"
          placeholder="Stock"
          value={formData.stock}
          onChange={handleChange}
          required
        />

        <button type="submit">Guardar Cambios</button>
      </form>
    </div>
  );
}
