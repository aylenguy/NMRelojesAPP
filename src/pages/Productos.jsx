import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaShoppingCart } from "react-icons/fa";

const productosMock = [
  {
    id: 1,
    name: "Knock out Aylen",
    price: 58000,
    category: "Relojes de Mujer",
    color: "Plateado",
    image: "/img/reloj1.jpg",
    description: "Reloj moderno y cómodo para el uso diario.",
    specs: ["Digital", "Resistente", "Liviano"],
  },
  {
    id: 2,
    name: "Kosiuko Mica",
    price: 88500,
    category: "Relojes de Mujer",
    color: "Dorado",
    image: "/img/reloj2.jpg",
    description: "Estilo fashion con acabados dorados.",
    specs: ["Analógico", "Elegante", "Correa metálica"],
  },
];

const Productos = ({ onAddToCart, searchText }) => {
  const [productos, setProductos] = useState([]);
  const [showNotification, setShowNotification] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setProductos(productosMock);
  }, []);

  const filtered = productos.filter((producto) =>
    producto.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleAddToCart = (producto) => {
    onAddToCart(producto);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 2000);
  };

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
            key={producto.id}
            className="relative bg-white border rounded-lg shadow hover:shadow-lg transition"
          >
            <div
              onClick={() =>
                navigate(`/producto/${producto.id}`, { state: producto })
              }
              className="cursor-pointer"
            >
              <img
                src={producto.image}
                alt={producto.name}
                className="w-full h-64 object-cover rounded-t-lg"
              />
            </div>

            <div className="p-4 text-gray-800">
              <h3 className="text-lg font-semibold mb-1">{producto.name}</h3>
              <p className="text-base font-medium">
                ${producto.price.toLocaleString("es-AR")}
              </p>
              <p className="text-sm mt-2 text-gray-600">
                TRANSFERENCIA O EFECTIVO{" "}
                <span className="font-bold text-gray-800">
                  ${Math.round(producto.price * 0.8).toLocaleString("es-AR")}
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
