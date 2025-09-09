import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import NMrelojesImg from "../assets/NMrelojes.png";
import { FaShoppingCart } from "react-icons/fa";
import api from "../api/api";
import { useCart } from "../context/CartContext";

const Home = ({ onProductClick, searchText }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart(); // <-- Traemos addToCart del contexto
  const [products, setProducts] = useState([]);
  const [showNotification, setShowNotification] = useState(false);

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
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 2000);
  };

  const filteredProducts = products.filter((product) =>
    (product.name || product.Name || product.nombre || "")
      .toLowerCase()
      .includes(searchText?.toLowerCase() || "")
  );

  const normalizeServerProduct = (p) => ({
    id: p.Id ?? p.id,
    name: p.Nombre ?? p.nombre ?? p.Name ?? p.name,
    price: p.Precio ?? p.precio ?? p.Price ?? p.price ?? 0,
    image: p.Imagen ?? p.imagen ?? p.Image ?? p.image,
    description:
      p.Descripcion ?? p.descripcion ?? p.Description ?? p.description ?? "",
    color: p.Color ?? p.color ?? "",
    stock: p.Stock ?? p.stock ?? 0,
    brand: p.Marca ?? p.marca ?? p.Brand ?? p.brand ?? "",
  });

  return (
    <div className=" min-h-screen relative">
      {/* Hero */}
      <section className="relative h-[450px] text-white flex items-center justify-center mb-16">
        <img
          src={NMrelojesImg}
          alt="Hero"
          className="absolute inset-0 w-full h-full object-cover brightness-50"
        />
        <div className="relative z-10 text-center">
          <h1 className="text-5xl md:text-6xl font-bold tracking-wide mb-4 font-mono">
            N&M Relojes
          </h1>
          <p className="text-xl md:text-2xl font-light">
            Elegancia, precisión y estilo en cada segundo.
          </p>
        </div>
      </section>

      {/* Productos */}
      <section className="container mx-auto px-6">
        <h2 className="md:text-3xl font-bold text-center tracking-wide mb-6 font-poppins">
          Nuestros Productos
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map((product) => {
            const stock = product.stock ?? 0;
            const sinStock = stock <= 0;

            return (
              <div
                key={product.id || product.Id}
                className="relative bg-white rounded-lg shadow-md hover:shadow-lg transition overflow-hidden border"
              >
                {/* Imagen con botón de carrito flotante */}
                <div
                  className="relative cursor-pointer group"
                  onClick={() => {
                    onProductClick(product);
                    navigate(`/producto/${product.id || product.Id}`, {
                      state: product,
                    });
                  }}
                >
                  <img
                    src={
                      product.image ||
                      product.Image ||
                      product.imagen ||
                      "/placeholder.png"
                    }
                    alt={product.name || product.Name || product.nombre}
                    className="w-full h-80 object-cover transform transition-transform duration-300 group-hover:scale-105"
                  />

                  {/* Etiqueta SIN STOCK */}
                  {sinStock && (
                    <span className="absolute top-3 left-3 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-md shadow-md">
                      SIN STOCK
                    </span>
                  )}

                  {/* Botón carrito solo si hay stock */}
                  {!sinStock && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToCart(product);
                      }}
                      className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition hover:bg-gray-100"
                      title="Agregar al carrito"
                    >
                      <FaShoppingCart className="text-gray-800 text-lg" />
                    </button>
                  )}
                </div>

                {/* Información del producto */}
                <div className="p-4 text-center">
                  <h3 className="text-lg font-bold font-poppins mb-1">
                    {product.brand
                      ? `${product.brand} ${product.name}`
                      : product.name}
                  </h3>

                  <p className="text-gray-800 font-medium text-lg">
                    $
                    {(
                      product.price ||
                      product.Price ||
                      product.precio ||
                      0
                    ).toLocaleString("es-AR")}
                  </p>
                  <p className="text-sm text-[#005f73] font-poppins mt-1">
                    TRANSFERENCIA O EFECTIVO{" "}
                    <span className="block font-semibold text-[#005f73] text-base">
                      $
                      {Math.round(
                        (product.price ||
                          product.Price ||
                          product.precio ||
                          0) * 0.8
                      ).toLocaleString("es-AR")}
                    </span>
                  </p>

                  {/* Mostrar stock o mensaje agotado */}
                  {!sinStock ? (
                    <p className="text-sm  font-poppins mt-2">
                      Stock disponible: {stock}
                    </p>
                  ) : (
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
      </section>
    </div>
  );
};

export default Home;
