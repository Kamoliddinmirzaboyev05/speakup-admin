import axios from "axios";

// API base URL comes from VITE_API_URL (.env / Vercel env). Falls back to the
// local backend for dev when unset. No hardcoded production URL here.
const _env = (import.meta as unknown as { env: Record<string, string> }).env;
// Strip trailing slash(es) so axios baseURL + "/api/..." never doubles up.
const BASE_URL = (_env?.VITE_API_URL || "http://localhost:8000").replace(/\/+$/, "");

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 10_000,
});

apiClient.interceptors.request.use((config) => {
  const raw = localStorage.getItem("speakup-admin-auth");
  if (raw) {
    try {
      const state = JSON.parse(raw);
      const token = state?.state?.token;
      if (token) config.headers.Authorization = `Bearer ${token}`;
    } catch {}
  }
  return config;
});

apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    const url: string = err.config?.url ?? "";
    const isLogin = url.includes("/admin/auth/login");
    if (err.response?.status === 401 && !isLogin) {
      localStorage.removeItem("speakup-admin-auth");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

// Typed helpers
export const api = {
  get: <T>(url: string, params?: object) =>
    apiClient.get<T>(url, { params }).then((r) => r.data),
  post: <T>(url: string, data?: object) =>
    apiClient.post<T>(url, data).then((r) => r.data),
  put: <T>(url: string, data?: object) =>
    apiClient.put<T>(url, data).then((r) => r.data),
  patch: <T>(url: string, data?: object) =>
    apiClient.patch<T>(url, data).then((r) => r.data),
  delete: <T>(url: string) =>
    apiClient.delete<T>(url).then((r) => r.data),
};
