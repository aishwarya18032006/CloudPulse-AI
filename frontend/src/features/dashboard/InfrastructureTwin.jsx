import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HiOutlineArrowLongRight, HiOutlineSparkles } from "react-icons/hi2";
import { formatCurrency } from "../../utils/formatters";

export const InfrastructureTwin = ({ metrics }) => {
  const [optimized, setOptimized] = useState(false);
  const cur = metrics.currentInfra;
  const opt = metrics.optimizedInfra;
  const costSaved = cur.cost - opt.cost;
  const carbonSaved = Math.round(metrics.carbon * 0.22);

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-[var(--radius-xl)] p-[1px]"
      style={{ background: "linear-gradient(135deg, var(--accent), var(--cyan))" }}
    >
      <div className="min-w-0 rounded-[calc(var(--radius-xl)-1px)] bg-[var(--bg-elevated)] p-4 sm:p-8 md:p-10">
        <div className="flex flex-col gap-4 sm:gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <span className="inline-flex items-center gap-1 rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs font-bold text-[var(--accent)]">
              <HiOutlineSparkles className="h-3.5 w-3.5" /> Hero · Digital Twin
            </span>
            <h2 className="font-display mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl">
              Infrastructure Digital Twin
            </h2>
            <p className="mt-2 max-w-xl text-[var(--text-secondary)]">
              Simulate an optimized state — compare before and after AI-driven rightsizing.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setOptimized(!optimized)}
            className="cp-btn-primary w-full shrink-0 sm:w-auto"
          >
            {optimized ? "View before" : "View after optimization"}
          </button>
        </div>

        <div className="mt-10 grid items-center gap-6 lg:grid-cols-[1fr_auto_1fr]">
          <TwinPanel
            title="Before optimization"
            active={!optimized}
            vms={cur.vms}
            storage={cur.storage}
            cost={cur.cost}
          />
          <HiOutlineArrowLongRight className="mx-auto hidden h-10 w-10 text-[var(--accent)] lg:block" />
          <TwinPanel
            title="After optimization"
            active={optimized}
            vms={opt.vms}
            storage={opt.storage}
            cost={opt.cost}
            optimized
          />
        </div>

        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mt-10 grid gap-4 border-t border-[var(--border)] pt-8 sm:grid-cols-3"
          >
            {[
              { l: "Cost saved", v: formatCurrency(costSaved), c: "var(--success)" },
              { l: "Carbon saved", v: `${carbonSaved} kg CO₂`, c: "var(--cyan)" },
              { l: "Efficiency", v: `+${metrics.efficiencyIncrease}%`, c: "var(--accent)" },
            ].map((x) => (
              <div key={x.l} className="text-center sm:text-left">
                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">{x.l}</p>
                <p className="font-display mt-1 text-2xl font-bold" style={{ color: x.c }}>{x.v}</p>
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.section>
  );
};

const TwinPanel = ({ title, active, vms, storage, cost, optimized }) => (
  <motion.div
    animate={{ opacity: active ? 1 : 0.55, scale: active ? 1 : 0.98 }}
    className={`rounded-2xl border p-6 transition-shadow ${
      active
        ? optimized
          ? "border-[var(--success)] bg-[var(--success-soft)] shadow-[var(--shadow-md)]"
          : "border-[var(--border)] bg-[var(--bg-subtle)] shadow-[var(--shadow-sm)]"
        : "border-[var(--border)] bg-[var(--bg-elevated)]"
    }`}
  >
    <p className={`text-xs font-bold uppercase tracking-wider ${optimized ? "text-[var(--success)]" : "text-[var(--text-tertiary)]"}`}>
      {title}
    </p>
    <dl className="mt-6 space-y-4">
      <Row label="Virtual machines" value={`${vms} VM`} />
      <Row label="Storage" value={`${storage} GB`} />
      <Row label="Monthly cost" value={formatCurrency(cost)} bold />
    </dl>
  </motion.div>
);

const Row = ({ label, value, bold }) => (
  <div className="flex justify-between gap-4 border-b border-[var(--border)] pb-3 last:border-0">
    <dt className="text-sm text-[var(--text-secondary)]">{label}</dt>
    <dd className={`text-sm ${bold ? "font-display text-lg font-bold text-[var(--text-primary)]" : "font-semibold text-[var(--text-primary)]"}`}>
      {value}
    </dd>
  </div>
);
