import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaShoppingCart } from "react-icons/fa";
import api from "../api/api";
import { useCart } from "../context/CartContext"; // Contexto del carrito

const Productos = ({ searchText }) => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNotification, setShowNotification] = useState(false);
  const [error, setError] = useState(null);
  const [categoriasSeleccionadas, setCategoriasSeleccionadas] = useState([]);
  const navigate = useNavigate();
  const { addToCart } = useCart(); // Función del contexto

  // Cargar productos desde el backend
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await api.get("/Product/GetAllProducts");
        setProductos(res.data);
      } catch {
        setError("No se pudieron cargar los productos. Intenta nuevamente.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Alternar selección de categorías
  const toggleCategoria = (categoria) => {
    setCategoriasSeleccionadas((prev) =>
      prev.includes(categoria)
        ? prev.filter((c) => c !== categoria)
        : [...prev, categoria]
    );
  };

  // Funciones auxiliares para normalizar datos del producto
  const getPrecio = (p) => p.price ?? p.Price ?? p.precio ?? 0;
  const getNombre = (p) =>
    p.name ?? p.Name ?? p.nombre ?? "Producto sin nombre";
  const getImagen = (p) => p.image ?? p.Image ?? p.imagen ?? "/placeholder.png";
  const getCategoria = (p) =>
    p.category ?? p.Category ?? p.categoria ?? "Sin categoría";

  // Filtrar productos según búsqueda y categorías
  const filtered = productos.filter((p) => {
    const nombre = getNombre(p).toLowerCase();
    const coincideBusqueda = nombre.includes(searchText?.toLowerCase() || "");
    const coincideCategoria =
      categoriasSeleccionadas.length === 0 ||
      categoriasSeleccionadas.includes(getCategoria(p));
    return coincideBusqueda && coincideCategoria;
  });

  // Agregar producto al carrito (logueado o invitado)
  const handleAddToCart = async (producto) => {
    try {
      await addToCart(producto.id ?? producto.Id);
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 2000);
    } catch (err) {
      console.error("No se pudo agregar el producto", err);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );

  if (error)
    return (
      <div className="p-8 text-center text-red-500 font-semibold">{error}</div>
    );

  const categoriasUnicas = [...new Set(productos.map((p) => getCategoria(p)))];

  return (
    <div className="bg-gray-50 min-h-screen p-8">
      {showNotification && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-5 py-2 rounded-md shadow-lg z-[9999]">
          ✅ Producto agregado al carrito
        </div>
      )}

      <h2 className="text-3xl font-bold mb-8 text-center text-gray-800 font-mono">
        Todos los Productos
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-[250px_1fr] gap-8">
        {/* Sidebar de categorías */}
        <aside className="bg-white p-4 rounded-lg shadow-md border">
          <h3 className="text-lg font-semibold mb-4">Categorías</h3>
          <div className="flex flex-col gap-2">
            {categoriasUnicas.map((categoria) => (
              <label
                key={categoria}
                className="flex items-center gap-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={categoriasSeleccionadas.includes(categoria)}
                  onChange={() => toggleCategoria(categoria)}
                />
                <span className="text-gray-700">{categoria}</span>
              </label>
            ))}
          </div>
        </aside>

        {/* Grid de productos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
          {filtered.map((producto) => {
            const stock = producto.stock ?? 0;
            const sinStock = stock <= 0;

            return (
              <div
                key={producto.id ?? producto.Id}
                className="relative bg-white rounded-lg shadow-md hover:shadow-lg transition overflow-hidden border"
              >
                <div
                  className="relative cursor-pointer group"
                  onClick={() =>
                    navigate(`/producto/${producto.id ?? producto.Id}`, {
                      state: producto,
                    })
                  }
                >
                  <img
                    src={getImagen(producto)}
                    alt={getNombre(producto)}
                    className="w-full h-80 object-cover"
                  />

                  {sinStock && (
                    <span className="absolute top-3 left-3 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-md shadow-md">
                      SIN STOCK
                    </span>
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!sinStock) handleAddToCart(producto);
                    }}
                    disabled={sinStock}
                    className={`absolute bottom-4 left-1/2 -translate-x-1/2 p-3 rounded-full shadow-lg transition
                      ${
                        sinStock
                          ? "bg-gray-300 cursor-not-allowed opacity-60"
                          : "bg-white hover:bg-gray-100"
                      }`}
                    title={sinStock ? "Producto agotado" : "Agregar al carrito"}
                  >
                    <FaShoppingCart
                      className={`text-lg ${
                        sinStock ? "text-gray-500" : "text-gray-800"
                      }`}
                    />
                  </button>
                </div>
                <div className="p-5 text-center">
                  <h3 className="text-xl font-bold mb-1">
                    {getNombre(producto)}
                  </h3>
                  <p className="text-gray-800 font-medium text-lg">
                    ${getPrecio(producto).toLocaleString("es-AR")}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    TRANSFERENCIA O EFECTIVO{" "}
                    <span className="block font-semibold text-[#005f73] text-base">
                      $
                      {Math.round(getPrecio(producto) * 0.8).toLocaleString(
                        "es-AR"
                      )}
                    </span>
                  </p>
                  {!sinStock && (
                    <p className="text-sm text-green-600 mt-2">
                      Stock disponible: {stock}
                    </p>
                  )}
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <p className="text-center col-span-full text-gray-500">
              No se encontraron productos.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Productos;
