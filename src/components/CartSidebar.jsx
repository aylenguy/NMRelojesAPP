import { useState } from "react";
import { FaTimes, FaTrash } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import axios from "axios";

const CartSidebar = ({ isOpen, onClose }) => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const { cart, removeFromCart, updateItem } = useCart();

  const [postalCode, setPostalCode] = useState("");
  const [error, setError] = useState("");
  const [shippingOptions, setShippingOptions] = useState([]);
  const [selectedShipping, setSelectedShipping] = useState(null);

  const total = cart?.total ?? 0;

  const getItemImagen = (item) =>
    item.image ||
    item.Image ||
    item.imagen ||
    item.Imagen ||
    "/placeholder.png";

  const getItemNombre = (item) =>
    item.name ||
    item.Name ||
    item.productName ||
    item.ProductName ||
    item.nombre ||
    "Producto";

  const getItemCantidad = (item) => item.cantidad || item.Cantidad || 1;
  const getItemSubtotal = (item) => item.subtotal || item.Subtotal || 0;

  const handleDecrease = (item) => {
    const cantidad = getItemCantidad(item);
    if (cantidad > 1) updateItem(item.id, cantidad - 1);
    else removeFromCart(item.id);
  };

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

  const handleFinalizePurchase = () => {
    if (!isAuthenticated) {
      onClose();
      navigate("/login", { state: { from: "/checkout/paso-1" } });
      return;
    }

    if (user?.role?.toLowerCase() === "admin") {
      alert("Los administradores no pueden realizar compras.");
      return;
    }

    if (!postalCode.match(/^\d{4}$/)) {
      setError("Ingresá un código postal válido (4 dígitos).");
      return;
    }

    if (!selectedShipping) {
      setError("Seleccioná una opción de envío antes de continuar.");
      return;
    }

    localStorage.setItem(
      "checkoutData",
      JSON.stringify({
        clientId: user?.id ?? 0,
        name: user?.name || "",
        email: user?.email || "",
        address: "",
        phone: "",
        postalCode,
        shippingOption: selectedShipping,
        paymentMethod: "",
      })
    );

    onClose();
    navigate("/checkout/paso-1");
  };

  return (
    <div
      className={`fixed top-0 right-0 h-full w-80 bg-white shadow-lg transform transition-transform z-50 flex flex-col ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-white">
        <h2 className="text-xl font-bold">Mi carrito</h2>
        <button onClick={onClose} aria-label="Cerrar">
          <FaTimes />
        </button>
      </div>

      {/* Contenido scrolleable */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {!cart?.items?.length ? (
          <p className="text-center text-gray-500 italic">
            Tenés tu carrito vacío. Agregá productos y realizá tu compra.
          </p>
        ) : (
          <>
            {/* Items del carrito */}
            {cart.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-2 border-b pb-2"
              >
                <img
                  src={getItemImagen(item)}
                  alt={getItemNombre(item)}
                  className="w-16 h-16 object-cover rounded"
                />
                <div className="flex-1">
                  <h3 className="text-sm font-semibold">
                    {getItemNombre(item)}
                  </h3>
                  <p className="text-sm text-gray-700">
                    Cantidad: {getItemCantidad(item)}
                  </p>
                  <p className="text-sm font-bold">
                    ${getItemSubtotal(item).toLocaleString("es-AR")}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <button
                    onClick={() => handleDecrease(item)}
                    className="text-yellow-600 hover:text-yellow-800 text-xs"
                    title="Disminuir"
                  >
                    -1
                  </button>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-red-500 hover:text-red-700"
                    title="Eliminar"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}

            {/* Medios de envío */}
            <div className="space-y-3">
              <p className="text-sm text-gray-600 font-semibold">
                Medios de envío:
              </p>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Código postal"
                  value={postalCode}
                  onChange={(e) => {
                    setPostalCode(e.target.value);
                    setError("");
                  }}
                  className="flex-1 border rounded px-2 py-1 text-sm"
                />
                <button
                  onClick={handleCalculateShipping}
                  className="bg-white text-[#005f73] font-semibold px-3 rounded border border-[#005f73] hover:bg-[#005f73] hover:text-white text-sm transition-colors"
                >
                  Calcular
                </button>
              </div>

              <a
                href="https://www.correoargentino.com.ar/formularios/cpa"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:underline"
              >
                No sé mi código postal
              </a>

              {error && <p className="text-red-500 text-sm">{error}</p>}

              {shippingOptions.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-gray-700">
                    Entregas para el CP: <b>{postalCode}</b>
                  </p>
                  {shippingOptions.map((option, idx) => (
                    <label
                      key={idx}
                      className="flex items-center gap-2 border rounded p-2 cursor-pointer hover:bg-gray-50"
                    >
                      <input
                        type="radio"
                        name="shipping"
                        checked={selectedShipping?.name === option.name}
                        onChange={() => setSelectedShipping(option)}
                      />
                      <div className="flex flex-col text-sm">
                        <span className="font-semibold">{option.name}</span>
                        <span className="text-gray-600">
                          {option.description}
                        </span>
                        <span className="text-gray-900 font-bold">
                          {option.cost === 0
                            ? "Gratis"
                            : `$${option.cost.toLocaleString("es-AR")}`}
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Total + Botón */}
            <div className="pt-4 border-t">
              <p className="text-lg font-semibold">
                Total: ${" "}
                {(total + (selectedShipping?.cost ?? 0)).toLocaleString(
                  "es-AR"
                )}
              </p>
              <button
                onClick={handleFinalizePurchase}
                className="mt-2 w-full bg-gray-900 text-white py-2 rounded hover:bg-gray-800 transition"
              >
                Realizar compra
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CartSidebar;
