const pasos = [
  {
    titulo: "Elegí tu producto",
    descripcion:
      "Seleccioná el o los relojes que más te gusten y agregalos al carrito.",
  },
  {
    titulo: "Revisá tu pedido",
    descripcion:
      "Chequeá que la cantidad, color y productos sean correctos. Luego hacé clic en “Procesar pedido”.",
  },
  {
    titulo: "Elegí la opción de entrega",
    descripcion:
      "Ingresá tu código postal para ver las opciones disponibles y seleccioná la que prefieras.",
  },
  {
    titulo: "Completá tu compra",
    descripcion:
      "Hacé clic en “Iniciar compra”, elegí el método de pago y completá tus datos personales.",
  },
  {
    titulo: "Confirmación",
    descripcion:
      "Vas a recibir un email con la confirmación de la compra. Cuando se acredite el pago, coordinaremos la entrega.",
  },
  {
    titulo: "Seguimiento del pedido",
    descripcion: (
      <>
        Te enviaremos un código de seguimiento para rastrear tu paquete en{" "}
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
];

const ComoComprar = () => {
  return (
    <div className=" min-h-screen p-6 ">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold font-mono text-center mb-12 text-gray-800">
          ¿Cómo hago mi compra?
        </h1>

        <div className="grid md:grid-cols-2 gap-8">
          {pasos.map((paso, index) => (
            <div
              key={index}
              className="border border-gray-200 p-6 rounded-xl shadow-sm bg-white transition-all duration-300 hover:shadow-lg hover:border-gray-300 hover:bg-gray-50"
            >
              <div className="text-5xl font-bold text-gray-300 mb-4">
                {index + 1}
              </div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                {paso.titulo}
              </h2>
              <p className="text-gray-600 text-sm">{paso.descripcion}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 bg-yellow-100 border-l-4 border-yellow-400 p-6 rounded">
          <h3 className="text-lg font-semibold mb-2 text-gray-800">
            A tener en cuenta:
          </h3>
          <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
            <li>
              Luego de realizar la compra, comunicate por Instagram detallando
              tu nombre, apellido y número de orden.
            </li>
            <li>
              Si pagaste por transferencia bancaria, recordá enviar el
              comprobante de pago.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ComoComprar;
