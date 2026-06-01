import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useChartTheme } from "../../hooks/useChartTheme";

export const CarbonPanel = ({ metrics }) => {
  const chart = useChartTheme();
  const r = 52;
  const circ = 2 * Math.PI * r;
  const offset = circ - (metrics.greenScore / 100) * circ;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
      className="cp-surface min-w-0 p-4 sm:p-6 md:p-8"
    >
      <h2 className="font-display text-xl font-bold">Carbon Intelligence</h2>
      <p className="mt-1 text-sm text-[var(--text-secondary)]">Footprint, green score & monthly trend</p>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:gap-10">
          <div className="relative shrink-0">
            <svg width="128" height="128" className="-rotate-90">
              <circle cx="64" cy="64" r={r} fill="none" stroke="var(--bg-muted)" strokeWidth="10" />
              <motion.circle
                cx="64"
                cy="64"
                r={r}
                fill="none"
                stroke="url(#greenRing)"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={circ}
                initial={{ strokeDashoffset: circ }}
                animate={{ strokeDashoffset: offset }}
                transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
              />
              <defs>
                <linearGradient id="greenRing" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="var(--success)" />
                  <stop offset="100%" stopColor="var(--cyan)" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-display text-3xl font-bold">{metrics.greenScore}</span>
              <span className="text-xs text-[var(--text-tertiary)]">Green score</span>
            </div>
          </div>
          <div>
            <p className="text-sm text-[var(--text-secondary)]">Carbon footprint</p>
            <p className="font-display text-3xl font-bold text-[var(--text-primary)]">{metrics.carbon} kg CO₂</p>
            <p className="mt-2 text-sm text-[var(--text-tertiary)]">This billing period</p>
          </div>
        </div>

        <div className="h-44">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={metrics.carbonHistory}>
              <CartesianGrid stroke={chart.grid} strokeDasharray="4 4" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: chart.text, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: chart.text, fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={chart.tooltip} />
              <Area type="monotone" dataKey="carbon" stroke="var(--success)" fill="var(--success)" fillOpacity={0.15} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.section>
  );
};
