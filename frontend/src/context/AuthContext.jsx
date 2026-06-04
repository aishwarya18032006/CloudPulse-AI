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
    return api.register({
      fullName,
      email,
      password,
    });
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await api.login({ email, password });
    setAuthToken(data.token);
    const userData = {
      id: data.user.id,
      email: data.user.email,
      name: data.user.name,
      verified: data.user.verified,
      picture: data.user.picture,
    };
    storage.setUser(userData);
    setUser(userData);
    return { success: true };
  }, []);

  const googleLogin = useCallback(async (token, name, email, picture) => {
    const data = await api.googleLogin({ token, name, email, picture });
    setAuthToken(data.token);
    const userData = {
      id: data.user.id,
      email: data.user.email,
      name: data.user.name,
      verified: data.user.verified,
      picture: data.user.picture,
    };
    storage.setUser(userData);
    setUser(userData);
    return { success: true };
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
        googleLogin,
        register,
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
