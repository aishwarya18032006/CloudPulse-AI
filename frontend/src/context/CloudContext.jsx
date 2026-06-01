import { createContext, useContext, useState, useCallback, useEffect, useMemo } from "react";
import { generateMetrics } from "../utils/demoData";
import { storage } from "../services/storage";
import { hasCloudCredentials } from "../utils/cloudCredentials";

const CloudContext = createContext(null);

export const CloudProvider = ({ children }) => {
  const [provider, setProviderState] = useState(() => storage.getProvider() || null);
  const [credentials, setCredentials] = useState(null);
  const [metrics, setMetrics] = useState(() => {
    const saved = storage.getMetrics();
    if (saved) return saved;
    return generateMetrics("demo");
  });

  useEffect(() => {
    const legacy = localStorage.getItem("cloudpulse_provider");
    if (legacy) {
      localStorage.removeItem("cloudpulse_provider");
      if (legacy === "demo" && !storage.getProvider()) {
        storage.setProvider("demo");
        setProviderState("demo");
      }
    }

    const stored = storage.getProvider();
    if (stored && stored !== "demo") {
      storage.clearProvider();
      setProviderState(null);
    }
  }, []);

  const isEnvironmentReady = useMemo(
    () => hasCloudCredentials(provider, credentials),
    [provider, credentials]
  );

  useEffect(() => {
    if (provider) {
      const saved = storage.getMetrics();
      if (!saved || storage.getProvider() !== provider) {
        const m = generateMetrics(provider);
        setMetrics(m);
        storage.setMetrics(m);
      }
    }
  }, [provider]);

  const setProvider = useCallback((p, creds = null) => {
    if (p === "demo") {
      setProviderState("demo");
      setCredentials(null);
      storage.setProvider("demo");
      const m = generateMetrics("demo");
      setMetrics(m);
      storage.setMetrics(m);
      return;
    }

    if (!hasCloudCredentials(p, creds)) return;

    setProviderState(p);
    setCredentials(creds);
    storage.setProvider(p);
    const m = generateMetrics(p);
    setMetrics(m);
    storage.setMetrics(m);
  }, []);

  const clearEnvironment = useCallback(() => {
    setProviderState(null);
    setCredentials(null);
    storage.clearProvider();
  }, []);

  const refreshMetrics = useCallback(() => {
    const m = generateMetrics(provider || "demo");
    setMetrics(m);
    storage.setMetrics(m);
    return m;
  }, [provider]);

  return (
    <CloudContext.Provider
      value={{
        provider,
        credentials,
        metrics,
        setProvider,
        clearEnvironment,
        refreshMetrics,
        isEnvironmentReady,
        providerName:
          provider === "aws"
            ? "AWS"
            : provider === "azure"
              ? "Azure"
              : provider === "gcp"
                ? "Google Cloud"
                : "Demo Mode",
      }}
    >
      {children}
    </CloudContext.Provider>
  );
};

export const useCloud = () => {
  const ctx = useContext(CloudContext);
  if (!ctx) throw new Error("useCloud must be used within CloudProvider");
  return ctx;
};
