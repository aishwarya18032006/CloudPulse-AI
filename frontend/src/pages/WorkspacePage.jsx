import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { HiOutlineArrowPath, HiOutlineArrowRight } from "react-icons/hi2";
import { FaAws, FaMicrosoft, FaGoogle } from "react-icons/fa6";
import { PremiumCanvas } from "../ui/PremiumCanvas";
import { BrandMark } from "../ui/BrandMark";
import { ThemeSwitch } from "../ui/ThemeSwitch";
import { Stagger, StaggerItem } from "../ui/PageMotion";
import { ConnectDialog } from "../features/workspace/ConnectDialog";
import { useAuth } from "../context/AuthContext";
import { useCloud } from "../context/CloudContext";
import { ENVIRONMENTS, generateMetrics } from "../utils/demoData";
import { formatCurrency } from "../utils/formatters";

const LOGOS = { aws: FaAws, azure: FaMicrosoft, gcp: FaGoogle, demo: null };

export const WorkspacePage = () => {
  const { user } = useAuth();
  const { setProvider } = useCloud();
  const navigate = useNavigate();
  const [connect, setConnect] = useState(null);
  const [previews, setPreviews] = useState(() =>
    Object.fromEntries(ENVIRONMENTS.map((e) => [e.id, generateMetrics(e.id)]))
  );

  const refresh = (e, id) => {
    e.stopPropagation();
    setPreviews((p) => ({ ...p, [id]: generateMetrics(id) }));
  };

  const select = (id) => {
    if (id === "demo") {
      setProvider("demo");
      navigate("/dashboard");
    } else setConnect(id);
  };

  const onConnected = (id, cloudCredentials) => {
    setConnect(null);
    setProvider(id, cloudCredentials);
    navigate("/dashboard");
  };

  return (
    <div className="cp-page-shell relative min-h-screen overflow-x-hidden">
      <PremiumCanvas />

      <header className="relative z-20 border-b border-[var(--border)] bg-[var(--nav-bg)] backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-3 sm:h-16 sm:px-6">
          <BrandMark size="sm" className="min-w-0" showWordmarkOnMobile={false} />
          <ThemeSwitch />
        </div>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-6xl min-w-0 px-3 py-6 sm:px-6 sm:py-12 lg:py-16">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[var(--accent)]">Workspace</p>
          <h1 className="font-display mt-2 text-2xl font-extrabold tracking-tight text-[var(--text-primary)] sm:text-4xl lg:text-5xl">
            Choose Your Cloud Environment
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-[var(--text-secondary)]">
            Monitor and optimize cloud resources using AI — across AWS, Azure, Google Cloud, or explore with demo data.
          </p>
          {user?.name && (
            <p className="mt-2 text-sm text-[var(--text-tertiary)]">
              Signed in as <span className="font-medium text-[var(--text-primary)]">{user.name}</span>
            </p>
          )}
        </div>

        <Stagger className="mt-8 grid gap-4 sm:mt-14 sm:gap-6 md:grid-cols-2">
          {ENVIRONMENTS.map((env) => {
            const Icon = LOGOS[env.id];
            const m = previews[env.id];
            const isDemo = env.id === "demo";

            return (
              <StaggerItem key={env.id}>
                <motion.button
                  type="button"
                  onClick={() => select(env.id)}
                  whileHover={{ y: -6 }}
                  whileTap={{ scale: 0.995 }}
                  transition={{ type: "spring", stiffness: 400, damping: 28 }}
                  className="cp-gradient-border cp-lift group w-full cursor-pointer text-left"
                >
                  <div className="relative overflow-hidden rounded-[calc(var(--radius-lg)-1px)] bg-[var(--bg-elevated)] p-4 shadow-[var(--shadow-sm)] sm:p-6 md:p-8">
                    {env.badge && (
                      <span className="absolute right-3 top-3 rounded-full bg-[#7C3AED]/10 px-2 py-0.5 text-[10px] font-semibold text-[#7C3AED] sm:right-6 sm:top-6 sm:px-3 sm:py-1 sm:text-xs">
                        {env.badge}
                      </span>
                    )}

                    <div className="flex items-start gap-3 sm:gap-5">
                      <div
                        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl sm:h-16 sm:w-16"
                        style={{ background: `${env.brandColor}14`, color: env.brandColor }}
                      >
                        {isDemo ? (
                          <span className="font-display text-2xl font-bold" style={{ color: env.brandColor }}>Demo</span>
                        ) : (
                          <Icon className="h-9 w-9" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h2 className="font-display text-lg font-bold text-[var(--text-primary)] sm:text-xl">{env.short}</h2>
                        <p className="text-sm text-[var(--text-secondary)]">{env.name}</p>
                      </div>
                    </div>

                    <ul className="mt-6 space-y-2">
                      {env.features.map((f) => (
                        <li key={f} className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                          <span className="h-1 w-1 rounded-full bg-[var(--accent)]" />
                          {f}
                        </li>
                      ))}
                    </ul>

                    <div className="mt-6 grid grid-cols-2 gap-2 rounded-xl bg-[var(--bg-subtle)] p-3 sm:grid-cols-4 sm:gap-3 sm:p-4">
                      {[
                        { l: "Spend", v: formatCurrency(m.monthlyCost) },
                        { l: "CPU", v: `${m.cpu}%` },
                        { l: "CO₂", v: `${m.carbon}kg` },
                        { l: "Save", v: formatCurrency(m.savings) },
                      ].map((s) => (
                        <div key={s.l}>
                          <p className="text-[10px] font-medium uppercase tracking-wider text-[var(--text-tertiary)]">{s.l}</p>
                          <p className="mt-0.5 text-sm font-semibold text-[var(--text-primary)]">{s.v}</p>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 flex items-center justify-between">
                      <span className="flex items-center gap-1 text-sm font-semibold text-[var(--accent)] opacity-0 transition-opacity group-hover:opacity-100">
                        Open workspace <HiOutlineArrowRight />
                      </span>
                      <button
                        type="button"
                        onClick={(e) => refresh(e, env.id)}
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border)] text-[var(--text-tertiary)] hover:text-[var(--accent)]"
                        aria-label="Refresh preview"
                      >
                        <HiOutlineArrowPath className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </motion.button>
              </StaggerItem>
            );
          })}
        </Stagger>
      </main>

      {connect && <ConnectDialog provider={connect} onClose={() => setConnect(null)} onSuccess={onConnected} />}
    </div>
  );
};
