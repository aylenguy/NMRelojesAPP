import { FaTimes, FaTrash } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

const CartSidebar = ({ isOpen, onClose }) => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const { cart, removeFromCart, updateItem } = useCart();

  const total = cart?.total ?? 0;

  // Funciones de compatibilidad de propiedades
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

    localStorage.setItem(
      "checkoutData",
      JSON.stringify({
        clientId: user?.id ?? 0,
        name: user?.name || "",
        email: user?.email || "",
        address: "",
        phone: "",
        paymentMethod: "",
      })
    );

    onClose();
    navigate("/checkout/paso-1");
  };

  return (
    <div
      className={`fixed top-0 right-0 h-full w-80 bg-white shadow-lg transform transition-transform z-50 ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-xl font-bold">Carrito</h2>
        <button onClick={onClose} aria-label="Cerrar">
          <FaTimes />
        </button>
      </div>

      {/* Items */}
      <div className="p-4 space-y-4 overflow-y-auto h-[calc(100%-150px)]">
        {!cart?.items?.length ? (
          <p className="text-center text-gray-500">Tu carrito está vacío</p>
        ) : (
          cart.items.map((item) => (
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
                <h3 className="text-sm font-semibold">{getItemNombre(item)}</h3>
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
          ))
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t">
        <p className="text-lg font-semibold">
          Total: ${total.toLocaleString("es-AR")}
        </p>
        <button
          onClick={handleFinalizePurchase}
          className="mt-2 w-full bg-gray-900 text-white py-2 rounded hover:bg-gray-800 transition"
          disabled={!cart?.items?.length}
        >
          Finalizar compra
        </button>
      </div>
    </div>
  );
};

export default CartSidebar;
