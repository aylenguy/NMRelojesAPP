let carrito = []; // Almacenamiento simple en memoria (reinicia al deployar)

export default function handler(req, res) {
  if (req.method === "GET") {
    res.status(200).json(carrito);
  } else if (req.method === "POST") {
    const item = req.body;
    carrito.push(item);
    res.status(200).json({ mensaje: "Item agregado al carrito", carrito });
  } else if (req.method === "DELETE") {
    const { id } = req.body;
    carrito = carrito.filter((item) => item.id !== id);
    res.status(200).json({ mensaje: "Item eliminado", carrito });
  } else {
    res.status(405).json({ error: "Método no permitido" });
  }
}
