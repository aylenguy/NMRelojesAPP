import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import NMrelojesImg from "../assets/NMrelojes.png";
import { FaShoppingCart } from "react-icons/fa";
import api from "../api/api";
import { useCart } from "../context/CartContext";

const Home = ({ onProductClick, searchText }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    api
      .get("/Product/GetAllProducts")
      .then((res) => {
        const normalized = (res.data || []).map(normalizeServerProduct);
        setProducts(normalized);
      })
      .catch((err) => console.error("Error al cargar productos:", err));
  }, []);

  const handleAddToCart = async (product) => {
    await addToCart(product.id || product.Id, 1);
  };

  const normalizeServerProduct = (p) => {
    // Obtener todas las imágenes posibles
    const rawImages =
      p.Images ??
      p.Imagenes ??
      p.images ??
      p.imagenes ??
      (p.Image || p.image ? [p.Image || p.image] : []);

    // Tomar la primera imagen y convertir a URL absoluta
    const image =
      rawImages && rawImages.length > 0
        ? rawImages[0].startsWith("http")
          ? rawImages[0]
          : `https://nmrelojesapi.onrender.com/uploads/${rawImages[0]}`
        : "https://nmrelojesapi.onrender.com/uploads/relojhombre.jpg"; // fallback

    return {
      id: p.Id ?? p.id,
      name: p.Nombre ?? p.nombre ?? p.Name ?? p.name ?? "",
      price: p.Precio ?? p.precio ?? p.Price ?? p.price ?? 0,
      image, // ya mapeada a URL completa
      description:
        p.Descripcion ?? p.descripcion ?? p.Description ?? p.description ?? "",
      color: p.Color ?? p.color ?? "",
      stock: p.Stock ?? p.stock ?? 0,
      brand: p.Marca ?? p.marca ?? p.Brand ?? p.brand ?? "",
      caracteristicas: p.Caracteristicas ?? p.caracteristicas ?? [],
    };
  };

  // Aplico el filtro de búsqueda
  const filteredProducts = products.filter((product) =>
    (product.name || product.Name || product.nombre || "")
      .toLowerCase()
      .includes(searchText?.toLowerCase() || "")
  );

  // Limitar a los primeros 12 en Home
  const limitedProducts = filteredProducts.slice(0, 12);

  return (
    <div className="min-h-screen relative">
      {/* Hero */}
      <section
        className="relative h-[60vh] md:h-[450px] text-white flex items-center justify-center mb-16 bg-cover bg-center md:bg-[center_top]"
        style={{ backgroundImage: `url(${NMrelojesImg})` }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        <div className="relative z-10 text-center px-4">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-wide mb-4 font-mono">
            N&M Relojes
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl font-light">
            Elegancia, precisión y estilo en cada segundo.
          </p>
        </div>
      </section>

      {/* Productos */}
      <section className="container mx-auto px-4 sm:px-6 max-w-7xl">
        <h2 className="md:text-3xl text-2xl font-bold text-center tracking-wide mb-6 font-poppins">
          Nuestros Productos
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
          {limitedProducts.map((product) => {
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
                  onClick={() => {
                    onProductClick(product);
                    navigate(`/producto/${product.id || product.Id}`, {
                      state: product,
                    });
                  }}
                >
                  <img
                    src={product.image}
                    alt={product.name || product.Name || product.nombre}
                    className="w-full h-full object-cover transform transition-transform duration-300 group-hover:scale-105"
                  />

                  {/* Etiqueta SIN STOCK */}
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

                {/* Información del producto */}
                <div className="p-3 sm:p-4 text-center">
                  <h3 className="text-sm sm:text-base font-bold font-poppins mb-2 truncate">
                    {product.brand
                      ? `${product.brand} ${product.name}`
                      : product.name}
                  </h3>

                  {/* Precio normal */}
                  <p className="text-lg sm:text-xl font-bold text-gray-800 mb-2">
                    ${(product.price || 0).toLocaleString("es-AR")}
                  </p>
                  {/* Precio con transferencia */}
                  <p className="text-base sm:text-lg text-[#005f73] font-poppins mt-1 font-semibold">
                    TRANSFERENCIA O EFECTIVO{" "}
                    <span className="block font-bold text-lg sm:text-xl text-[#005f73]">
                      $
                      {Math.round((product.price || 0) * 0.8).toLocaleString(
                        "es-AR"
                      )}
                    </span>
                  </p>
                  {/* Texto aclaratorio */}
                  <p className="text-xs sm:text-sm text-gray-600  text-center">
                    $
                    {Math.round((product.price || 0) * 0.8).toLocaleString(
                      "es-AR"
                    )}{" "}
                    pagando con Transferencia, depósito bancario o Efectivo
                  </p>

                  {/* Solo mostrar "Agotado" si no hay stock */}
                  {sinStock && (
                    <p className="text-sm text-red-600 mt-2 font-bold">
                      Agotado
                    </p>
                  )}
                </div>
              </div>
            );
          })}

          {filteredProducts.length === 0 && (
            <p className="text-center col-span-full text-gray-500">
              No se encontraron productos.
            </p>
          )}
        </div>

        {/* Botón "Ver todos los productos" */}
        {filteredProducts.length > 12 && (
          <div className="flex justify-center mt-10">
            <button
              onClick={() => navigate("/producto")}
              className="py-2 px-6 bg-[#005f73] text-white rounded-2xl hover:bg-gray-800 shadow transition-all text-sm"
            >
              Ver todos los productos
            </button>
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
