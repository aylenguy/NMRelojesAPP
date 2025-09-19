import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaShoppingCart } from "react-icons/fa";
import api from "../api/api";
import { useCart } from "../context/CartContext";

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
  const [showFilters, setShowFilters] = useState(false);

  const navigate = useNavigate();
  const { addToCart } = useCart();

  // --- Fetch y normalización de productos ---
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await api.get("/Product/GetAllProducts");

        // Normalizamos los productos
        const productosNormalizados = res.data.map((p) => ({
          id: p.id ?? p.Id,
          name: p.name ?? p.Name ?? p.nombre ?? "Producto sin nombre",
          price: p.price ?? p.Price ?? p.precio ?? 0,
          brand: p.brand ?? p.Brand ?? p.marca ?? "Sin marca",
          category: p.category ?? p.Category ?? p.categoria ?? "Sin categoría",
          color: p.color ?? p.Color ?? "Sin color",
          stock: p.stock ?? 0,
          image: p.image ?? p.Image ?? p.imagen ?? "placeholder.png",
          caracteristicas: p.Caracteristicas ?? p.caracteristicas ?? [],
          descripcion: p.Descripcion ?? p.descripcion ?? "",
        }));

        setProductos(productosNormalizados);
      } catch {
        setError("No se pudieron cargar los productos. Intenta nuevamente.");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // --- Funciones de filtro ---
  const triggerFilter = () => {
    setFiltering(true);
    setTimeout(() => setFiltering(false), 500);
  };

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

  // --- Filtros aplicados ---
  const filtered = productos.filter((p) => {
    const coincideBusqueda = p.name
      .toLowerCase()
      .includes((searchText || "").toLowerCase());
    const coincideCategoria =
      categoriasSeleccionadas.length === 0 ||
      categoriasSeleccionadas.includes(p.category);
    const coincideColor =
      coloresSeleccionados.length === 0 ||
      coloresSeleccionados.includes(p.color);
    const coincideMarca =
      marcasSeleccionadas.length === 0 || marcasSeleccionadas.includes(p.brand);
    return (
      coincideBusqueda && coincideCategoria && coincideColor && coincideMarca
    );
  });

  // --- Ordenamiento ---
  const sorted = [...filtered].sort((a, b) => {
    if (sortOption === "precio-asc") return a.price - b.price;
    if (sortOption === "precio-desc") return b.price - a.price;
    if (sortOption === "nombre-asc") return a.name.localeCompare(b.name);
    if (sortOption === "nombre-desc") return b.name.localeCompare(a.name);
    return 0;
  });

  // --- Agregar al carrito ---
  const handleAddToCart = async (producto) => {
    try {
      await addToCart(producto.id);
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 2000);
    } catch (err) {
      console.error("No se pudo agregar el producto", err);
    }
  };

  // --- Loading y error ---
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

  const categoriasUnicas = [...new Set(productos.map((p) => p.category))];
  const coloresUnicos = [...new Set(productos.map((p) => p.color))];
  const marcasUnicas = [...new Set(productos.map((p) => p.brand))];

  return (
    <div className="min-h-screen p-4 sm:p-8">
      <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-center text-gray-800 font-poppins">
        Todos los Productos
      </h2>

      {/* Botón filtros mobile */}
      <div className="flex justify-end mb-6 lg:hidden">
        <button
          className="px-4 py-2 border rounded-md text-sm bg-white shadow"
          onClick={() => setShowFilters(true)}
        >
          Filtros
        </button>
      </div>

      {/* Selector de orden desktop */}
      <div className="flex justify-end mb-6 hidden lg:flex">
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
        {/* Sidebar desktop */}
        <aside className="bg-white p-4 rounded-lg shadow-md border hidden lg:block">
          <h2 className="text-lg sm:text-xl font-bold mb-6 text-center text-[#005f73] font-poppins">
            Filtrar por
          </h2>

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

        {/* Grid productos */}
        <div className="relative">
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {sorted.map((product) => {
              const sinStock = product.stock <= 0;

              return (
                <div
                  key={product.id}
                  className="relative bg-white rounded-lg shadow-md hover:shadow-lg transition overflow-hidden border"
                >
                  {/* Imagen */}
                  <div
                    className="relative cursor-pointer group aspect-square"
                    onClick={() =>
                      navigate(`/producto/${product.id}`, { state: product })
                    }
                  >
                    <img
                      src={
                        product.image.startsWith("http")
                          ? product.image
                          : `${import.meta.env.VITE_API_URL}/uploads/${
                              product.image
                            }`
                      }
                      alt={product.name}
                      className="w-full h-full object-cover transform transition-transform duration-300 group-hover:scale-105"
                    />

                    {sinStock && (
                      <span className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-md shadow-md">
                        SIN STOCK
                      </span>
                    )}

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

                  {/* Información del producto */}
                  <div className="p-3 sm:p-4 text-center">
                    <h3 className="text-sm sm:text-base font-bold font-poppins mb-2 truncate">
                      {product.brand !== "Sin marca"
                        ? `${product.brand} ${product.name}`
                        : product.name}
                    </h3>

                    <p className="text-lg sm:text-xl font-bold text-gray-800 mb-2">
                      ${product.price.toLocaleString("es-AR")}
                    </p>

                    <p className="text-base sm:text-lg text-[#005f73] font-poppins mt-1 font-semibold">
                      TRANSFERENCIA O EFECTIVO{" "}
                      <span className="block font-bold text-lg sm:text-xl text-[#005f73]">
                        $
                        {Math.round(product.price * 0.8).toLocaleString(
                          "es-AR"
                        )}
                      </span>
                    </p>

                    <p className="text-xs sm:text-sm text-gray-600 text-center">
                      ${Math.round(product.price * 0.8).toLocaleString("es-AR")}{" "}
                      pagando con Transferencia, depósito bancario o Efectivo
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

            {sorted.length === 0 && (
              <p className="text-center col-span-full text-gray-500">
                No se encontraron productos.
              </p>
            )}
          </div>

          {filtering && (
            <div className="absolute inset-0 bg-white flex justify-center items-center z-10">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-300 border-t-gray-600"></div>
            </div>
          )}
        </div>
      </div>

      {/* Modal filtros mobile */}
      {showFilters && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-start pt-20 lg:hidden">
          <div className="bg-white rounded-lg shadow-lg p-6 w-11/12 max-w-md relative">
            <button
              className="absolute top-2 right-2 text-gray-600 text-lg font-bold"
              onClick={() => setShowFilters(false)}
            >
              ✕
            </button>

            <h2 className="text-lg font-bold mb-4 text-center">Filtros</h2>

            <div className="mb-4">
              <label className="block font-semibold mb-2">Ordenar por</label>
              <select
                className="p-2 border rounded-md w-full"
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

            <h3 className="font-semibold mb-2">Color</h3>
            <div className="flex flex-col gap-2 mb-4">
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
                  <span>{color}</span>
                </label>
              ))}
            </div>

            <h3 className="font-semibold mb-2">Marca</h3>
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
                  <span>{marca}</span>
                </label>
              ))}
            </div>

            <button
              className="mt-6 w-full bg-[#005f73] text-white py-2 rounded-md font-semibold"
              onClick={() => setShowFilters(false)}
            >
              Aplicar filtros
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Productos;
