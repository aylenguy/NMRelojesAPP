export default function CheckoutProgress({ step }) {
  return (
    <div className="flex items-center justify-center gap-4 my-6">
      <div
        className={`flex-1 h-2 rounded-full ${
          step >= 1 ? "bg-blue-600" : "bg-gray-300"
        }`}
      />
      <span className="font-bold">Paso {step} de 2</span>
      <div
        className={`flex-1 h-2 rounded-full ${
          step >= 2 ? "bg-blue-600" : "bg-gray-300"
        }`}
      />
    </div>
  );
}
