import { useLocation, useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import { FaShoppingCart } from "react-icons/fa";
import api from "../api/api";
import { useCart } from "../context/CartContext";

const API_BASE_URL = import.meta.env.VITE_API_URL;

const DetailProduct = () => {
  const { state: productFromState } = useLocation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(productFromState || null);
  const [selectedImage, setSelectedImage] = useState(null);

  const [loading, setLoading] = useState(!productFromState);
  const [showNotification, setShowNotification] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const [postalCode, setPostalCode] = useState("");
  const [shippingOptions, setShippingOptions] = useState([]);
  const [selectedShipping, setSelectedShipping] = useState(null);
  const [error, setError] = useState("");

  const [relatedProducts, setRelatedProducts] = useState([]);
  const [showDetails, setShowDetails] = useState(false);

  // Funciones auxiliares
  const getMarca = (p) =>
    p.brand ?? p.Brand ?? p.marca ?? p.Marca ?? "Sin marca";
  const getNombre = (p) =>
    p.name ?? p.Name ?? p.nombre ?? p.Nombre ?? "Producto sin nombre";
  const getTitulo = (p) => {
    const nombre = getNombre(p);
    const marca = getMarca(p);
    return marca && marca !== "Sin marca" ? `${marca} ${nombre}` : nombre;
  };

  // Cargar producto
  useEffect(() => {
    const productId = Number(id);
    window.scrollTo({ top: 0, behavior: "smooth" });

    if ((productFromState?.id ?? productFromState?.Id) === productId) {
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
  let images = [];

  // 👀 Debug
  console.log("🔍 Producto recibido:", product);
  console.log("🔍 Propiedad imagenes:", product?.imagenes);

  if (product?.imagenes && product.imagenes.length > 0) {
    images = product.imagenes.map((img) => {
      if (img.startsWith("http")) return img;
      return `${API_BASE_URL.replace(/\/$/, "")}/uploads/${img}`;
    });
  }

  // Fallback si no hay imágenes
  if (images.length === 0) {
    images = ["https://nmrelojesapi.onrender.com/uploads/relojhombre.jpg"];
  }

  // Setear la imagen principal al cargar imágenes
  useEffect(() => {
    if (images.length > 0 && !selectedImage) {
      setSelectedImage(images[0]);
    }
  }, [images, selectedImage]);

  const description =
    product?.descripcion || product?.Description || product?.description || "";

  const Specs =
    product?.Specs ||
    product?.specs ||
    (product?.caracteristicas
      ? Array.isArray(product.caracteristicas)
        ? product.caracteristicas.join("\n")
        : product.caracteristicas
      : "");
  const color = product?.color || product?.Color || "";
  const totalPrice = price;
  const installmentCount = 6;
  const installmentValue = totalPrice / installmentCount;
  const discountPrice = totalPrice * 0.8;

  // Agregar al carrito
  const handleAddToCart = () => {
    if (!product) return;

    const availableStock = product.stock ?? product.Stock ?? 0;
    const productId = product.id || product.Id;

    const existingItem = JSON.parse(localStorage.getItem("cart") || "[]").find(
      (item) => item.id === productId
    );
    const totalRequested = (existingItem?.quantity || 0) + quantity;

    if (totalRequested > availableStock) {
      setError(
        `Solo quedan ${availableStock} ${
          availableStock === 1 ? "unidad" : "unidades"
        } disponibles.`
      );
      return;
    }

    addToCart(productId, quantity);
    setShowNotification(true);
    setError("");
    setTimeout(() => setShowNotification(false), 2000);
  };

  // Calcular envío
  const handleCalculateShipping = async () => {
    if (!postalCode.match(/^\d{4}$/)) {
      setError("Ingresá un código postal válido (4 dígitos).");
      setShippingOptions([]);
      setSelectedShipping(null);
      return;
    }
    setError("");

    try {
      let res;
      try {
        res = await axios.post(
          `${API_BASE_URL}/shipping/calculate`,
          { postalCode },
          { headers: { "Content-Type": "application/json" } }
        );
      } catch {
        res = await axios.get(
          `${API_BASE_URL}/shipping/calculate/${postalCode}`
        );
      }

      const data = Array.isArray(res.data) ? res.data : [res.data];

      if (data.length > 0) {
        setShippingOptions(data);
        setSelectedShipping(data[0]);
      } else {
        setShippingOptions([]);
        setSelectedShipping(null);
        setError("No hay opciones de envío para este código postal.");
      }
    } catch (err) {
      setError("Error al calcular envío. Intenta de nuevo.");
      console.error(err);
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
    <div className="bg-white min-h-screen p-4 sm:p-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-6 md:gap-12">
        {/* Imagen */}
        <div className="w-full md:w-1/2 flex flex-col items-center">
          <img
            src={selectedImage}
            alt={name}
            className="rounded-lg w-full h-auto max-h-[650px] object-cover border border-gray-200 shadow"
          />
          {/* Thumbnails */}
          <div className="flex gap-2 mt-4 flex-wrap justify-center">
            {images.map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt={`thumb-${idx}`}
                className={`w-20 h-20 object-cover rounded-md cursor-pointer border ${
                  selectedImage === img ? "border-[#005f73]" : "border-gray-300"
                }`}
                onClick={() => setSelectedImage(img)}
              />
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="w-full md:w-1/2 flex flex-col">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">
            {getTitulo(product)}
          </h1>

          {/* Precio */}
          <div className="text-2xl sm:text-3xl md:text-3xl font-bold text-[#006d77] mb-2">
            ${totalPrice.toLocaleString("es-AR")}
          </div>

          {/* Stock */}
          {stock > 0 ? (
            <p className="font-medium mb-4 text-sm sm:text-base">
              Stock disponible: {stock} {stock === 1 ? "unidad" : "unidades"}
            </p>
          ) : (
            <p className="text-[#005f73] font-medium mb-4 text-sm sm:text-base">
              Sin stock disponible
            </p>
          )}

          {/* Cuotas y descuentos */}
          <div className="text-sm sm:text-base md:text-base text-gray-600 mb-2 space-y-1">
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

          {/* Ver más detalles */}
          <p
            onClick={() => setShowDetails(true)}
            className="text-[#005f73] cursor-pointer underline hover:text-[#003f4a] mb-4 sm:mb-6 text-sm sm:text-base"
          >
            Ver más detalles
          </p>

          {/* Color */}
          {color && (
            <div className="flex items-center gap-3 mb-6 text-sm sm:text-base">
              <span className="font-semibold">Color:</span>
              <span className="text-gray-600">{color}</span>
            </div>
          )}

          {/* Cantidad + Botón */}
          {stock > 0 ? (
            <div className="flex flex-col gap-3 mb-6">
              <div className="flex flex-col sm:flex-row items-center gap-3">
                {/* Selector de cantidad */}
                <div className="flex items-center border rounded-md overflow-hidden">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-3 py-1 bg-gray-200 hover:bg-gray-300 text-sm sm:text-base"
                  >
                    -
                  </button>
                  <span className="px-5 text-base sm:text-lg">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="px-3 py-1 bg-gray-200 hover:bg-gray-300 text-sm sm:text-base"
                  >
                    +
                  </button>
                </div>

                {/* Botón Agregar al carrito */}
                <button
                  onClick={handleAddToCart}
                  className="flex-1 py-2 px-6 bg-[#005f73] text-white rounded-2xl hover:bg-gray-800 shadow transition-all text-sm"
                >
                  Agregar al carrito
                </button>
              </div>

              {/* Mensaje de error */}
              {error && (
                <p className="text-[#005f73] font-medium text-sm mt-1 p-2 rounded">
                  {error}
                </p>
              )}
            </div>
          ) : (
            <button
              disabled
              className="text-[#005f73] font-medium px-4 py-2 rounded cursor-not-allowed"
            >
              SIN STOCK
            </button>
          )}

          {/* Envío */}
          <div className="p-3 mb-6 text-sm sm:text-base">
            <h3 className="font-medium mb-2 text-gray-800">Calculá tu envío</h3>
            <div className="flex gap-2 flex-col sm:flex-row">
              <input
                type="text"
                placeholder="Código postal"
                value={postalCode}
                onChange={(e) => {
                  setPostalCode(e.target.value);
                  setError("");
                }}
                className="w-full px-3 py-1.5 sm:px-4 sm:py-1.5 text-sm sm:text-base border rounded-xl focus:outline-none focus:ring-2 focus:ring-black transition"
              />
              <button
                onClick={handleCalculateShipping}
                className="py-2 px-7 bg-black text-white rounded-2xl hover:bg-gray-800 shadow transition-all text-sm"
              >
                Calcular
              </button>
            </div>
            {/* Link debajo */}
            <p className="mt-2 text-gray-600 text-xs sm:text-sm">
              <a
                href="https://www.correoargentino.com.ar/formularios/cpa"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#005f73] cursor-pointer hover:text-[#003f4a] mb-4 sm:mb-6 text-xs sm:text-sm font-semibold"
              >
                No sé mi codigo postal
              </a>
            </p>

            {shippingOptions.length > 0 && (
              <div className="mt-3 space-y-2 text-sm sm:text-base">
                <p className="text-gray-700">
                  Opciones de envío para CP <b>{postalCode}</b>:
                </p>
                {shippingOptions.map((option, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col border rounded p-2 bg-gray-50"
                  >
                    <span className="font-semibold">{option.name}</span>
                    <span className="text-gray-600">{option.description}</span>
                    <span className="font-bold text-gray-900">
                      {option.cost === 0
                        ? "Gratis"
                        : `$${option.cost.toLocaleString("es-AR")}`}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Descripción */}
          {description && (
            <div className="p-4 text-sm sm:text-base md:text-base text-gray-700 leading-relaxed">
              <p
                style={{ whiteSpace: "pre-line" }}
                dangerouslySetInnerHTML={{
                  __html: description.replace(
                    "Otras características:",
                    "<strong>Otras características:</strong>"
                  ),
                }}
              />
            </div>
          )}

          {/* Especificaciones */}
          {Specs && (
            <div className="p-4 text-sm sm:text-base md:text-base text-gray-700 leading-relaxed space-y-1">
              {Specs.split("\n").map((spec, idx) => (
                <p key={idx} className="font-semibold m-0">
                  {spec.trim()}
                </p>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Productos relacionados */}
      <div className="max-w-6xl mx-auto mt-12">
        <h2 className="text-xl sm:text-2xl font-bold mb-4">
          También te puede interesar
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
          {relatedProducts.length > 0 ? (
            relatedProducts.map((rawProduct) => {
              // Normalizamos el producto
              const product = {
                id: rawProduct.Id ?? rawProduct.id,
                name:
                  rawProduct.Nombre ??
                  rawProduct.nombre ??
                  rawProduct.Name ??
                  rawProduct.name ??
                  "",
                price:
                  rawProduct.Precio ??
                  rawProduct.precio ??
                  rawProduct.Price ??
                  rawProduct.price ??
                  0,
                image:
                  rawProduct.Imagen ??
                  rawProduct.imagen ??
                  rawProduct.Image ??
                  rawProduct.image ??
                  "/placeholder.png",
                description: rawProduct.descripcion ?? "",
                color: rawProduct.Color ?? rawProduct.color ?? "",
                stock: rawProduct.Stock ?? rawProduct.stock ?? 0,
                brand:
                  rawProduct.Marca ??
                  rawProduct.marca ??
                  rawProduct.Brand ??
                  rawProduct.brand ??
                  "",
                caracteristicas:
                  rawProduct.caracteristicas ??
                  rawProduct.Caracteristicas ??
                  [],
              };

              const sinStock = product.stock <= 0;

              return (
                <div
                  key={product.id}
                  className="relative bg-white rounded-lg shadow-md hover:shadow-lg transition overflow-hidden border cursor-pointer"
                  onClick={() =>
                    navigate(`/producto/${product.id}`, { state: product })
                  }
                >
                  <div className="relative group aspect-square">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover transform transition-transform duration-300 group-hover:scale-105"
                    />
                    {sinStock && (
                      <span className="absolute top-2 left-2 bg-[#005f73] text-white text-xs font-bold px-2 py-1 rounded-md shadow-md">
                        SIN STOCK
                      </span>
                    )}
                    {!sinStock && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(product.id, 1);
                        }}
                        className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-white p-2 rounded-full shadow-lg hover:bg-gray-100 transition"
                        title="Agregar al carrito"
                      >
                        <FaShoppingCart className="text-gray-800 text-sm sm:text-lg" />
                      </button>
                    )}
                  </div>
                  <div className="p-3 sm:p-4 text-center">
                    <h3 className="text-sm sm:text-base font-bold font-poppins mb-2 truncate">
                      {product.brand
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
                      <p className="text-[#005f73] font-bold text-sm mt-2 p-2 rounded">
                        Agotado
                      </p>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-center col-span-full text-gray-500">
              No se encontraron productos relacionados.
            </p>
          )}
        </div>
      </div>

      {/* Modal de detalles de pago */}
      {showDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full relative">
            <button
              onClick={() => setShowDetails(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-xl"
            >
              ✖
            </button>
            <h2 className="text-xl sm:text-2xl font-bold mb-4">
              Medios de pago
            </h2>
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
            <p className="mt-2 text-sm text-gray-600">
              Cuando termines la compra vas a ver la información de pago en
              relación a esta opción.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DetailProduct;
