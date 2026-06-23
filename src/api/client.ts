import axios from "axios";

// Production backend lives on the DigitalOcean droplet behind Caddy and serves
// the admin API under /api/admin/*. The domain is stable, so it's pinned for
// prod builds: a stale Vercel env var (an old `*.trycloudflare.com` dev tunnel)
// kept overriding VITE_API_URL and pointing the panel at a dead host
// (ERR_NAME_NOT_RESOLVED on every request). In prod we ignore VITE_API_URL and
// always hit the live API; dev still honors VITE_API_URL for local backends.
const PROD_API = "https://speakupapi.webportfolio.uz";
const _meta = import.meta as unknown as { env: Record<string, string> & { PROD?: boolean } };
const _env = _meta.env;
const _base = _env?.PROD ? PROD_API : (_env?.VITE_API_URL || "http://localhost:8000");
// Strip trailing slash(es) so axios baseURL + "/api/..." never doubles up.
const BASE_URL = _base.replace(/\/+$/, "");

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
