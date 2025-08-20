export async function addVenta(venta, token) {
  const res = await fetch("http://localhost:7247/api/Venta/AddVenta", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(venta),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error?.error || "Error al crear la venta");
  }

  return await res.json();
}
