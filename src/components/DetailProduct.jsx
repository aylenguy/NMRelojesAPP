import { useLocation, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../api";

const DetailProduct = ({ addToCart }) => {
  const { state: productFromState } = useLocation();
  const { id } = useParams();
  const [product, setProduct] = useState(productFromState || null);
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    if (!product) {
      api
        .get(`/Product/GetById/${id}`)
        .then((res) => setProduct(res.data))
        .catch((err) => console.error("Error cargando producto:", err));
    }
  }, [id, product]);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart({
      id: product.id || product.Id,
      name: product.name || product.Name || product.nombre,
      price: product.price || product.Price || product.precio,
      image: product.image || product.Image || product.imagen,
    });
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 2000);
  };

  if (!product) {
    return (
      <div className="p-6 text-center text-gray-500">Cargando producto...</div>
    );
  }

  const name = product.name || product.Name || product.nombre;
  const price = product.price || product.Price || product.precio;
  const image = product.image || product.Image || product.imagen;
  const description =
    product.description || product.Description || product.descripcion;
  const color = product.color || product.Color;
  const specs = product.specs || [];

  return (
    <div className="bg-gray-100 min-h-screen p-6 relative">
      {showNotification && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded shadow-md z-50">
          ✅ Producto agregado al carrito
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row gap-10 bg-white rounded-lg shadow-md p-6">
          {/* Imagen */}
          <div className="w-full md:w-1/2 flex justify-center">
            <img
              src={image}
              alt={name}
              className="rounded-lg w-full max-w-md object-cover"
            />
          </div>

          {/* Información */}
          <div className="w-full md:w-1/2">
            <h1 className="text-3xl font-semibold text-gray-900 mb-2">
              {name}
            </h1>

            <div className="text-2xl font-bold text-gray-800">
              ${price?.toLocaleString("es-AR")}
            </div>

            <p className="mt-4 text-gray-700">{description}</p>

            {color && (
              <div className="mt-4">
                <p className="font-semibold">
                  Color: <span className="text-gray-600">{color}</span>
                </p>
              </div>
            )}

            {specs.length > 0 && (
              <ul className="mt-6 text-sm text-gray-700 space-y-1">
                {specs.map((spec, index) => (
                  <li key={index}>- {spec}</li>
                ))}
              </ul>
            )}

            <button
              onClick={handleAddToCart}
              className="bg-gray-800 text-white px-6 py-2 mt-6 rounded hover:bg-gray-900 transition"
            >
              Agregar al carrito
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailProduct;
