import { FaTimes, FaTrash } from "react-icons/fa";

const CartSidebar = ({
  isOpen,
  onClose,
  cartItems,
  removeFromCart,
  decreaseQuantity,
}) => {
  const total = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  return (
    <div
      className={`fixed top-0 right-0 h-full w-80 bg-white shadow-lg transform transition-transform z-50 ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-xl font-bold">Carrito</h2>
        <button onClick={onClose} aria-label="Cerrar">
          <FaTimes />
        </button>
      </div>

      <div className="p-4 space-y-4 overflow-y-auto h-[calc(100%-150px)]">
        {cartItems.length === 0 ? (
          <p className="text-center text-gray-500">Tu carrito está vacío</p>
        ) : (
          cartItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-2 border-b pb-2"
            >
              <img
                src={item.image}
                alt={item.name}
                className="w-16 h-16 object-cover rounded"
              />
              <div className="flex-1">
                <h3 className="text-sm font-semibold">{item.name}</h3>
                <p className="text-sm text-gray-700">
                  Cantidad: {item.quantity}
                </p>
                <p className="text-sm font-bold">
                  ${item.price.toLocaleString("es-AR")}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <button
                  onClick={() => decreaseQuantity(item.id)}
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

      <div className="p-4 border-t">
        <p className="text-lg font-semibold">
          Total: ${total.toLocaleString("es-AR")}
        </p>
        <button className="mt-2 w-full bg-gray-900 text-white py-2 rounded hover:bg-gray-800 transition">
          Finalizar compra
        </button>
      </div>
    </div>
  );
};

export default CartSidebar;
