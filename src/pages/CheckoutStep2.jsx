import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CheckoutProgress from "../components/CheckoutProgress";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

export default function CheckoutStep2() {
  const { cart, fetchCart, loading: cartLoading } = useCart();
  const { token } = useAuth();
  const navigate = useNavigate();

  const checkoutData = JSON.parse(localStorage.getItem("checkoutData") || "{}");

  const [shipping, setShipping] = useState(checkoutData.shipping || "");
  const [formData, setFormData] = useState({
    name: checkoutData.name || "",
    lastname: checkoutData.lastname || "",
    phone: checkoutData.phone || "",
    dni: checkoutData.dni || "",
    street: checkoutData.street || "",
    number: checkoutData.number || "",
    department: checkoutData.department || "",
    description: checkoutData.description || "",
    city: checkoutData.city || "",
    postalCode: checkoutData.postalCode || "",
    province: checkoutData.province || "",
  });

  const [shippingOptions, setShippingOptions] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (token) fetchCart();
    if (formData.postalCode) fetchShippingOptions(formData.postalCode);
  }, [token]);

  const fetchShippingOptions = async (cp) => {
    if (!cp.match(/^\d{4}$/)) {
      setError("Código postal inválido.");
      setShippingOptions([]);
      return;
    }
    try {
      let res;
      try {
        res = await axios.post(
          "https://localhost:7247/api/shipping/calculate",
          { postalCode: cp },
          { headers: { "Content-Type": "application/json" } }
        );
      } catch {
        res = await axios.get(
          `https://localhost:7247/api/shipping/calculate/${cp}`
        );
      }

      const data = Array.isArray(res.data) ? res.data : [res.data];
      if (data.length > 0) {
        setShippingOptions(data);
        setShipping(data[0].name); // seteo el primero por defecto
        setError("");
      } else {
        setShippingOptions([]);
        setShipping("");
        setError("No hay opciones de envío para este código postal.");
      }
    } catch (err) {
      console.error(err);
      setError("Error al consultar métodos de envío.");
      setShippingOptions([]);
      setShipping("");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === "postalCode") {
      setError("");
    }
  };

  const handleContinue = () => {
    if (!shipping) {
      alert("Por favor selecciona un método de envío");
      return;
    }

    const prevData = JSON.parse(localStorage.getItem("checkoutData") || "{}");
    const selectedOption = shippingOptions.find((opt) => opt.name === shipping);

    // 🔹 Guardar en checkoutData
    localStorage.setItem(
      "checkoutData",
      JSON.stringify({
        ...prevData,
        ...formData,
        shipping,
        shippingOption: selectedOption || null,
      })
    );

    // 🔹 Guardar también en shippingData para el sidebar
    localStorage.setItem(
      "shippingData",
      JSON.stringify({
        postalCode: formData.postalCode,
        shippingOption: selectedOption || null,
      })
    );

    navigate("/checkout/paso-3");
  };

  if (cartLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500 text-lg">Cargando carrito...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <CheckoutProgress step={2} />
      <h2 className="text-3xl font-bold text-center mb-6">Método de envío</h2>

      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-[1fr_350px] gap-8">
        {/* IZQUIERDA */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h3 className="text-xl font-bold mb-4">Elegí tu método de envío</h3>

          {/* Código Postal */}
          <div className="mb-4">
            <input
              type="text"
              name="postalCode"
              value={formData.postalCode}
              onChange={handleChange}
              onBlur={() => fetchShippingOptions(formData.postalCode)}
              placeholder="Ingresá tu código postal"
              className="w-full p-3 border rounded-lg"
            />
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </div>

          {/* Opciones dinámicas */}
          {shippingOptions.length > 0 && (
            <div className="space-y-4 mb-6">
              {shippingOptions.map((option, idx) => (
                <label
                  key={idx}
                  className={`block border rounded-xl p-4 cursor-pointer shadow-sm transition-all ${
                    shipping === option.name
                      ? "border-green-600 bg-green-50"
                      : "border-gray-200 bg-white hover:shadow-md"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="shipping"
                      value={option.name}
                      checked={shipping === option.name}
                      onChange={(e) => setShipping(e.target.value)}
                      className="mt-1 w-5 h-5 text-green-600 focus:ring-green-500"
                    />
                    <div>
                      <p className="font-semibold text-lg">{option.name}</p>
                      <p className="text-gray-500 text-sm">
                        {option.description}
                      </p>
                      <p className="font-bold text-gray-900">
                        {option.cost === 0
                          ? "Gratis"
                          : `$${option.cost.toLocaleString("es-AR")}`}
                      </p>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          )}

          {/* Formulario cliente */}
          {shipping && (
            <>
              <h3 className="text-xl font-bold mt-8 mb-4">Datos del cliente</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Nombre"
                  className="w-full p-3 border rounded-lg"
                />
                <input
                  type="text"
                  name="lastname"
                  value={formData.lastname}
                  onChange={handleChange}
                  placeholder="Apellido"
                  className="w-full p-3 border rounded-lg"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Teléfono"
                  className="w-full p-3 border rounded-lg"
                />
                <input
                  type="text"
                  name="dni"
                  value={formData.dni}
                  onChange={handleChange}
                  placeholder="DNI / CUIL / CUIT"
                  className="w-full p-3 border rounded-lg"
                />
              </div>

              <h3 className="text-xl font-bold mt-8 mb-4">
                Datos del domicilio
              </h3>
              <input
                type="text"
                name="street"
                value={formData.street}
                onChange={handleChange}
                placeholder="Calle"
                className="w-full p-3 border rounded-lg mb-4"
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="text"
                  name="number"
                  value={formData.number}
                  onChange={handleChange}
                  placeholder="Número (opcional)"
                  className="w-full p-3 border rounded-lg"
                />
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  placeholder="Departamento (opcional)"
                  className="w-full p-3 border rounded-lg"
                />
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Descripción (opcional)"
                  className="w-full p-3 border rounded-lg"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Ciudad"
                  className="w-full p-3 border rounded-lg"
                />
                <input
                  type="text"
                  name="province"
                  value={formData.province}
                  onChange={handleChange}
                  placeholder="Provincia"
                  className="w-full p-3 border rounded-lg"
                />
              </div>
            </>
          )}
        </div>

        {/* DERECHA */}
        <div className="bg-white p-6 rounded-xl shadow-md h-fit">
          <h3 className="text-xl font-bold mb-4">Resumen del pedido</h3>

          {cart?.items?.length > 0 ? (
            cart.items.map((item) => (
              <div
                key={item.productId}
                className="flex justify-between border-b pb-2 mb-2 text-lg"
              >
                <span>
                  {item.productName} x {item.quantity}
                </span>
                <span>${item.subtotal}</span>
              </div>
            ))
          ) : (
            <p className="text-gray-500">El carrito está vacío</p>
          )}

          <h4 className="mt-4 text-2xl font-bold">
            Total: ${cart?.total ?? 0}
          </h4>

          {shipping && (
            <button
              onClick={handleContinue}
              className="w-full mt-6 py-3 bg-green-600 text-white rounded-xl text-lg font-semibold hover:bg-green-700 shadow-md"
            >
              Continuar al pago
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
