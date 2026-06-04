import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  HiOutlineArrowLeft,
  HiOutlineArrowRight,
  HiOutlineSparkles,
} from "react-icons/hi2";
import { PremiumCanvas } from "../ui/PremiumCanvas";
import { BrandMark } from "../ui/BrandMark";
import { ThemeSwitch } from "../ui/ThemeSwitch";
import { PremiumInput } from "../ui/PremiumInput";
import { useCloud } from "../context/CloudContext";
import { api } from "../services/api";
import { runLocalPrediction } from "../utils/predictionEngine";
import { buildDashboardMetrics } from "../utils/simulatorMetrics";
import { loadSimulatorForm, persistSimulatorForm } from "../utils/simulatorInputs";

const DEFAULT_FORM = {
  cloudProvider: "aws",
  region: "ap-south-1 (Mumbai)",
  vmCount: "10",
  vmType: "t3.large",
  cpuUsage: "72",
  memoryUsage: "68",
  storageUsage: "74",
  networkTrafficGb: "240",
  monthlyCost: "24500",
  energyKwh: "420",
  carbonKg: "145",
  applicationType: "Web Application",
  dailyActiveUsers: "12500",
  requestVolume: "850000",
};

const PROVIDERS = [
  { id: "aws", label: "AWS" },
  { id: "azure", label: "Azure" },
  { id: "gcp", label: "GCP" },
];

const APP_TYPES = [
  "Web Application",
  "API / Microservices",
  "Data Pipeline",
  "Machine Learning",
  "E-commerce",
  "Enterprise SaaS",
];

