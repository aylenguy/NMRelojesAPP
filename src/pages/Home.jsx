import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import NMrelojesImg from "../assets/NMrelojes.png";
import { FaShoppingCart } from "react-icons/fa";
import api from "../api";

const Home = ({ onAddToCart, onProductClick, searchText }) => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    api
      .get("/Product/GetAllProducts")
      .then((res) => setProducts(res.data))
      .catch((err) => console.error("Error al cargar productos:", err));
  }, []);

  const handleAddToCart = (product) => {
    onAddToCart(product);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 2000);
  };

  const filteredProducts = products.filter((product) =>
    (product.name || product.Name || product.nombre || "")
      .toLowerCase()
      .includes(searchText?.toLowerCase() || "")
  );

  return (
    <div className="bg-gray-50 min-h-screen relative">
      {showNotification && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-5 py-2 rounded-md shadow-lg z-[9999]">
          ✅ Producto agregado al carrito
        </div>
      )}

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
        <h2 className="md:text-3xl font-bold text-center tracking-wide mb-6 font-mono">
          Nuestros Productos
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map((product) => (
            <div
              key={product.id || product.Id}
              className="relative bg-white border rounded-lg shadow hover:shadow-lg transition"
            >
              <div
                onClick={() => {
                  onProductClick(product);
                  navigate(`/producto/${product.id || product.Id}`, {
                    state: product,
                  });
                }}
                className="cursor-pointer"
              >
                <img
                  src={
                    product.image ||
                    product.Image ||
                    product.imagen ||
                    "/placeholder.png"
                  }
                  alt={product.name || product.Name || product.nombre}
                  className="w-full h-64 object-cover rounded-t-lg"
                />
              </div>

              <div className="p-4 text-gray-800">
                <h3 className="text-lg font-semibold mb-1">
                  {product.name || product.Name || product.nombre}
                </h3>
                <p className="text-base font-medium">
                  $
                  {(
                    product.price ||
                    product.Price ||
                    product.precio ||
                    0
                  ).toLocaleString("es-AR")}
                </p>
                <p className="text-sm mt-2 text-gray-600">
                  TRANSFERENCIA O EFECTIVO{" "}
                  <span className="font-bold text-gray-800">
                    $
                    {Math.round(
                      (product.price || product.Price || product.precio || 0) *
                        0.8
                    ).toLocaleString("es-AR")}
                  </span>
                </p>
              </div>

              <div
                onClick={() => handleAddToCart(product)}
                className="absolute bottom-3 right-3 bg-gray-200 rounded-full p-2 shadow-md hover:bg-gray-300 cursor-pointer transition"
                title="Agregar al carrito"
              >
                <FaShoppingCart className="text-gray-800 text-lg" />
              </div>
            </div>
          ))}

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
