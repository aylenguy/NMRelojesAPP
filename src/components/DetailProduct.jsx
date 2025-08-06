import { useLocation } from "react-router-dom";
import { useState } from "react";

const DetailProduct = ({ addToCart }) => {
  const { state: product } = useLocation();
  const [showNotification, setShowNotification] = useState(false);

  const handleAddToCart = () => {
    addToCart(product);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 2000);
  };

  if (!product) {
    return (
      <div className="p-6 text-center text-red-500">
        Producto no encontrado.
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen p-6 relative">
      {showNotification && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded shadow-md z-50">
          ✅ Producto agregado al carrito
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row gap-10 bg-white rounded-lg shadow-md p-6">
          <div className="w-full md:w-1/2 flex justify-center">
            <img
              src={product.image}
              alt={product.name}
              className="rounded-lg w-full max-w-md object-cover"
            />
          </div>

          <div className="w-full md:w-1/2">
            <h1 className="text-3xl font-semibold text-gray-900 mb-2">
              {product.name}
            </h1>

            <div className="text-2xl font-bold text-gray-800">
              ${product.price.toLocaleString("es-AR")}
              {product.oldPrice && (
                <span className="text-base text-gray-500 line-through ml-3">
                  ${product.oldPrice.toLocaleString("es-AR")}
                </span>
              )}
            </div>

            <p className="mt-4 text-gray-700">{product.description}</p>

            {product.color && (
              <div className="mt-4">
                <p className="font-semibold">
                  Color: <span className="text-gray-600">{product.color}</span>
                </p>
              </div>
            )}

            <ul className="mt-6 text-sm text-gray-700 space-y-1">
              {(product.specs || []).map((spec, index) => (
                <li key={index}>- {spec}</li>
              ))}
            </ul>

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
