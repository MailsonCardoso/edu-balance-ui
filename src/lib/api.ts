import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://api5.platformx.com.br/api",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const url = config.url ?? "";
  const method = config.method ?? "";
  const isPublic =
    url === "/associado/login" ||
    (url === "/associado" && method === "post");
  if (!isPublic) {
    const token = localStorage.getItem("edu_token") || localStorage.getItem("associado_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }
  return config;
});

export default api;
