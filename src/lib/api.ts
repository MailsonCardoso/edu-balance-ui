import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://api5.platformx.com.br/api",
  headers: { "Content-Type": "application/json" },
});

export default api;
