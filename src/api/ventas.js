let ventas = []; // Almacenamiento simple en memoria

export default function handler(req, res) {
  if (req.method === "POST") {
    const venta = req.body; // datos de tu front
    ventas.push({ id: ventas.length + 1, ...venta, fecha: new Date() });
    console.log("Nueva venta:", venta);
    res.status(200).json({ mensaje: "Venta registrada con éxito", venta });
  } else if (req.method === "GET") {
    res.status(200).json(ventas);
  } else {
    res.status(405).json({ error: "Método no permitido" });
  }
}
