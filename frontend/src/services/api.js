/**
 * API base URL resolution:
 * - Production (Vercel): set VITE_API_URL=https://cloudpulse-ai.onrender.com
 * - Development: omit VITE_API_URL; Vite proxies /api -> localhost:3001
 *
 * All request paths are relative to /api (e.g. /auth/register -> /api/auth/register).
 */

const trimTrailingSlash = (value) => value.replace(/\/+$/, "");

const resolveApiBase = () => {
  const envUrl = import.meta.env.VITE_API_URL?.trim();
  if (!envUrl) {
    return "/api";
  }

  const normalized = trimTrailingSlash(envUrl);
  if (normalized.endsWith("/api")) {
    return normalized;
  }

  return `${normalized}/api`;
};

const API_BASE = resolveApiBase();

const buildApiUrl = (path) => {
  const suffix = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE}${suffix}`;
};

const getToken = () => localStorage.getItem("cloudpulse_token");

export const api = {
  async request(path, options = {}) {
    const headers = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(buildApiUrl(path), {
      ...options,
      headers,
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const err = new Error(data.message || data.error || "Request failed");
      err.status = res.status;
      err.data = data;
      throw err;
    }

    return data;
  },

  register: (body) => api.request("/auth/register", { method: "POST", body: JSON.stringify(body) }),
  verifyOtp: (body) => api.request("/auth/verify-otp", { method: "POST", body: JSON.stringify(body) }),
  resendOtp: (body) => api.request("/auth/resend-otp", { method: "POST", body: JSON.stringify(body) }),
  login: (body) => api.request("/auth/login", { method: "POST", body: JSON.stringify(body) }),
  me: () => api.request("/auth/me"),

  generateReport: (body) =>
    api.request("/reports/generate", { method: "POST", body: JSON.stringify(body) }),

  reportHistory: () => api.request("/reports/history"),

  reportDownloadUrl: (id) => buildApiUrl(`/reports/${id}/download`),

  deleteReport: (id) => api.request(`/reports/${id}`, { method: "DELETE" }),

  chat: (body) => api.request("/chat", { method: "POST", body: JSON.stringify(body) }),

  getProfile: () => api.request("/profile"),
  updateProfile: (body) => api.request("/profile", { method: "PUT", body: JSON.stringify(body) }),
  changePassword: (body) =>
    api.request("/change-password", { method: "PUT", body: JSON.stringify(body) }),
};

export const getApiBaseUrl = () => API_BASE;
export const getApiUrl = buildApiUrl;

export const setAuthToken = (token) => {
  if (token) localStorage.setItem("cloudpulse_token", token);
  else localStorage.removeItem("cloudpulse_token");
};

export const getAuthToken = getToken;
