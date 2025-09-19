// src/components/CartSidebar.jsx
import { useState, useEffect, useRef } from "react";
import { FaTimes, FaTrash } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;
// Forzar HTTPS siempre
const BASE_URL = API_URL.replace("/api", "").replace("http://", "https://");

const CartSidebar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const {
    cart,
    removeFromCart,
    cartSidebarOpen,
    setCartSidebarOpen,
    addToCart,
  } = useCart();
  const { updateQuantity } = useCart();

  const [postalCode, setPostalCode] = useState("");
  const [error, setError] = useState("");
  const [shippingOptions, setShippingOptions] = useState([]);
  const [selectedShipping, setSelectedShipping] = useState(null);
  // Descuento del 20%

  const total = cart?.total ?? 0;
  const discountRate = 0.2;
  const totalWithShipping = total + (selectedShipping?.cost ?? 0);
  const discountedPrice = totalWithShipping * (1 - discountRate);

  const itemsContainerRef = useRef(null);

  useEffect(() => {
    if (cartSidebarOpen && itemsContainerRef.current) {
      itemsContainerRef.current.scrollTo({
        top: itemsContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [cart?.items, cartSidebarOpen]);

  // Helpers
  const getItemImagen = (item) => {
    if (!item) return `${BASE_URL}/uploads/placeholder.png`;
    const img = item.imageUrl || item.ImageUrl;
    if (!img) return `${BASE_URL}/uploads/placeholder.png`;
    return img.startsWith("http") ? img : `${BASE_URL}/uploads/${img}`;
  };

  const getItemNombre = (item) =>
    item.name ||
    item.Name ||
    item.productName ||
    item.ProductName ||
    item.nombre ||
    "Producto";

  const getItemCantidad = (item) =>
    item.cantidad || item.Cantidad || item.quantity || 1;

  const getItemSubtotal = (item) =>
    item.subtotal ||
    item.Subtotal ||
    getItemCantidad(item) * (item.unitPrice || 0);

  const getItemBrand = (item) => item.brand || item.Brand || item.Marca || "";
  const getItemFullName = (item) => {
    const brand = getItemBrand(item);
    const name = getItemNombre(item);
    return brand ? `${brand} ${name}` : name;
  };

  // Modificar cantidades
  const handleIncrease = (item) => {
    const cantidad = getItemCantidad(item);
    updateQuantity(item.id, cantidad + 1);
  };

  const handleDecrease = (item) => {
    const cantidad = getItemCantidad(item);
    updateQuantity(item.id, cantidad - 1);
  };

  // Envío
  const handleCalculateShipping = async () => {
    if (!postalCode.match(/^\d{4}$/)) {
      setShippingOptions([]);
      setSelectedShipping(null);
      setError("Código postal inválido");
      return;
    }
    setError("");

    try {
      let res;
      try {
        res = await axios.post(
          `${API_URL}/shipping/calculate`,
          { postalCode },
          { headers: { "Content-Type": "application/json" } }
        );
      } catch {
        res = await axios.get(`${API_URL}/shipping/calculate/${postalCode}`);
      }

      const data = Array.isArray(res.data) ? res.data : [res.data];

      if (data.length > 0) {
        setShippingOptions(data);
        setSelectedShipping(data[0]);
        localStorage.setItem(
          "shippingData",
          JSON.stringify({ postalCode, shippingOption: data[0] })
        );
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

  const handleSelectShipping = (option) => {
    setSelectedShipping(option);
    localStorage.setItem(
      "shippingData",
      JSON.stringify({ postalCode, shippingOption: option })
    );
  };

  // Finalizar compra
  const handleFinalizePurchase = () => {
    if (user?.role?.toLowerCase() === "admin") {
      alert("Los administradores no pueden realizar compras.");
      return;
    }

    const guestCart = cart || { items: [], total: 0 };
    localStorage.setItem("guestCart", JSON.stringify(guestCart));

    const checkoutPayload = {
      clientId: user?.id ?? 0,
      name: user?.name || "",
      lastname: user?.lastname || "",
      email: user?.email || "",
      phone: "",
      dni: "",
      street: "",
      number: "",
      department: "",
      description: "",
      city: "",
      province: "",
      postalCode: postalCode || "",
      shipping: selectedShipping?.name || "",
      shippingOption: selectedShipping || null,
      paymentMethod: "",
      items: guestCart.items || [],
    };

    localStorage.setItem("checkoutData", JSON.stringify(checkoutPayload));
    setCartSidebarOpen(false);
    navigate("/checkout/paso-1");
  };

  return (
    <>
      {/* Overlay */}
      {cartSidebarOpen && (
        <div
          onClick={() => setCartSidebarOpen(false)}
          className="fixed inset-0 bg-black bg-opacity-40 z-40 transition-opacity duration-300"
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full bg-white shadow-2xl transform z-50 flex flex-col transition-transform duration-500 ease-in-out w-full sm:w-96 ${
          cartSidebarOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold flex items-center gap-2">
            Mi carrito
          </h2>
          <button
            onClick={() => setCartSidebarOpen(false)}
            aria-label="Cerrar"
            className="text-gray-600 hover:text-gray-900 transition"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Contenido scrollable */}
        <div
          ref={itemsContainerRef}
          className="flex-1 overflow-y-auto p-4 space-y-4 pb-6"
        >
          {!cart?.items?.length ? (
            <div className="text-center space-y-4">
              <p className="text-gray-600 font-poppins text-base">
                Tenés tu carrito vacío. Agregá productos y realizá tu compra.
              </p>
            </div>
          ) : (
            <>
              {cart.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start justify-between gap-3 p-2 border rounded shadow-sm hover:shadow-md transition transform duration-200"
                >
                  <img
                    src={getItemImagen(item)}
                    alt={getItemNombre(item)}
                    className="w-20 h-20 object-cover rounded"
                  />
                  <div className="flex-1 flex flex-col justify-between min-w-0 h-full">
                    <h3 className="text-lg font-poppins mb-2 break-words">
                      {getItemFullName(item)}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <button
                        onClick={() => handleDecrease(item)}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-700 rounded px-2"
                        aria-label="Disminuir cantidad"
                      >
                        -
                      </button>
                      <span>{getItemCantidad(item)}</span>
                      <button
                        onClick={() => handleIncrease(item)}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-700 rounded px-2"
                        aria-label="Aumentar cantidad"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col items-end justify-end gap-1">
                    <p className="font-bold">
                      ${getItemSubtotal(item).toLocaleString("es-AR")}
                    </p>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-[#005f73] hover:text-[#0a4a4a]"
                      aria-label="Eliminar producto"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))}

              {/* Envío */}
              <div className="mt-6">
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Código postal
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Ingrese su código postal"
                    value={postalCode}
                    onChange={(e) => {
                      setPostalCode(e.target.value);
                      setError("");
                    }}
                    className={`flex-1 px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 ${
                      error
                        ? "border-[#005f73] focus:ring-[#005f73]"
                        : "border-gray-300 focus:ring-black"
                    }`}
                  />
                  <button
                    onClick={handleCalculateShipping}
                    className="py-2 px-7 bg-black text-white rounded-2xl hover:bg-gray-800 shadow transition-all text-sm"
                  >
                    Calcular
                  </button>
                </div>

                {error && (
                  <p className="text-[#005f73]  font-bold text-sm mt-1 ">
                    {error}
                  </p>
                )}

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
                  <div className="space-y-3 mt-4">
                    {shippingOptions.map((option, idx) => (
                      <label
                        key={idx}
                        className={`flex items-center p-4 border rounded-xl cursor-pointer ${
                          selectedShipping?.name === option.name
                            ? "border-black bg-gray-50"
                            : "border-gray-300 bg-white"
                        }`}
                      >
                        <input
                          type="radio"
                          name="shipping"
                          className="mr-4"
                          checked={selectedShipping?.name === option.name}
                          onChange={() => handleSelectShipping(option)}
                        />
                        <div>
                          <p className="font-semibold">{option.name}</p>
                          <p className="text-sm text-gray-500">
                            {option.description}
                          </p>
                          <p className="font-bold">
                            {option.cost === 0
                              ? "Gratis"
                              : `$${option.cost.toLocaleString("es-AR")}`}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-4 border-t mt-4 space-y-2">
                <p className="text-xl font-bold">
                  Total: $
                  {(total + (selectedShipping?.cost ?? 0)).toLocaleString(
                    "es-AR"
                  )}
                </p>

                {/* Precios con descuento */}
                <p className="text-sm text-gray-700">
                  ${discountedPrice.toLocaleString("es-AR")} pagando con
                  Transferencia o depósito bancario o efectivo
                </p>

                <div className="flex flex-col gap-2">
                  <button
                    onClick={handleFinalizePurchase}
                    className="py-2 px-6 bg-[#005f73] text-white rounded-2xl hover:bg-gray-800 shadow transition-all text-sm"
                  >
                    Finalizar compra
                  </button>

                  <button
                    onClick={() => {
                      setCartSidebarOpen(false);
                      navigate("/");
                    }}
                    className="py-2 px-6 bg-[#005f73] text-white rounded-2xl hover:bg-gray-800 shadow transition-all text-sm"
                  >
                    <span className="mr-1">←</span> Ver más productos
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default CartSidebar;
