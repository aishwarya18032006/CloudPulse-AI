import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { HiOutlineArrowTrendingUp, HiOutlineArrowTrendingDown } from "react-icons/hi2";
import { formatCurrency } from "../utils/formatters";

const useCount = (end, duration = 1400) => {
  const [n, setN] = useState(0);
  useEffect(() => {
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(end * eased));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [end, duration]);
  return n;
};

export const StripeMetric = ({
  label,
  value,
  sparkData,
  trend,
  trendLabel,
  icon: Icon,
  format = "currency",
  suffix,
  delay = 0,
}) => {
  const num = typeof value === "number" ? value : parseInt(String(value).replace(/\D/g, ""), 10);
  const animated = useCount(num);
  const up = trend >= 0;
  const chartData = (sparkData || []).map((v, i) => ({ i, v }));

  const display =
    format === "currency"
      ? formatCurrency(animated)
      : suffix
        ? `${animated}${suffix}`
        : animated.toLocaleString("en-IN");

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4, transition: { type: "spring", stiffness: 400, damping: 28 } }}
      className="cp-surface cp-lift group relative overflow-hidden p-6"
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[13px] font-medium text-[var(--text-secondary)]">{label}</p>
          <p className="font-display mt-2 text-[28px] font-bold tracking-tight text-[var(--text-primary)]">
            {display}
          </p>
          {trendLabel && (
            <div
              className={`mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
                up && format === "currency" && label.includes("Predicted")
                  ? "bg-[var(--danger-soft)] text-[var(--danger)]"
                  : up
                    ? "bg-[var(--success-soft)] text-[var(--success)]"
                    : "bg-[var(--danger-soft)] text-[var(--danger)]"
              }`}
            >
              {up ? <HiOutlineArrowTrendingUp /> : <HiOutlineArrowTrendingDown />}
              {trendLabel}
            </div>
          )}
        </div>
        {Icon && (
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>

      {chartData.length > 0 && (
        <div className="mt-4 h-12 w-full opacity-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id={`spark-${label}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="v"
                stroke="var(--accent)"
                strokeWidth={2}
                fill={`url(#spark-${label})`}
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </motion.article>
  );
};