export const CloudInfrastructureSimulatorPage = () => {
  const navigate = useNavigate();
  const { completeDemoSimulator } = useCloud();
  const [form, setForm] = useState(() => loadSimulatorForm(DEFAULT_FORM));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleAnalyze = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const payload = {
      ...form,
      vmCount: Number(form.vmCount),
      cpuUsage: Number(form.cpuUsage),
      memoryUsage: Number(form.memoryUsage),
      storageUsage: Number(form.storageUsage),
      networkTrafficGb: Number(form.networkTrafficGb),
      monthlyCost: Number(form.monthlyCost),
      energyKwh: Number(form.energyKwh),
      carbonKg: Number(form.carbonKg),
      dailyActiveUsers: Number(form.dailyActiveUsers),
      requestVolume: Number(form.requestVolume),
    };

    persistSimulatorForm(payload);

    try {
      const data = await api.simulatorAnalyze(payload);
      completeDemoSimulator(data.metrics);
      navigate("/dashboard");
    } catch (err) {
      if (err.status && err.status < 500) {
        setError(err.message || "Could not generate analysis. Check your inputs.");
        return;
      }
      const { prediction } = runLocalPrediction(payload);
      const metrics = buildDashboardMetrics(payload, prediction);
      completeDemoSimulator(metrics);
      navigate("/dashboard");
      if (import.meta.env.DEV) {
        console.warn("Simulator API unavailable, used local prediction:", err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cp-page-shell relative min-h-screen overflow-x-hidden">
      <PremiumCanvas />

      <header className="relative z-20 border-b border-[var(--border)] bg-[var(--nav-bg)] backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-3 sm:h-16 sm:px-6">
          <BrandMark size="sm" className="min-w-0" showWordmarkOnMobile={false} />
          <ThemeSwitch />
        </div>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-5xl min-w-0 px-3 py-6 sm:px-6 sm:py-12">
        <button
          type="button"
          onClick={() => navigate("/workspace")}
          className="cp-btn-ghost mb-6 gap-2 text-sm"
        >
          <HiOutlineArrowLeft className="h-4 w-4" />
          Back to workspace
        </button>

        <p className="text-sm font-semibold text-[var(--accent)]">Demo Mode · Step 1</p>
        <h1 className="font-display mt-2 text-2xl font-extrabold tracking-tight text-[var(--text-primary)] sm:text-4xl">
          Cloud Infrastructure Simulator
        </h1>
        <p className="mt-3 max-w-2xl text-[var(--text-secondary)]">
          Enter your cloud metrics manually. CloudPulse will run them through the AI prediction layer
          and populate your dashboard — same experience as Demo Mode, with data driven by your inputs.
        </p>
        <p className="mt-2 text-xs text-[var(--text-tertiary)]">
          {/* Production: metrics will be ingested automatically from AWS, Azure, and GCP APIs. */}
          In production, these fields will be filled from AWS APIs, Azure APIs, and GCP APIs instead of manual entry.
        </p>

        {error && (
          <p className="mt-4 rounded-lg bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]">
            {error}
          </p>
        )}

        <form onSubmit={handleAnalyze} className="mt-8 space-y-8">
          <section className="cp-surface p-5 sm:p-8">
            <h2 className="font-display text-lg font-bold text-[var(--text-primary)]">Environment</h2>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <div>
                <span className="mb-2 block text-sm font-medium text-[var(--text-secondary)]">
                  Cloud Provider
                </span>
                <div className="flex flex-wrap gap-2">
                  {PROVIDERS.map((p) => (
                    <label
                      key={p.id}
                      className={`cursor-pointer rounded-xl border px-4 py-2.5 text-sm font-semibold transition-colors ${
                        form.cloudProvider === p.id
                          ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]"
                          : "border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--accent)]"
                      }`}
                    >
                      <input
                        type="radio"
                        name="cloudProvider"
                        value={p.id}
                        checked={form.cloudProvider === p.id}
                        onChange={set("cloudProvider")}
                        className="sr-only"
                      />
                      {p.label}
                    </label>
                  ))}
                </div>
              </div>
              <PremiumInput
                label="Region"
                value={form.region}
                onChange={set("region")}
                placeholder="e.g. ap-south-1"
                required
              />
            </div>
          </section>

          <section className="cp-surface p-5 sm:p-8">
            <h2 className="font-display text-lg font-bold text-[var(--text-primary)]">Compute & storage</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <PremiumInput label="VM Count" type="number" value={form.vmCount} onChange={set("vmCount")} required />
              <PremiumInput label="VM Type" value={form.vmType} onChange={set("vmType")} placeholder="e.g. t3.large" required />
              <SliderField label="CPU Usage (%)" value={form.cpuUsage} onChange={set("cpuUsage")} />
              <SliderField label="Memory Usage (%)" value={form.memoryUsage} onChange={set("memoryUsage")} />
              <SliderField label="Storage Usage (%)" value={form.storageUsage} onChange={set("storageUsage")} />
              <PremiumInput
                label="Network Traffic (GB)"
                type="number"
                value={form.networkTrafficGb}
                onChange={set("networkTrafficGb")}
                required
              />
            </div>
          </section>

          <section className="cp-surface p-5 sm:p-8">
            <h2 className="font-display text-lg font-bold text-[var(--text-primary)]">Cost & sustainability</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <PremiumInput
                label="Current Monthly Cost ($)"
                type="number"
                value={form.monthlyCost}
                onChange={set("monthlyCost")}
                required
              />
              <PremiumInput
                label="Energy Consumption (kWh)"
                type="number"
                value={form.energyKwh}
                onChange={set("energyKwh")}
                required
              />
              <PremiumInput
                label="Carbon Emission (kg CO₂)"
                type="number"
                value={form.carbonKg}
                onChange={set("carbonKg")}
                required
              />
            </div>
          </section>

          <section className="cp-surface p-5 sm:p-8">
            <h2 className="font-display text-lg font-bold text-[var(--text-primary)]">Application workload</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="applicationType" className="mb-2 block text-sm font-medium text-[var(--text-secondary)]">
                  Application Type
                </label>
                <select
                  id="applicationType"
                  value={form.applicationType}
                  onChange={set("applicationType")}
                  className="cp-input w-full"
                  required
                >
                  {APP_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <PremiumInput
                label="Daily Active Users"
                type="number"
                value={form.dailyActiveUsers}
                onChange={set("dailyActiveUsers")}
                required
              />
              <PremiumInput
                label="Request Volume"
                type="number"
                value={form.requestVolume}
                onChange={set("requestVolume")}
                required
              />
            </div>
          </section>

          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: loading ? 1 : 1.01 }}
            whileTap={{ scale: loading ? 1 : 0.99 }}
            className="cp-btn-primary w-full py-3.5 sm:w-auto sm:min-w-[280px]"
          >
            {loading ? (
              "Generating AI analysis…"
            ) : (
              <>
                <HiOutlineSparkles className="h-5 w-5" />
                Generate AI Analysis
                <HiOutlineArrowRight className="h-5 w-5" />
              </>
            )}
          </motion.button>
        </form>
      </main>
    </div>
  );
};

const SliderField = ({ label, value, onChange }) => (
  <div>
    <label className="mb-2 block text-sm font-medium text-[var(--text-secondary)]">{label}</label>
    <input
      type="range"
      min="0"
      max="100"
      value={value}
      onChange={onChange}
      className="w-full accent-[var(--accent)]"
    />
    <span className="text-xs text-[var(--text-tertiary)]">{value}%</span>
  </div>
);
