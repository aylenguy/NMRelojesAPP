// 🔹 Crear venta normal
export async function addVenta(venta, token = null) {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/Venta/AddVenta`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}), // solo agrega el token si existe
    },
    body: JSON.stringify(venta), // ✅ corregido: antes estaba "ventaData"
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error?.error || "Error al crear la venta");
  }

  return await res.json();
}

// 🔹 Crear venta desde carrito
export async function createFromCart(dto, token) {
  const res = await fetch(
    `${import.meta.env.VITE_API_URL}/Venta/CreateFromCart`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // siempre requiere token
      },
      body: JSON.stringify(dto),
    }
  );

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error?.error || "Error al crear la venta desde el carrito");
  }

  return await res.json(); // ✅ corregido: antes cortaba con "return res;"
}
