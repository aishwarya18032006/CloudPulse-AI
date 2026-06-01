import { motion } from "framer-motion";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  ComposedChart,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useChartTheme } from "../../hooks/useChartTheme";
import { formatCurrency } from "../../utils/formatters";

export const ForecastChart = ({ metrics }) => {
  const chart = useChartTheme();
  const data = metrics.costHistory.filter((d) => d.cost || d.predicted).map((d) => ({
    month: d.month,
    actual: d.cost,
    forecast: d.predicted,
  }));

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="cp-surface min-w-0 overflow-hidden p-5 sm:p-8"
    >
      <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="font-display text-xl font-bold text-[var(--text-primary)]">AI Cost Prediction</h2>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">Enterprise forecast · {metrics.aiConfidence}% model confidence</p>
        </div>
        <div className="flex flex-wrap gap-6">
          {[
            { l: "Current", v: formatCurrency(metrics.monthlyCost), c: "var(--text-primary)" },
            { l: "Predicted", v: formatCurrency(metrics.predictedCost), c: "var(--danger)" },
            { l: "Growth", v: `+${metrics.growth}%`, c: "var(--danger)" },
          ].map((x) => (
            <div key={x.l}>
              <p className="text-xs font-medium text-[var(--text-tertiary)]">{x.l}</p>
              <p className="font-display text-lg font-bold" style={{ color: x.c }}>{x.v}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="h-[340px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="costArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.2} />
                <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke={chart.grid} strokeDasharray="4 4" vertical={false} />
            <XAxis dataKey="month" tick={{ fill: chart.text, fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: chart.text, fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
            <Tooltip contentStyle={chart.tooltip} formatter={(v) => (v ? formatCurrency(v) : "—")} />
            <Legend />
            <Area type="monotone" dataKey="actual" name="Historical" stroke="var(--accent)" fill="url(#costArea)" strokeWidth={2.5} />
            <Line type="monotone" dataKey="forecast" name="AI Forecast" stroke="var(--cyan)" strokeWidth={2.5} strokeDasharray="6 4" dot={{ r: 4, fill: "var(--cyan)" }} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <p className="mt-6 rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] px-5 py-4 text-sm text-[var(--text-secondary)]">
        <strong className="text-[var(--text-primary)]">Forecast summary:</strong> Next-month spend projected to increase {metrics.growth}% driven by compute scaling. Recommend reserved capacity review in ap-south-1.
      </p>
    </motion.section>
  );
};
