export async function addVenta(venta, token) {
  const res = await fetch("http://localhost:5127/api/Venta", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(venta),
  });
  if (!res.ok) throw new Error("Error al crear la venta");
  return await res.json();
}
