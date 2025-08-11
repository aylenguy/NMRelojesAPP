// src/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "https://localhost:7247/api", // Cambia por tu backend real
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
