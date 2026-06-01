const API_BASE = import.meta.env.VITE_API_URL || "/api";

const getToken = () => localStorage.getItem("cloudpulse_token");

export const api = {
  async request(path, options = {}) {
    const headers = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}${path}`, {
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

  reportDownloadUrl: (id) => `${API_BASE}/reports/${id}/download`,

  deleteReport: (id) => api.request(`/reports/${id}`, { method: "DELETE" }),

  chat: (body) => api.request("/chat", { method: "POST", body: JSON.stringify(body) }),

  getProfile: () => api.request("/profile"),
  updateProfile: (body) => api.request("/profile", { method: "PUT", body: JSON.stringify(body) }),
  changePassword: (body) =>
    api.request("/change-password", { method: "PUT", body: JSON.stringify(body) }),
};

export const setAuthToken = (token) => {
  if (token) localStorage.setItem("cloudpulse_token", token);
  else localStorage.removeItem("cloudpulse_token");
};

export const getAuthToken = getToken;
