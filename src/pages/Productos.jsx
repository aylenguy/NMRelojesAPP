import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaShoppingCart } from "react-icons/fa";
import api from "../api/api";

const Productos = ({ onAddToCart, searchText }) => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNotification, setShowNotification] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    api
      .get("/Product/GetAllProducts")
      .then((res) => setProductos(res.data))
      .catch((err) => {
        console.error("Error al cargar productos:", err);
        setError("No se pudieron cargar los productos. Intenta nuevamente.");
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = productos.filter((producto) =>
    (producto.name || producto.Name || producto.nombre || "")
      .toLowerCase()
      .includes(searchText?.toLowerCase() || "")
  );

  const handleAddToCart = (producto) => {
    onAddToCart(producto);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 2000);
  };

  const getPrecio = (producto) =>
    producto.price || producto.Price || producto.precio || 0;

  const getNombre = (producto) =>
    producto.name || producto.Name || producto.nombre || "Producto sin nombre";

  const getImagen = (producto) =>
    producto.image || producto.Image || producto.imagen || "/placeholder.png";

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-500 font-semibold">{error}</div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen relative">
      {showNotification && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-5 py-2 rounded-md shadow-lg z-[9999]">
          ✅ Producto agregado al carrito
        </div>
      )}

      <h2 className="text-3xl font-bold mb-8 text-center text-gray-800 font-mono">
        Todos los Productos
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {filtered.map((producto) => (
          <div
            key={producto.id || producto.Id}
            className="relative bg-white border rounded-lg shadow hover:shadow-lg transition"
          >
            <div
              onClick={() =>
                navigate(`/producto/${producto.id || producto.Id}`, {
                  state: producto,
                })
              }
              className="cursor-pointer"
            >
              <img
                src={getImagen(producto)}
                alt={getNombre(producto)}
                className="w-full h-64 object-cover rounded-t-lg"
              />
            </div>

            <div className="p-4 text-gray-800">
              <h3 className="text-lg font-semibold mb-1">
                {getNombre(producto)}
              </h3>
              <p className="text-base font-medium">
                ${getPrecio(producto).toLocaleString("es-AR")}
              </p>
              <p className="text-sm mt-2 text-gray-600">
                TRANSFERENCIA O EFECTIVO{" "}
                <span className="font-bold text-gray-800">
                  $
                  {Math.round(getPrecio(producto) * 0.8).toLocaleString(
                    "es-AR"
                  )}
                </span>
              </p>
            </div>

            <div
              onClick={() => handleAddToCart(producto)}
              className="absolute bottom-3 right-3 bg-gray-200 rounded-full p-2 shadow-md hover:bg-gray-300 cursor-pointer transition"
              title="Agregar al carrito"
            >
              <FaShoppingCart className="text-gray-800 text-lg" />
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <p className="text-center col-span-full text-gray-500">
            No se encontraron productos.
          </p>
        )}
      </div>
    </div>
  );
};

export default Productos;
