import { motion } from "framer-motion";
import { HiOutlineServerStack, HiOutlineCircleStack, HiOutlineCircleStack as DbIcon } from "react-icons/hi2";
import { formatCurrency } from "../../utils/formatters";

const RISK = {
  Low: { bg: "var(--success-soft)", text: "var(--success)", label: "Low risk" },
  Medium: { bg: "var(--warning-soft)", text: "var(--warning)", label: "Medium risk" },
  High: { bg: "var(--danger-soft)", text: "var(--danger)", label: "High risk" },
};

export const ResourceDetection = ({ metrics }) => {
  const risk = RISK[metrics.riskLevel] || RISK.Medium;

  const items = [
    {
      icon: HiOutlineServerStack,
      title: "Unused VMs",
      value: metrics.idleVm,
      unit: "instances idle > 72h",
      status: metrics.idleVm > 2 ? "warning" : "success",
    },
    {
      icon: HiOutlineCircleStack,
      title: "Unused Storage",
      value: `${metrics.unusedStorage} GB`,
      unit: "unattached volumes",
      status: "warning",
    },
    {
      icon: DbIcon,
      title: "Database",
      value: metrics.overProvisionedDb,
      unit: "over-provisioned",
      status: "danger",
    },
  ];

  const statusStyle = {
    success: { dot: "var(--success)", bg: "var(--success-soft)" },
    warning: { dot: "var(--warning)", bg: "var(--warning-soft)" },
    danger: { dot: "var(--danger)", bg: "var(--danger-soft)" },
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="cp-surface min-w-0 p-4 sm:p-6 md:p-8"
    >
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="font-display text-xl font-bold">Resource Detection</h2>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">AI-identified waste and right-sizing opportunities</p>
        </div>
        <span className="rounded-full px-3 py-1 text-xs font-bold" style={{ background: risk.bg, color: risk.text }}>
          {risk.label}
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 md:gap-4">
        {items.map((item, i) => {
          const s = statusStyle[item.status];
          return (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 + i * 0.05 }}
              className="rounded-2xl border border-[var(--border)] p-5"
              style={{ background: s.bg }}
            >
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full" style={{ background: s.dot }} />
                <item.icon className="h-5 w-5 text-[var(--text-secondary)]" />
              </div>
              <p className="mt-4 text-sm font-medium text-[var(--text-secondary)]">{item.title}</p>
              <p className="font-display mt-1 text-2xl font-bold text-[var(--text-primary)]">{item.value}</p>
              <p className="mt-1 text-xs text-[var(--text-tertiary)]">{item.unit}</p>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-6 flex items-start gap-3 rounded-xl border border-[var(--accent)]/20 bg-[var(--accent-soft)] p-4">
        <p className="text-sm text-[var(--text-secondary)]">
          <strong className="text-[var(--text-primary)]">Recommended action:</strong> Reclaim {metrics.unusedStorage}GB and decommission {metrics.idleVm} VMs to unlock {formatCurrency(metrics.savings)}/mo.
        </p>
      </div>
    </motion.section>
  );
};
