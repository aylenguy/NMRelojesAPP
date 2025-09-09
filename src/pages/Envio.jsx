const preguntasEnvio = [
  {
    titulo: "¿Hacen envíos a todo el país?",
    descripcion:
      "¡Sí! Realizamos envíos a todas las provincias y localidades del país a través de Correo Argentino.",
  },
  {
    titulo: "¿Cómo hago el seguimiento de mi orden?",
    descripcion: (
      <>
        Te enviaremos un código de seguimiento por correo electrónico ni bien se
        despache tu pedido. Podés rastrearlo desde el sitio oficial de{" "}
        <a
          href="https://www.correoargentino.com.ar/formularios/e-commerce"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline hover:text-blue-800"
        >
          Correo Argentino
        </a>
        .
      </>
    ),
  },
  {
    titulo: "¿Hacen envíos en Rosario?",
    descripcion: "¡Sí! Coordinamos entregas con 24 horas de anticipación.",
  },
];
const Envio = () => {
  return (
    <div className=" min-h-screen p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold font-poppins text-center mb-12 text-gray-800">
          Información sobre Envíos
        </h1>

        <div className="grid gap-8">
          {preguntasEnvio.map((item, index) => (
            <div
              key={index}
              className="border border-gray-200 p-6 rounded-xl shadow-sm bg-white transition-all duration-300 hover:shadow-lg hover:border-gray-300 hover:bg-gray-50"
            >
              <div className="text-5xl font-bold text-gray-300 mb-4">
                {index + 1}
              </div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                {item.titulo}
              </h2>
              <p className="text-gray-600 text-sm">{item.descripcion}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Envio;
