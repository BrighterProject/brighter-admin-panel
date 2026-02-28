import axios from "axios";

export const api = axios.create({ baseURL: window.location.origin + "/api" });
// export const api = axios.create({ baseURL: "/api" });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      localStorage.removeItem("access_token");
      const basename = import.meta.env.VITE_BASENAME || "";
      if (!window.location.pathname.startsWith(basename + "/auth/")) {
        window.location.href = basename + "/auth/sign-in";
      }
    }
    return Promise.reject(error);
  },
);
