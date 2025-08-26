export async function addVenta(venta, token = null) {
  const res = await fetch("https://localhost:7247/api/Venta/AddVenta", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(venta),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error?.error || "Error al crear la venta");
  }

  return await res.json();
}

// 🔹 Ahora recibe el dto y el token
export async function createFromCart(dto, token) {
  const res = await fetch("https://localhost:7247/api/Venta/CreateFromCart", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(dto), // 👈 enviamos todos los datos del dto
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error?.error || "Error al crear la venta desde el carrito");
  }

  return await res.json();
}
