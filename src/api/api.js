// src/api/index.js
import axios from "axios";

const api = axios.create({
  baseURL: "https://localhost:7247/api", // Cambia si tu backend tiene otra URL base
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
