import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { LoaderProvider } from "./context/LoaderContext";
import { Toaster } from "sonner"; // 👈 sonner
import "@fontsource/poppins/400.css"; // peso normal
import "@fontsource/poppins/500.css"; // medio
import "@fontsource/poppins/700.css"; // negrita

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <LoaderProvider>
            <App />
            <Toaster position="top-right" richColors /> {/* 👈 sonner */}
          </LoaderProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
