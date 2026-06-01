import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { api, setAuthToken, getAuthToken } from "../services/api";
import { storage } from "../services/storage";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => storage.getUser());
  const [loading, setLoading] = useState(!!getAuthToken());

  useEffect(() => {
    const bootstrap = async () => {
      if (!getAuthToken()) {
        setLoading(false);
        return;
      }
      try {
        const { user: u } = await api.me();
        const userData = { id: u.id, email: u.email, name: u.name, verified: u.verified };
        storage.setUser(userData);
        setUser(userData);
      } catch {
        setAuthToken(null);
        storage.clearUser();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    bootstrap();
  }, []);

  const register = useCallback(async (fullName, email, password) => {
    const data = await api.register({
      fullName,
      email,
      password,
    });
    if (data.token && data.user) {
      setAuthToken(data.token);
      const userData = {
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
        verified: data.user.verified,
      };
      storage.setUser(userData);
      setUser(userData);
    }
    return data;
  }, []);

  const verifyOtp = useCallback(async (email, otp) => {
    const data = await api.verifyOtp({ email, otp });
    setAuthToken(data.token);
    const userData = {
      id: data.user.id,
      email: data.user.email,
      name: data.user.name,
      verified: data.user.verified,
    };
    storage.setUser(userData);
    setUser(userData);
    return data;
  }, []);

  const resendOtp = useCallback(async (email) => {
    const data = await api.resendOtp({ email });
    if (data.token && data.user) {
      setAuthToken(data.token);
      const userData = {
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
        verified: data.user.verified,
      };
      storage.setUser(userData);
      setUser(userData);
    }
    return data;
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      const data = await api.login({ email, password });
      setAuthToken(data.token);
      const userData = {
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
        verified: data.user.verified,
      };
      storage.setUser(userData);
      setUser(userData);
      return { success: true };
    } catch (err) {
      if (err.data?.requiresOtp) {
        return { requiresOtp: true, email: err.data.email, error: err.message };
      }
      throw err;
    }
  }, []);

  const logout = useCallback(() => {
    setAuthToken(null);
    storage.clearUser();
    storage.clearProvider();
    localStorage.removeItem("cloudpulse_provider");
    localStorage.removeItem("cloudpulse_metrics");
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user && !!getAuthToken(),
        loading,
        login,
        register,
        verifyOtp,
        resendOtp,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
