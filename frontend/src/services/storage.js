const KEYS = {
  theme: "cloudpulse_theme",
  user: "cloudpulse_user",
  provider: "cloudpulse_provider",
  metrics: "cloudpulse_metrics",
};

export const storage = {
  getTheme: () => localStorage.getItem(KEYS.theme) || "light",
  setTheme: (theme) => localStorage.setItem(KEYS.theme, theme),

  getUser: () => {
    try {
      const data = localStorage.getItem(KEYS.user);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },
  setUser: (user) => localStorage.setItem(KEYS.user, JSON.stringify(user)),
  clearUser: () => localStorage.removeItem(KEYS.user),

  getProvider: () => sessionStorage.getItem(KEYS.provider),
  setProvider: (provider) => sessionStorage.setItem(KEYS.provider, provider),
  clearProvider: () => sessionStorage.removeItem(KEYS.provider),

  getMetrics: () => {
    try {
      const data = localStorage.getItem(KEYS.metrics);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },
  setMetrics: (metrics) => localStorage.setItem(KEYS.metrics, JSON.stringify(metrics)),
};
