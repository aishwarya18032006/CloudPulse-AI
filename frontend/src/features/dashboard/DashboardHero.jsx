import { motion } from "framer-motion";
import { HiOutlineCheckBadge, HiOutlineSignal } from "react-icons/hi2";
import { useAuth } from "../../context/AuthContext";
import { useCloud } from "../../context/CloudContext";

export const DashboardHero = ({ metrics }) => {
  const { user } = useAuth();
  const { providerName } = useCloud();
  const first = user?.name?.split(" ")[0] || "there";

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="cp-glass mb-6 overflow-hidden rounded-[var(--radius-xl)] p-4 sm:mb-10 sm:p-8 md:p-10"
    >
      <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-semibold text-[var(--accent)]">{providerName}</p>
          <h1 className="font-display mt-2 text-2xl font-extrabold tracking-tight text-[var(--text-primary)] sm:text-3xl md:text-4xl">
            Welcome back, {first}
          </h1>
          <p className="mt-2 max-w-lg text-[var(--text-secondary)]">
            Your cloud environment is operating within expected parameters. Review forecasts and optimization opportunities below.
          </p>
        </div>

        <div className="grid w-full gap-3 sm:grid-cols-2 sm:gap-4 lg:flex lg:w-auto lg:flex-wrap">
          <StatusCard
            icon={HiOutlineSignal}
            label="Cloud Efficiency"
            value={metrics.healthStatus}
            sub={`Score ${metrics.healthScore}/100`}
            accent="var(--success)"
          />
          <StatusCard
            icon={HiOutlineCheckBadge}
            label="Cloud Health"
            value="Operational"
            sub="All regions reporting"
            accent="var(--accent)"
          />
        </div>
      </div>
    </motion.section>
  );
};

const StatusCard = ({ icon: Icon, label, value, sub, accent }) => (
  <div className="min-w-0 w-full rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] p-4 shadow-[var(--shadow-sm)] sm:p-5">
    <div className="flex items-center gap-2 text-[var(--text-secondary)]">
      <Icon className="h-4 w-4" style={{ color: accent }} />
      <span className="text-xs font-semibold uppercase tracking-wider">{label}</span>
    </div>
    <p className="font-display mt-2 text-xl font-bold text-[var(--text-primary)]">{value}</p>
    <p className="mt-1 text-xs text-[var(--text-tertiary)]">{sub}</p>
  </div>
);
