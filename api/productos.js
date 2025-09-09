// api/productos.js
export default function handler(req, res) {
  if (req.method === "GET") {
    const productos = [
      { id: 1, nombre: "Reloj Clásico", precio: 100 },
      { id: 2, nombre: "Reloj Deportivo", precio: 150 },
      { id: 3, nombre: "Reloj Inteligente", precio: 250 },
    ];
    res.status(200).json(productos);
  } else {
    res.status(405).json({ error: "Método no permitido" });
  }
}
