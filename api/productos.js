// api/productos.js
export default function handler(req, res) {
  if (req.method === "GET") {
    const productos = [
      {
        id: 1,
        nombre: "Reloj Clásico",
        precio: 100,
        marca: "Rolex",
        color: "Negro",
        stock: 5,
        imagen: "https://via.placeholder.com/250x250?text=Reloj+Clásico",
      },
      {
        id: 2,
        nombre: "Reloj Deportivo",
        precio: 150,
        marca: "Casio",
        color: "Azul",
        stock: 3,
        imagen: "https://via.placeholder.com/250x250?text=Reloj+Deportivo",
      },
      {
        id: 3,
        nombre: "Reloj Inteligente",
        precio: 250,
        marca: "Apple",
        color: "Blanco",
        stock: 7,
        imagen: "https://via.placeholder.com/250x250?text=Reloj+Inteligente",
      },
      {
        id: 4,
        nombre: "Reloj Elegante",
        precio: 200,
        marca: "Fossil",
        color: "Marrón",
        stock: 4,
        imagen: "https://via.placeholder.com/250x250?text=Reloj+Elegante",
      },
      {
        id: 5,
        nombre: "Reloj Minimalista",
        precio: 120,
        marca: "Daniel Wellington",
        color: "Negro",
        stock: 6,
        imagen: "https://via.placeholder.com/250x250?text=Reloj+Minimalista",
      },
      {
        id: 6,
        nombre: "Reloj Retro",
        precio: 90,
        marca: "Seiko",
        color: "Dorado",
        stock: 2,
        imagen: "https://via.placeholder.com/250x250?text=Reloj+Retro",
      },
      {
        id: 7,
        nombre: "Reloj Inteligente Pro",
        precio: 300,
        marca: "Samsung",
        color: "Negro",
        stock: 5,
        imagen:
          "https://via.placeholder.com/250x250?text=Reloj+Inteligente+Pro",
      },
      {
        id: 8,
        nombre: "Reloj Acero",
        precio: 180,
        marca: "Citizen",
        color: "Plateado",
        stock: 3,
        imagen: "https://via.placeholder.com/250x250?text=Reloj+Acero",
      },
    ];

    res.status(200).json(productos);
  } else {
    res.status(405).json({ error: "Método no permitido" });
  }
}
