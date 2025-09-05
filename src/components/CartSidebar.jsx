import { useState, useEffect, useRef } from "react";
import { FaTimes, FaTrash } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import axios from "axios";

const CartSidebar = ({ onClose: propOnClose }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const {
    cart,
    removeFromCart,
    updateItem,
    cartSidebarOpen,
    setCartSidebarOpen,
  } = useCart();

  const [postalCode, setPostalCode] = useState("");
  const [error, setError] = useState("");
  const [shippingOptions, setShippingOptions] = useState([]);
  const [selectedShipping, setSelectedShipping] = useState(null);

  const total = cart?.total ?? 0;
  const itemsContainerRef = useRef(null);

  useEffect(() => {
    if (cartSidebarOpen && itemsContainerRef.current) {
      itemsContainerRef.current.scrollTo({
        top: itemsContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [cart.items, cartSidebarOpen]);

  const getItemImagen = (item) => {
    if (!item) return "https://localhost:7247/uploads/placeholder.png";
    if (item.imageUrl?.startsWith("http")) return item.imageUrl;
    const img =
      item.image || item.Image || item.imageUrl || item.imagen || item.Imagen;
    return img
      ? `https://localhost:7247/uploads/${img}`
      : "https://localhost:7247/uploads/placeholder.png";
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
    item.subtotal || item.Subtotal || item.quantity * item.unitPrice || 0;

  const handleDecrease = (item) => {
    const cantidad = getItemCantidad(item);
    if (cantidad > 1) updateItem(item.id, cantidad - 1);
    else removeFromCart(item.id);
  };

  const handleIncrease = (item) => {
    const cantidad = getItemCantidad(item);
    updateItem(item.id, cantidad + 1);
  };

  const handleCalculateShipping = async () => {
    if (!postalCode.match(/^\d{4}$/)) {
      setShippingOptions([]);
      setSelectedShipping(null);
      return;
    }
    setError("");

    try {
      let res;
      try {
        res = await axios.post(
          "https://localhost:7247/api/shipping/calculate",
          { postalCode },
          { headers: { "Content-Type": "application/json" } }
        );
      } catch {
        res = await axios.get(
          `https://localhost:7247/api/shipping/calculate/${postalCode}`
        );
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

  const getItemBrand = (item) => item.brand || item.Brand || item.Marca || "";
  const getItemFullName = (item) => {
    const brand = getItemBrand(item);
    const name =
      item.name ||
      item.Name ||
      item.productName ||
      item.ProductName ||
      item.nombre ||
      "Producto";
    return brand ? `${brand} ${name}` : name;
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
        className={`fixed top-0 right-0 h-full w-96 bg-white shadow-2xl transform z-50 flex flex-col transition-transform duration-500 ease-in-out ${
          cartSidebarOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-white">
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
                  className="flex items-center justify-between gap-3 p-2 border rounded shadow-sm hover:shadow-md transition transform duration-200"
                >
                  <img
                    src={getItemImagen(item)}
                    alt={getItemNombre(item)}
                    className="w-20 h-20 object-cover rounded"
                  />
                  <div className="flex-1 flex flex-col justify-between">
                    <h3 className="text-lg font-poppins mb-2 truncate">
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
                  <div className="flex flex-col items-end gap-1">
                    <p className="font-bold">
                      ${getItemSubtotal(item).toLocaleString("es-AR")}
                    </p>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-500 hover:text-red-700"
                      aria-label="Eliminar producto"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))}

              {/* Medios de envío */}
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
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:ring-black"
                    }`}
                  />
                  <button
                    onClick={handleCalculateShipping}
                    className="w-28 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-all text-sm font-medium"
                  >
                    Calcular
                  </button>
                </div>
                {error && <p className="text-red-500 text-sm mt-1">{error}</p>}

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
                <button
                  onClick={handleFinalizePurchase}
                  className="mt-2 w-full bg-[#005f73] hover:bg-[#0a4a4a] text-white py-3 rounded-lg font-semibold transition-all"
                >
                  Finalizar compra
                </button>
                {/* Botón Ver más productos debajo */}
                <button
                  onClick={() => {
                    setCartSidebarOpen(false);
                    navigate("/");
                  }}
                  className="mt-3 w-full border border-[#005f73] text-[#005f73]  py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-1"
                >
                  Ver más productos <span>→</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default CartSidebar;
