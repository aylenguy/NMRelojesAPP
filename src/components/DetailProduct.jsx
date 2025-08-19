import { useLocation, useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../api/api";
import { useCart } from "../context/CartContext"; // 👈 importamos el contexto

const DetailProduct = () => {
  const { state: productFromState } = useLocation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart(); // 👈 usamos el contexto

  const [product, setProduct] = useState(productFromState || null);
  const [loading, setLoading] = useState(!productFromState);
  const [showNotification, setShowNotification] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [postalCode, setPostalCode] = useState("");
  const [shippingCost, setShippingCost] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [showDetails, setShowDetails] = useState(false);

  // Cargar producto
  useEffect(() => {
    const productId = Number(id);
    window.scrollTo({ top: 0, behavior: "smooth" });

    if (
      productFromState &&
      (productFromState.id || productFromState.Id) === productId
    ) {
      setProduct(productFromState);
      setLoading(false);
    } else {
      setLoading(true);
      api
        .get(`/Product/GetById/${productId}`)
        .then((res) => setProduct(res.data))
        .catch((err) => console.error("Error cargando producto:", err))
        .finally(() => setLoading(false));
    }
  }, [id, productFromState]);

  // Cargar productos relacionados
  useEffect(() => {
    if (!product) return;
    const currentId = product.id || product.Id;
    const categoryId = product.categoryId || product.CategoryId;

    const processProducts = (items) => {
      const unique = items.filter((p, index, self) => {
        const pid = p.id || p.Id;
        return (
          pid !== currentId &&
          index === self.findIndex((x) => (x.id || x.Id) === pid)
        );
      });
      const shuffled = [...unique].sort(() => 0.5 - Math.random());
      setRelatedProducts(shuffled.slice(0, 4));
    };

    if (categoryId) {
      api
        .get(`/Product/GetByCategory/${categoryId}`)
        .then((res) => processProducts(res.data))
        .catch((err) => console.error("Error cargando relacionados:", err));
    } else {
      api
        .get("/Product/GetAllProducts")
        .then((res) => processProducts(res.data))
        .catch((err) =>
          console.error("Error cargando productos aleatorios:", err)
        );
    }
  }, [product]);

  // Datos del producto
  const name = product?.name || product?.Name || product?.nombre || "";
  const price = product?.price || product?.Price || product?.precio || 0;
  const stock = product?.stock || product?.Stock || 0;
  const image =
    product?.image || product?.Image || product?.imagen || "/placeholder.png";
  const description =
    product?.description || product?.Description || product?.descripcion || "";
  const color = product?.color || product?.Color || "";
  const totalPrice = price * quantity;
  const installmentCount = 6;
  const installmentValue = totalPrice / installmentCount;
  const discountPrice = totalPrice * 0.8;

  // ✅ Unificado con Home: id + quantity
  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product.id || product.Id, quantity);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 2000);
  };

  const handleCalculateShipping = () => {
    if (!postalCode) return;
    setShippingCost(totalPrice >= 50000 ? 0 : 2000);
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
          <div className="text-4xl font-extrabold text-[#006d77] mb-2">
            ${totalPrice.toLocaleString("es-AR")}
          </div>

          {/* Stock disponible */}
          {stock > 0 ? (
            <p className="text-green-600 font-medium mb-4">
              Stock disponible: {stock} {stock === 1 ? "unidad" : "unidades"}
            </p>
          ) : (
            <p className="text-red-600 font-medium mb-4">
              Sin stock disponible
            </p>
          )}

          {/* Cuotas y descuentos */}
          <div className="text-lg text-gray-600 mb-2 space-y-2">
            <p>
              <span className="text-[#005f73] font-semibold">
                Hasta {installmentCount} cuotas sin interés
              </span>{" "}
              de ${installmentValue.toLocaleString("es-AR")}
            </p>
            <p>
              <span className="text-[#005f73] font-semibold">
                ${discountPrice.toLocaleString("es-AR")}
              </span>{" "}
              pagando con Transferencia o depósito bancario
            </p>
            <p>
              <span className="text-[#005f73] font-semibold">
                ${discountPrice.toLocaleString("es-AR")}
              </span>{" "}
              pagando en Efectivo
            </p>
          </div>

          {/* Botón ver más detalles */}
          <p
            onClick={() => setShowDetails(true)}
            className="text-[#c77d00] cursor-pointer underline hover:text-[#a56600] mb-6"
          >
            Ver más detalles
          </p>

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

          {description && (
            <p className="text-lg text-gray-700 mb-8 leading-relaxed">
              {description}
            </p>
          )}

          {/* Cantidad + Botón */}
          <div className="flex items-center gap-4 mb-8">
            {stock > 0 ? (
              <>
                {/* Selector de cantidad */}
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

                {/* Botón agregar */}
                <button
                  onClick={handleAddToCart}
                  className="flex-1 bg-[#005f73] text-white px-6 py-3 rounded-lg hover:bg-[#0a9396] transition text-lg"
                >
                  Agregar al carrito
                </button>
              </>
            ) : (
              // 🔹 Si no hay stock
              <button
                disabled
                className="flex-1 bg-gray-400 text-white px-6 py-3 rounded-lg cursor-not-allowed text-lg"
              >
                SIN STOCK
              </button>
            )}
          </div>

          {/* Envío */}
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
                className="bg-[#005f73] text-white px-4 py-2 rounded-lg hover:bg-[#0a9396] transition"
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
      <div className="max-w-6xl mx-auto mt-16">
        <h2 className="text-2xl font-bold mb-6">También te puede interesar</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {relatedProducts.map((item) => (
            <div
              key={item.id || item.Id}
              onClick={() =>
                navigate(`/producto/${item.id || item.Id}`, { state: item })
              }
              className="cursor-pointer border rounded-lg overflow-hidden shadow hover:shadow-lg transition"
            >
              <img
                src={
                  item.image || item.Image || item.imagen || "/placeholder.png"
                }
                alt={item.name || item.Name || item.nombre}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-2">
                  {item.name || item.Name || item.nombre}
                </h3>
                <p className="text-[#005f73] font-bold">
                  $
                  {item.price?.toLocaleString("es-AR") ||
                    item.Price?.toLocaleString("es-AR") ||
                    item.precio?.toLocaleString("es-AR")}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal de medios de pago */}
      {showDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full relative">
            <button
              onClick={() => setShowDetails(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-xl"
            >
              ✖
            </button>
            <h2 className="text-2xl font-bold mb-4">Medios de pago</h2>
            <p className="mb-2">
              <strong>Mercado Pago:</strong> Hasta {installmentCount} cuotas sin
              interés de ${installmentValue.toLocaleString("es-AR")}.
            </p>
            <p className="mb-2">
              <strong>Transferencia o depósito bancario:</strong> $
              {discountPrice.toLocaleString("es-AR")} (20% de descuento)
            </p>
            <p className="mb-2">
              <strong>Efectivo:</strong> $
              {discountPrice.toLocaleString("es-AR")} (20% de descuento)
            </p>
            <p className="mt-4 text-sm text-gray-600">
              Cuando termines la compra vas a ver la información de pago en
              relación a esta opción.
            </p>
          </div>
        </div>
      )}

      {/* WhatsApp */}
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
