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
  const [coloresSeleccionados, setColoresSeleccionados] = useState([]);
  const [marcasSeleccionadas, setMarcasSeleccionadas] = useState([]);
  const [sortOption, setSortOption] = useState("");
  const [filtering, setFiltering] = useState(false);

  const navigate = useNavigate();
  const { addToCart } = useCart();

  // Cargar productos
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

  const triggerFilter = () => {
    setFiltering(true);
    setTimeout(() => setFiltering(false), 500); // 0.5 seg de "carga"
  };

  // Toggle filtros
  const toggleCategoria = (categoria) => {
    setCategoriasSeleccionadas((prev) =>
      prev.includes(categoria)
        ? prev.filter((c) => c !== categoria)
        : [...prev, categoria]
    );
    triggerFilter();
  };

  const toggleColor = (color) => {
    setColoresSeleccionados((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    );
    triggerFilter();
  };

  const toggleMarca = (marca) => {
    setMarcasSeleccionadas((prev) =>
      prev.includes(marca) ? prev.filter((m) => m !== marca) : [...prev, marca]
    );
    triggerFilter();
  };

  // Funciones auxiliares
  const getPrecio = (p) => p.price ?? p.Price ?? p.precio ?? 0;
  const getNombre = (p) =>
    p.name ?? p.Name ?? p.nombre ?? "Producto sin nombre";
  const getCategoria = (p) =>
    p.category ?? p.Category ?? p.categoria ?? "Sin categoría";
  const getColor = (p) => p.color ?? p.Color ?? "Sin color";
  const getMarca = (p) =>
    p.brand ?? p.Brand ?? p.marca ?? p.Marca ?? "Sin marca";

  const getImagen = (p) => {
    const path = p.image ?? p.Image ?? p.imagen ?? "placeholder.png";
    if (path.startsWith("http")) return path;
    return `${import.meta.env.VITE_API_URL}/uploads/${path}`;
  };

  const getTitulo = (p) => {
    const nombre = getNombre(p);
    const marca = getMarca(p);
    return marca && marca !== "Sin marca" ? `${marca} ${nombre}` : nombre;
  };

  // Filtrar productos
  const filtered = productos.filter((p) => {
    const nombre = getNombre(p).toLowerCase();
    const coincideBusqueda = nombre.includes(searchText?.toLowerCase() || "");
    const coincideCategoria =
      categoriasSeleccionadas.length === 0 ||
      categoriasSeleccionadas.includes(getCategoria(p));
    const coincideColor =
      coloresSeleccionados.length === 0 ||
      coloresSeleccionados.includes(getColor(p));
    const coincideMarca =
      marcasSeleccionadas.length === 0 ||
      marcasSeleccionadas.includes(getMarca(p));

    return (
      coincideBusqueda && coincideCategoria && coincideColor && coincideMarca
    );
  });

  // Ordenar productos
  const sorted = [...filtered].sort((a, b) => {
    if (sortOption === "precio-asc") return getPrecio(a) - getPrecio(b);
    if (sortOption === "precio-desc") return getPrecio(b) - getPrecio(a);
    if (sortOption === "nombre-asc")
      return getNombre(a).localeCompare(getNombre(b));
    if (sortOption === "nombre-desc")
      return getNombre(b).localeCompare(getNombre(a));
    return 0;
  });

  // Agregar al carrito
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

  const categoriasUnicas = [...new Set(productos.map(getCategoria))];
  const coloresUnicos = [...new Set(productos.map(getColor))];
  const marcasUnicas = [...new Set(productos.map(getMarca))];

  return (
    <div className="min-h-screen p-4 sm:p-8">
      <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-center text-gray-800 font-poppins">
        Todos los Productos
      </h2>

      {/* Selector de orden */}
      <div className="flex justify-end mb-6">
        <select
          className="p-2 border rounded-md shadow-sm text-sm sm:text-base"
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
        >
          <option value="">Ordenar por...</option>
          <option value="precio-asc">Precio: Menor a Mayor</option>
          <option value="precio-desc">Precio: Mayor a Menor</option>
          <option value="nombre-asc">A-Z</option>
          <option value="nombre-desc">Z-A</option>
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[250px_1fr] gap-6 lg:gap-8">
        {/* Sidebar filtros */}
        <aside className="bg-white p-4 rounded-lg shadow-md border hidden lg:block">
          <h2 className="text-lg sm:text-xl font-bold mb-6 text-center text-[#005f73] font-poppins">
            Filtrar por
          </h2>

          {/* Colores */}
          <h3 className="text-base sm:text-lg font-poppins mb-4 mt-6">Color</h3>
          <div className="flex flex-col gap-2">
            {coloresUnicos.map((color) => (
              <label
                key={color}
                className="flex items-center gap-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={coloresSeleccionados.includes(color)}
                  onChange={() => toggleColor(color)}
                />
                <span className="text-gray-700 text-sm sm:text-base">
                  {color}
                </span>
              </label>
            ))}
          </div>

          {/* Marcas */}
          <h3 className="text-base sm:text-lg font-poppins mb-4 mt-6">Marca</h3>
          <div className="flex flex-col gap-2">
            {marcasUnicas.map((marca) => (
              <label
                key={marca}
                className="flex items-center gap-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={marcasSeleccionadas.includes(marca)}
                  onChange={() => toggleMarca(marca)}
                />
                <span className="text-gray-700 text-sm sm:text-base">
                  {marca}
                </span>
              </label>
            ))}
          </div>
        </aside>

        {/* Grid productos con overlay de spinner */}
        <div className="relative">
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {products.map((product) => {
              const stock = product.stock ?? 0;
              const sinStock = stock <= 0;

              return (
                <div
                  key={product.id || product.Id}
                  className="relative bg-white rounded-lg shadow-md hover:shadow-lg transition overflow-hidden border"
                >
                  {/* Imagen */}
                  <div
                    className="relative cursor-pointer group aspect-square"
                    onClick={() =>
                      navigate(`/producto/${product.id || product.Id}`, {
                        state: product,
                      })
                    }
                  >
                    <img
                      src={product.image || "/placeholder.png"}
                      alt={product.name}
                      className="w-full h-full object-cover transform transition-transform duration-300 group-hover:scale-105"
                    />

                    {/* SIN STOCK */}
                    {sinStock && (
                      <span className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-md shadow-md">
                        SIN STOCK
                      </span>
                    )}

                    {/* Botón carrito */}
                    {!sinStock && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToCart(product);
                        }}
                        className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-white p-2 rounded-full shadow-lg hover:bg-gray-100 transition"
                        title="Agregar al carrito"
                      >
                        <FaShoppingCart className="text-gray-800 text-sm sm:text-lg" />
                      </button>
                    )}
                  </div>

                  {/* Info del producto */}
                  <div className="p-3 sm:p-4 text-center">
                    <h3 className="text-sm sm:text-base font-bold font-poppins mb-1 truncate">
                      {product.brand
                        ? `${product.brand} ${product.name}`
                        : product.name}
                    </h3>

                    <p className="text-sm sm:text-base text-gray-800 font-medium">
                      ${(product.price || 0).toLocaleString("es-AR")}
                    </p>

                    <p className="text-xs sm:text-sm text-[#005f73] font-poppins mt-1">
                      TRANSFERENCIA O EFECTIVO{" "}
                      <span className="block font-semibold text-xs sm:text-sm text-[#005f73]">
                        $
                        {Math.round((product.price || 0) * 0.8).toLocaleString(
                          "es-AR"
                        )}
                      </span>
                    </p>

                    {sinStock && (
                      <p className="text-sm text-red-600 mt-2 font-bold">
                        Agotado
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
            {products.length === 0 && (
              <p className="text-center col-span-full text-gray-500">
                No se encontraron productos.
              </p>
            )}
          </div>

          {/* Overlay spinner mientras filtra */}
          {filtering && (
            <div className="absolute inset-0 bg-white flex justify-center items-center z-10">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-300 border-t-gray-600"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Productos;
