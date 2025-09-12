import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CheckoutProgress from "../components/CheckoutProgress";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

export default function CheckoutStep2() {
  const { cart, fetchCart, loading: cartLoading } = useCart();
  const { token, user } = useAuth();
  const navigate = useNavigate();

  const savedCheckout = JSON.parse(localStorage.getItem("checkoutData")) || {};
  const guestCart = JSON.parse(localStorage.getItem("guestCart")) || {
    items: [],
    total: 0,
  };
  const savedShipping = JSON.parse(localStorage.getItem("shippingData")) || {};
  const couponDiscount = savedCheckout.couponDiscount || 0;

  const [shipping, setShipping] = useState(
    savedShipping?.shippingOption?.name || savedCheckout.shipping || ""
  );
  const [formData, setFormData] = useState({
    name: savedCheckout.name || user?.name || "",
    lastname: savedCheckout.lastname || user?.lastname || "",
    email: savedCheckout.customerEmail || user?.email || "",
    phone: savedCheckout.phone || "",
    dni: savedCheckout.dni || "",
    street: savedCheckout.street || user?.street || "",
    number: savedCheckout.number || user?.number || "",
    department: savedCheckout.department || user?.department || "",
    description: savedCheckout.description || "",
    city: savedCheckout.city || user?.city || "",
    postalCode: savedCheckout.postalCode || "",
    province: savedCheckout.province || user?.province || "",
  });

  const [shippingOptions, setShippingOptions] = useState([]);
  const [errors, setErrors] = useState({});
  const [showAll, setShowAll] = useState(false);
  const currentCart = token ? cart : guestCart;

  const API_BASE = import.meta.env.VITE_API_URL.replace("/api", "");

  useEffect(() => {
    if (token) fetchCart();
    if (formData.postalCode) fetchShippingOptions(formData.postalCode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    if (/^\d{4}$/.test(formData.postalCode)) {
      fetchShippingOptions(formData.postalCode);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.postalCode]);

  const fetchShippingOptions = async (cp) => {
    if (!cp.match(/^\d{4}$/)) {
      setErrors((prev) => ({ ...prev, postalCode: "Código postal inválido" }));
      setShippingOptions([]);
      setShipping("");
      return;
    }
    try {
      let res;
      try {
        res = await axios.post(
          `${import.meta.env.VITE_API_URL}/shipping/calculate`,
          { postalCode: cp }
        );
      } catch (err) {
        // Si falla el POST, intento con GET
        res = await axios.get(
          `${import.meta.env.VITE_API_URL}/shipping/calculate/${cp}`
        );
      }

      const data = Array.isArray(res.data) ? res.data : [res.data];
      if (data.length > 0) {
        setShippingOptions(data);

        const previouslySelected =
          savedShipping?.shippingOption &&
          data.find((opt) => opt.name === savedShipping.shippingOption.name);

        setShipping(
          previouslySelected ? previouslySelected.name : data[0].name
        );
        setErrors((prev) => ({ ...prev, postalCode: null }));
      } else {
        setShippingOptions([]);
        setShipping("");
        setErrors((prev) => ({
          ...prev,
          postalCode: "No hay opciones de envío para este código postal",
        }));
      }
    } catch (err) {
      console.error(err);
      setErrors((prev) => ({
        ...prev,
        postalCode: "Error al consultar métodos de envío",
      }));
      setShippingOptions([]);
      setShipping("");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleContinue = () => {
    const newErrors = {};

    if (!shipping)
      newErrors.shipping = "Por favor selecciona un método de envío";
    if (!formData.name) newErrors.name = "El nombre es obligatorio";
    if (!formData.lastname) newErrors.lastname = "El apellido es obligatorio";

    if (!token) {
      if (!formData.email) {
        newErrors.email = "El email es obligatorio";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = "Ingresa un email válido";
      }
    } else if (
      formData.email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
    ) {
      newErrors.email = "Ingresa un email válido";
    }

    if (!formData.phone) {
      newErrors.phone = "El teléfono es obligatorio";
    } else if (!/^\d{6,15}$/.test(formData.phone.replace(/\D/g, ""))) {
      newErrors.phone = "Ingresa un teléfono válido";
    }

    if (!formData.dni) {
      newErrors.dni = "DNI / CUIL / CUIT es obligatorio";
    } else {
      const dniClean = formData.dni.replace(/\D/g, "");
      if (dniClean.length !== 8 && dniClean.length !== 11) {
        newErrors.dni = "Por favor ingresa un DNI o CUIT/CUIL válido";
      }
    }

    if (!formData.street) newErrors.street = "La calle es obligatoria";
    if (!formData.number) newErrors.number = "El número es obligatorio";
    if (!formData.city) newErrors.city = "La ciudad es obligatoria";
    if (!formData.province) newErrors.province = "La provincia es obligatoria";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      const firstErrorField = document.querySelector("[data-error='true']");
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    setErrors({});
    const selectedOption =
      shippingOptions.find((opt) => opt.name === shipping) || null;

    localStorage.setItem(
      "checkoutData",
      JSON.stringify({
        ...savedCheckout,
        ...formData,
        customerName: formData.name,
        customerLastname: formData.lastname,
        customerEmail: token ? formData.email || user?.email : formData.email,
        shippingOption: selectedOption,
        couponDiscount,
      })
    );

    localStorage.setItem(
      "shippingData",
      JSON.stringify({
        postalCode: formData.postalCode,
        shippingOption: selectedOption,
      })
    );

    navigate("/checkout/paso-3");
  };

  if (token && cartLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500 text-lg">Cargando carrito...</p>
      </div>
    );
  }

  const getItemImagen = (item) => {
    if (!item) return `${API_BASE}/uploads/placeholder.png`;
    if (item.imageUrl?.startsWith("http")) return item.imageUrl;
    const img =
      item.image || item.Image || item.imageUrl || item.imagen || item.Imagen;
    return img
      ? `${API_BASE}/uploads/${img}`
      : `${API_BASE}/uploads/placeholder.png`;
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
    getItemCantidad(item) * item.unitPrice ||
    0;

  const getItemFullName = (item) => {
    const brand = item.brand || item.Brand || item.Marca || "";
    const name = item.productName || item.name || "Producto";
    return brand ? `${brand} ${name}` : name;
  };

  const totalConDescuento = (currentCart?.total || 0) - couponDiscount;

  return (
    <div className="min-h-screen py-8">
      <div className="py-4">
        <CheckoutProgress step={2} />
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-8">
          {/* IZQUIERDA */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleContinue();
            }}
            className="bg-white p-12 rounded-2xl shadow-sm border-2 border-gray-300 transition-all duration-300 hover:shadow-lg hover:bg-gray-50"
          >
            <h2 className="text-2xl font-bold mb-3">Método de envío</h2>
            {/* Código postal */}
            <div className="mb-1">
              <label className="block text-base font-semibold text-gray-800 mb-1">
                Código postal
              </label>
              <input
                type="text"
                name="postalCode"
                value={formData.postalCode}
                onChange={handleChange}
                onBlur={() => {
                  if (/^\d{4}$/.test(formData.postalCode)) {
                    fetchShippingOptions(formData.postalCode);
                  }
                }}
                placeholder="Ingrese su código postal"
                data-error={!!errors.postalCode}
                className={`w-full p-2 text-sm border rounded-xl focus:outline-none focus:ring-2 ${
                  errors.postalCode
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-black"
                }`}
              />
              {errors.postalCode && (
                <p className="text-red-500 text-sm mt-1">{errors.postalCode}</p>
              )}
            </div>

            {/* Opciones de envío */}
            <div className="mb-4">
              <div className="space-y-4">
                {shippingOptions.map((option, idx) => (
                  <label
                    key={idx}
                    className={`flex items-center p-2 border rounded-xl cursor-pointer ${
                      shipping === option.name
                        ? "border-black bg-gray-50"
                        : "border-gray-300 bg-white"
                    }`}
                  >
                    <input
                      type="radio"
                      name="shipping"
                      value={option.name}
                      checked={shipping === option.name}
                      onChange={(e) => setShipping(e.target.value)}
                      className="mr-3"
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
              {errors.shipping && (
                <p className="text-red-500 text-sm mt-1">{errors.shipping}</p>
              )}
            </div>

            {/* Datos del cliente */}
            {shipping && (
              <>
                <h2 className="text-xl font-bold mb-2">Datos del cliente</h2>
                {/* Nombre y apellido */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                  <div>
                    <label className="block text-base font-semibold mb-1">
                      Nombre
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Ingresa tu nombre"
                      data-error={!!errors.name}
                      className={`w-full p-2 text-sm border rounded-xl focus:outline-none focus:ring-2 ${
                        errors.name
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-300 focus:ring-black"
                      }`}
                    />
                    {errors.name && (
                      <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-base font-semibold mb-1">
                      Apellido
                    </label>
                    <input
                      type="text"
                      name="lastname"
                      value={formData.lastname}
                      onChange={handleChange}
                      placeholder="Ingresa tu apellido"
                      data-error={!!errors.lastname}
                      className={`w-full p-2 text-sm border rounded-xl focus:outline-none focus:ring-2 ${
                        errors.lastname
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-300 focus:ring-black"
                      }`}
                    />
                    {errors.lastname && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.lastname}
                      </p>
                    )}
                  </div>
                </div>

                {/* Email (solo invitado) */}
                {!token && (
                  <div className="mb-2">
                    <label className="block text-base font-semibold mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Ingresa tu email"
                      data-error={!!errors.email}
                      className={`w-full p-2 text-sm border rounded-xl focus:outline-none focus:ring-2 ${
                        errors.email
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-300 focus:ring-black"
                      }`}
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.email}
                      </p>
                    )}
                  </div>
                )}

                {/* Teléfono y DNI */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                  <div>
                    <label className="block text-base font-semibold mb-1">
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Ej: 1122334455"
                      data-error={!!errors.phone}
                      className={`w-full p-2 text-sm border rounded-xl focus:outline-none focus:ring-2 ${
                        errors.phone
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-300 focus:ring-black"
                      }`}
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.phone}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-base font-semibold mb-1">
                      DNI / CUIL / CUIT
                    </label>
                    <input
                      type="text"
                      name="dni"
                      value={formData.dni}
                      onChange={handleChange}
                      placeholder="Ingresa tu DNI o CUIL"
                      data-error={!!errors.dni}
                      className={`w-full p-2 text-sm border rounded-xl focus:outline-none focus:ring-2 ${
                        errors.dni
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-300 focus:ring-black"
                      }`}
                    />
                    {errors.dni && (
                      <p className="text-red-500 text-sm mt-1">{errors.dni}</p>
                    )}
                  </div>
                </div>

                {/* Domicilio */}
                <h2 className="text-xl font-bold mb-2">Domicilio</h2>
                <div className="mb-2">
                  <label className="block text-base font-semibold mb-1">
                    Calle
                  </label>
                  <input
                    type="text"
                    name="street"
                    value={formData.street}
                    onChange={handleChange}
                    placeholder="Ingresa tu calle"
                    data-error={!!errors.street}
                    className={`w-full p-2 text-sm border rounded-xl focus:outline-none focus:ring-2 ${
                      errors.street
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:ring-black"
                    }`}
                  />
                  {errors.street && (
                    <p className="text-red-500 text-sm mt-1">{errors.street}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-3">
                  <div>
                    <label className="block text-base font-semibold mb-1">
                      Número
                    </label>
                    <input
                      type="text"
                      name="number"
                      value={formData.number}
                      onChange={handleChange}
                      placeholder="Número"
                      data-error={!!errors.number}
                      className={`w-full p-2 text-sm border rounded-xl focus:outline-none focus:ring-2 ${
                        errors.number
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-300 focus:ring-black"
                      }`}
                    />
                    {errors.number && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.number}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-base font-semibold mb-1">
                      Departamento (opcional)
                    </label>
                    <input
                      type="text"
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      placeholder="Ej: 2B"
                      className="w-full p-2 text-sm border border-gray-300 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-base font-semibold mb-1">
                      Descripción (opcional)
                    </label>
                    <input
                      type="text"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Casa, lote, etc."
                      className="w-full p-2 text-sm border border-gray-300 rounded-xl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                  <div>
                    <label className="block text-base font-semibold mb-1">
                      Ciudad
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="Ciudad"
                      data-error={!!errors.city}
                      className={`w-full p-2 text-sm border rounded-xl focus:outline-none focus:ring-2 ${
                        errors.city
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-300 focus:ring-black"
                      }`}
                    />
                    {errors.city && (
                      <p className="text-red-500 text-sm mt-1">{errors.city}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-base font-semibold mb-1">
                      Provincia
                    </label>
                    <input
                      type="text"
                      name="province"
                      value={formData.province}
                      onChange={handleChange}
                      placeholder="Provincia"
                      data-error={!!errors.province}
                      className={`w-full p-2 text-sm border rounded-xl focus:outline-none focus:ring-2 ${
                        errors.province
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-300 focus:ring-black"
                      }`}
                    />
                    {errors.province && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.province}
                      </p>
                    )}
                  </div>
                </div>
              </>
            )}

            <div className="flex justify-between mt-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="text-base text-gray-600 hover:underline"
              >
                Volver a contacto
              </button>

              <button
                type="submit"
                disabled={cartLoading}
                className="py-2 px-7 bg-black text-white rounded-2xl hover:bg-gray-800 shadow transition-all text-sm"
              >
                Continuar al pago
              </button>
            </div>
          </form>

          {/* DERECHA */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border-2 border-gray-300 transition-all duration-300 hover:shadow-lg hover:bg-gray-50 h-fit">
            <h2 className="text-xl font-bold mb-6">Resumen del pedido</h2>
            <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
              {currentCart?.items?.length > 0 ? (
                (showAll
                  ? currentCart.items
                  : currentCart.items.slice(0, 3)
                ).map((item) => (
                  <div
                    key={item.productId || item.id}
                    className="flex justify-between border-b pb-1 text-gray-700 text-sm"
                  >
                    <img
                      src={getItemImagen(item)}
                      alt={getItemNombre(item)}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <span className="font-medium">
                      {getItemFullName(item)} x {getItemCantidad(item)}
                    </span>
                    <span className="font-semibold">
                      ${Number(getItemSubtotal(item)).toLocaleString("es-AR")}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 text-sm">El carrito está vacío</p>
              )}
            </div>

            {currentCart?.items?.length > 3 && (
              <button
                onClick={() => setShowAll(!showAll)}
                className="text-sm text-green-600 hover:underline mt-2"
              >
                {showAll ? "Ver menos" : "Ver más"}
              </button>
            )}

            {couponDiscount > 0 && (
              <div className="flex justify-between text-sm text-[#006d77] mt-2">
                <span>Descuento por cupón</span>
                <span>- ${couponDiscount.toLocaleString("es-AR")}</span>
              </div>
            )}

            <h3 className="mt-4 text-xl font-bold text-gray-900">
              Total: ${totalConDescuento.toLocaleString("es-AR")}
            </h3>
          </div>
        </div>
      </div>
    </div>
  );
}
