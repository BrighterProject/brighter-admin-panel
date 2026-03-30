import axios from "axios";

export const api = axios.create({
  baseURL: window.location.origin + "/api",
  withCredentials: true, // send httpOnly access_token cookie automatically
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url: string = error?.config?.url ?? "";
    // Don't redirect on @me — ProtectedRoute handles unauthenticated state
    if (error?.response?.status === 401 && !url.includes("/@me/")) {
      const basename = import.meta.env.VITE_BASENAME || "";
      if (!window.location.pathname.startsWith(basename + "/auth/")) {
        window.location.href =
          "/bg/auth/login?redirect=" + encodeURIComponent(basename + "/");
      }
    }
    return Promise.reject(error);
  },
);
