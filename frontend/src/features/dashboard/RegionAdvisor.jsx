import { motion } from "framer-motion";
import { HiOutlineMapPin, HiOutlineArrowLongRight } from "react-icons/hi2";
import { formatCurrency } from "../../utils/formatters";

export const RegionAdvisor = ({ metrics }) => (
  <motion.section
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.3 }}
    className="cp-surface min-w-0 p-4 sm:p-6 md:p-8"
  >
    <h2 className="font-display text-xl font-bold">Green Region Migration</h2>
    <p className="mt-1 text-sm text-[var(--text-secondary)]">Compare current vs. AI-recommended region</p>

    <div className="mt-8 grid gap-4 lg:grid-cols-[1fr_auto_1fr] lg:items-stretch">
      <RegionCard label="Current region" region={metrics.region.current} muted />
      <div className="flex items-center justify-center py-4 lg:py-0">
        <motion.div animate={{ x: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
          <HiOutlineArrowLongRight className="h-8 w-8 text-[var(--accent)]" />
        </motion.div>
      </div>
      <RegionCard label="Suggested region" region={metrics.region.recommended} highlight />
    </div>

    <div className="mt-8 grid gap-4 sm:grid-cols-3">
      {[
        { l: "Est. savings", v: formatCurrency(metrics.costSaving) },
        { l: "Carbon reduction", v: `${metrics.carbonReduction}%` },
        { l: "Efficiency gain", v: `+${metrics.efficiencyIncrease}%` },
      ].map((x) => (
        <div key={x.l} className="rounded-2xl border border-[var(--border)] bg-[var(--bg-subtle)] p-5 text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">{x.l}</p>
          <p className="font-display mt-2 text-xl font-bold text-[var(--accent)]">{x.v}</p>
        </div>
      ))}
    </div>
  </motion.section>
);

const RegionCard = ({ label, region, highlight, muted }) => (
  <div
    className={`rounded-2xl border p-6 ${
      highlight
        ? "border-[var(--accent)] bg-[var(--accent-soft)] shadow-[var(--shadow-glow)]"
        : "border-[var(--border)] bg-[var(--bg-elevated)]"
    }`}
  >
    <div className="flex items-center gap-2 text-[var(--text-tertiary)]">
      <HiOutlineMapPin className={`h-4 w-4 ${highlight ? "text-[var(--accent)]" : ""}`} />
      <span className="text-xs font-semibold uppercase tracking-wider">{label}</span>
    </div>
    <p className="font-display mt-3 text-lg font-bold text-[var(--text-primary)]">{region}</p>
  </div>
);
