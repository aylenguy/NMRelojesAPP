// src/components/GlobalSpinner.jsx
import { useLoader } from "../context/LoaderContext";

export default function GlobalSpinner() {
  const { isLoading } = useLoader();

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white/40 backdrop-blur-sm z-[9999]">
      <div
        className="w-20 h-20 rounded-full border-4 border-t-transparent animate-spin shadow-lg"
        style={{
          borderTopColor: "transparent",
          borderRight: "4px solid white",
          borderBottom: "4px solid #f0f0f0",
          borderLeft: "4px solid #e0e0e0",
          background: "conic-gradient(from 0deg, white, #f9f9f9, #e6e6e6)",
          WebkitMask:
            "radial-gradient(farthest-side, transparent calc(100% - 4px), black calc(100% - 4px))",
          mask: "radial-gradient(farthest-side, transparent calc(100% - 4px), black calc(100% - 4px))",
        }}
      ></div>
    </div>
  );
}
