import { useLocation, useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../api/api";

const DetailProduct = ({ addToCart }) => {
  const { state: productFromState } = useLocation();
  const { id } = useParams();

  const [product, setProduct] = useState(productFromState || null);
  const [loading, setLoading] = useState(!productFromState);
  const [showNotification, setShowNotification] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [postalCode, setPostalCode] = useState("");
  const [shippingCost, setShippingCost] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);

  // Cargar producto
  useEffect(() => {
    if (!product) {
      setLoading(true);
      api
        .get(`/Product/GetById/${id}`)
        .then((res) => setProduct(res.data))
        .catch((err) => console.error("Error cargando producto:", err))
        .finally(() => setLoading(false));
    }
  }, [id, product]);

  // Cargar productos relacionados
  useEffect(() => {
    if (product?.categoryId || product?.CategoryId) {
      const categoryId = product.categoryId || product.CategoryId;
      api
        .get(`/Product/GetByCategory/${categoryId}`)
        .then((res) => {
          const items = res.data.filter(
            (p) => (p.id || p.Id) !== (product.id || product.Id)
          );
          setRelatedProducts(items.slice(0, 4)); // máximo 4
        })
        .catch((err) => console.error("Error cargando relacionados:", err));
    }
  }, [product]);

  const name = product?.name || product?.Name || product?.nombre || "";
  const price = product?.price || product?.Price || product?.precio || 0;
  const image = product?.image || product?.Image || product?.imagen || "";
  const description =
    product?.description || product?.Description || product?.descripcion || "";
  const color = product?.color || product?.Color || "";
  const totalPrice = price * quantity;
  const installmentCount = 6;
  const installmentValue = totalPrice / installmentCount;
  const discountPrice = totalPrice * 0.8;

  const handleAddToCart = () => {
    if (!product) return;
    addToCart({
      id: product.id || product.Id,
      name,
      price,
      image,
      quantity,
    });
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 2000);
  };

  const handleCalculateShipping = () => {
    if (!postalCode) return;
    if (totalPrice >= 50000) {
      setShippingCost(0);
    } else {
      setShippingCost(2000);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="w-12 h-12 border-4 border-gray-300 border-t-gray-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="p-6 text-center text-gray-500">
        No se pudo cargar el producto.
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen p-6 relative">
      {showNotification && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded shadow-md z-50">
          ✅ Producto agregado al carrito
        </div>
      )}

      <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-12">
        {/* Imagen */}
        <div className="w-full md:w-1/2 flex justify-center items-start">
          <img
            src={image}
            alt={name}
            className="rounded-lg w-full max-w-2xl h-[650px] object-cover border border-gray-200 shadow"
          />
        </div>

        {/* Info */}
        <div className="w-full md:w-1/2">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">{name}</h1>

          {/* Precio */}
          <div className="text-4xl font-extrabold text-yellow-700 mb-4">
            ${totalPrice.toLocaleString("es-AR")}
          </div>

          {/* Cuotas y descuentos */}
          <div className="text-lg text-gray-600 mb-6 space-y-2">
            <p>
              <span className="text-pink-600 font-semibold">
                Hasta {installmentCount} cuotas sin interés
              </span>{" "}
              de ${installmentValue.toLocaleString("es-AR")} con tarjetas
              seleccionadas
            </p>
            <p>
              <span className="font-semibold">
                ${discountPrice.toLocaleString("es-AR")}
              </span>{" "}
              pagando con Transferencia o depósito bancario
            </p>
            <p>
              <span className="font-semibold">
                ${discountPrice.toLocaleString("es-AR")}
              </span>{" "}
              pagando en Efectivo
            </p>
          </div>

          {/* Color */}
          {color && (
            <div className="flex items-center gap-3 mb-8">
              <span className="font-semibold">Color:</span>
              <span className="text-gray-600">{color}</span>
              <span
                className="w-8 h-8 rounded border"
                style={{ backgroundColor: color }}
              ></span>
            </div>
          )}

          {/* Descripción */}
          {description && (
            <p className="text-lg text-gray-700 mb-8 leading-relaxed">
              {description}
            </p>
          )}

          {/* Cantidad y botón */}
          <div className="flex items-center gap-4 mb-8">
            <div className="flex items-center border rounded-lg overflow-hidden">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-lg"
              >
                -
              </button>
              <span className="px-5 text-lg">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-lg"
              >
                +
              </button>
            </div>
            <button
              onClick={handleAddToCart}
              className="flex-1 bg-yellow-600 text-white px-6 py-3 rounded-lg hover:bg-yellow-700 transition text-lg"
            >
              Agregar al carrito
            </button>
          </div>

          {/* Calculador de envío */}
          <div className="border rounded-lg p-4 mb-8">
            <h3 className="font-semibold mb-3 text-lg">Calculá tu envío</h3>
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Código postal"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                className="border rounded px-3 py-2 flex-1 text-lg"
              />
              <button
                onClick={handleCalculateShipping}
                className="bg-gray-800 text-white px-5 py-2 rounded-lg hover:bg-gray-900 text-lg"
              >
                Calcular
              </button>
            </div>
            {shippingCost !== null && (
              <p className="mt-3 text-gray-700 text-lg">
                {shippingCost === 0
                  ? "🚚 Envío gratis"
                  : `Costo de envío: $${shippingCost.toLocaleString("es-AR")}`}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* También te puede interesar */}
      {relatedProducts.length > 0 && (
        <div className="max-w-6xl mx-auto mt-16">
          <h2 className="text-2xl font-bold mb-6">
            También te puede interesar
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {relatedProducts.map((item) => (
              <Link
                key={item.id || item.Id}
                to={`/product/${item.id || item.Id}`}
                state={item}
                className="border rounded-lg overflow-hidden shadow hover:shadow-lg transition"
              >
                <img
                  src={item.image || item.Image || item.imagen}
                  alt={item.name || item.Name || item.nombre}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2">
                    {item.name || item.Name || item.nombre}
                  </h3>
                  <p className="text-yellow-700 font-bold">
                    $
                    {item.price?.toLocaleString("es-AR") ||
                      item.Price?.toLocaleString("es-AR") ||
                      item.precio?.toLocaleString("es-AR")}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Botón flotante de WhatsApp */}
      <a
        href={`https://wa.me/5491123456789?text=Hola! Estoy interesado en el producto ${name}`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 bg-green-500 text-white p-4 rounded-full shadow-lg hover:bg-green-600 transition text-2xl"
      >
        💬
      </a>
    </div>
  );
};

export default DetailProduct;
