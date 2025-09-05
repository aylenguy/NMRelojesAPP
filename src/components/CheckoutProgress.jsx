export default function CheckoutProgress({ step }) {
  const steps = [{ number: 1 }, { number: 2 }, { number: 3 }];

  return (
    <div className="flex flex-col gap-2 my-6">
      {/* Barra con círculos numerados */}
      <div className="relative flex items-center justify-between">
        {/* Barra de fondo */}
        <div className="absolute top-3 w-full h-1 bg-gray-300 rounded-full"></div>

        {/* Barra progresiva */}
        <div
          className="absolute top-3 h-1 bg-[#005f73] rounded-full transition-all duration-300"
          style={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}
        ></div>

        {/* Círculos numerados */}
        {steps.map((s, idx) => (
          <div
            key={s.number}
            className="relative flex flex-col items-center z-10"
          >
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full border-2 font-bold transition-all duration-300
                ${
                  step >= s.number
                    ? "bg-[#005f73] border-[#005f73] text-white"
                    : "bg-white border-gray-300 text-gray-500"
                }`}
            >
              {s.number}
            </div>
            <span className="text-xs mt-1 text-center">{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
