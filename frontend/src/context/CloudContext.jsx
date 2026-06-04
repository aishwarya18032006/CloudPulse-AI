import { createContext, useContext, useState, useCallback, useEffect, useMemo } from "react";
import { generateMetrics } from "../utils/demoData";
import { storage } from "../services/storage";
import { hasCloudCredentials } from "../utils/cloudCredentials";
import { persistSimulatorForm, normalizeSimulatorInputs } from "../utils/simulatorInputs";

const CloudContext = createContext(null);

export const CloudProvider = ({ children }) => {
  const [provider, setProviderState] = useState(() => {
    const p = storage.getProvider();
    if (p === "demo") {
      const saved = storage.getMetrics();
      return saved?.fromSimulator ? "demo" : null;
    }
    return p || null;
  });
  const [credentials, setCredentials] = useState(null);
  const [metrics, setMetrics] = useState(() => {
    const saved = storage.getMetrics();
    if (saved?.fromSimulator) return saved;
    return null;
  });

  useEffect(() => {
    const legacy = localStorage.getItem("cloudpulse_provider");
    if (legacy) {
      localStorage.removeItem("cloudpulse_provider");
      if (legacy === "demo" && !storage.getProvider()) {
        storage.clearMetrics();
      }
    }

    const stored = storage.getProvider();
    if (stored && stored !== "demo" && stored !== provider) {
      storage.clearProvider();
      setProviderState(null);
    }
  }, [provider]);

  const isEnvironmentReady = useMemo(
    () => hasCloudCredentials(provider, credentials, metrics),
    [provider, credentials, metrics]
  );

  useEffect(() => {
    if (provider && provider !== "demo") {
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

  const completeDemoSimulator = useCallback((simMetrics) => {
    const inputs = normalizeSimulatorInputs(simMetrics.simulatorInputs || {});
    const enriched = {
      ...simMetrics,
      fromSimulator: true,
      simulatorInputs: inputs,
      vmCount: inputs.vmCount,
      cpu: inputs.cpuUsage,
      memory: inputs.memoryUsage,
      storageUsage: inputs.storageUsage,
      networkTrafficGb: inputs.networkTrafficGb,
      monthlyCost: inputs.monthlyCost,
      energyKwh: inputs.energyKwh,
      carbon: inputs.carbonKg,
      currentInfra: {
        ...simMetrics.currentInfra,
        vms: inputs.vmCount,
        cost: inputs.monthlyCost,
      },
    };
    persistSimulatorForm(inputs);
    setProviderState("demo");
    setCredentials(null);
    storage.setProvider("demo");
    setMetrics(enriched);
    storage.setMetrics(enriched);
  }, []);

  const clearEnvironment = useCallback(() => {
    setProviderState(null);
    setCredentials(null);
    setMetrics(null);
    storage.clearProvider();
    storage.clearMetrics();
    storage.clearSimulatorForm();
  }, []);

  const refreshMetrics = useCallback(() => {
    if (provider === "demo" && metrics?.fromSimulator && metrics.simulatorInputs) {
      return metrics;
    }
    const m = generateMetrics(provider || "demo");
    setMetrics(m);
    storage.setMetrics(m);
    return m;
  }, [provider, metrics]);

  return (
    <CloudContext.Provider
      value={{
        provider,
        credentials,
        metrics,
        setProvider,
        completeDemoSimulator,
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
