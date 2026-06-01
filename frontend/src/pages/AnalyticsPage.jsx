import { useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
  RadialBarChart,
  RadialBar,
} from "recharts";
import { useCloud } from "../context/CloudContext";
import { useChartTheme } from "../hooks/useChartTheme";
import { formatCurrency } from "../utils/formatters";

const RANGES = ["7d", "30d", "90d", "1y"];
const RANGE_LABELS = { "7d": "7 days", "30d": "30 days", "90d": "90 days", "1y": "1 year" };

export const AnalyticsPage = () => {
  const { metrics } = useCloud();
  const [range, setRange] = useState("30d");
  const chart = useChartTheme();

  const savingsData = metrics.costHistory
    .filter((d) => d.cost)
    .map((d) => ({ month: d.month, actual: d.cost, optimized: Math.round(d.cost * 0.82) }));

  const util = [
    { name: "Compute", value: metrics.utilization.compute, fill: "var(--accent)" },
    { name: "Memory", value: metrics.utilization.memory, fill: "var(--cyan)" },
    { name: "Storage", value: metrics.utilization.storage, fill: "var(--success)" },
    { name: "Network", value: metrics.utilization.network, fill: "var(--warning)" },
  ];

  return (
    <div className="min-w-0">
      <header className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-[var(--accent)]">Business intelligence</p>
          <h1 className="font-display text-3xl font-extrabold tracking-tight">Analytics</h1>
          <p className="mt-2 text-[var(--text-secondary)]">Cost, carbon, utilization & health — unified view.</p>
        </div>
        <div className="flex rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] p-1 shadow-[var(--shadow-xs)]">
          {RANGES.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRange(r)}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                range === r ? "bg-[var(--accent)] text-white shadow-sm" : "text-[var(--text-secondary)]"
              }`}
            >
              {RANGE_LABELS[r]}
            </button>
          ))}
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Cost trends" sub={`Range: ${RANGE_LABELS[range]}`}>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.costHistory.filter((d) => d.cost)}>
                <CartesianGrid stroke={chart.grid} strokeDasharray="4 4" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: chart.text, fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: chart.text, fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
                <Tooltip contentStyle={chart.tooltip} formatter={(v) => formatCurrency(v)} />
                <Bar dataKey="cost" fill="var(--accent)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Carbon trends" sub="kg CO₂ per month">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metrics.carbonHistory}>
                <CartesianGrid stroke={chart.grid} strokeDasharray="4 4" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: chart.text, fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: chart.text, fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={chart.tooltip} />
                <Area type="monotone" dataKey="carbon" stroke="var(--success)" fill="var(--success)" fillOpacity={0.12} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Savings forecast" sub="Actual vs optimized trajectory">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={savingsData}>
                <CartesianGrid stroke={chart.grid} strokeDasharray="4 4" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: chart.text, fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: chart.text, fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={chart.tooltip} />
                <Legend />
                <Line type="monotone" dataKey="actual" name="Actual" stroke="var(--accent)" strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="optimized" name="Optimized" stroke="var(--success)" strokeWidth={2.5} strokeDasharray="6 4" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Resource utilization" sub="By workload category">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={util} layout="vertical" margin={{ left: 8 }}>
                <CartesianGrid stroke={chart.grid} strokeDasharray="4 4" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} tick={{ fill: chart.text, fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fill: chart.text, fontSize: 12 }} axisLine={false} tickLine={false} width={72} />
                <Tooltip contentStyle={chart.tooltip} />
                <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={28}>
                  {util.map((e, i) => (
                    <Cell key={i} fill={e.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      <Panel title="Cloud health" sub={`Composite score ${metrics.healthScore}/100`} className="mt-6">
        <div className="flex flex-col items-center gap-10 py-4 lg:flex-row lg:justify-around">
          <div className="h-52 w-52">
            <ResponsiveContainer>
              <RadialBarChart cx="50%" cy="50%" innerRadius="70%" outerRadius="100%" data={[{ value: metrics.healthScore, fill: "var(--accent)" }]} startAngle={90} endAngle={-270}>
                <RadialBar dataKey="value" cornerRadius={8} background={{ fill: "var(--bg-muted)" }} />
              </RadialBarChart>
            </ResponsiveContainer>
            <p className="-mt-32 text-center font-display text-3xl font-bold">{metrics.healthScore}</p>
          </div>
          <div className="grid w-full max-w-lg grid-cols-2 gap-4">
            {util.map((u) => (
              <div key={u.name} className="rounded-2xl border border-[var(--border)] bg-[var(--bg-subtle)] p-5">
                <p className="text-sm text-[var(--text-secondary)]">{u.name}</p>
                <p className="font-display mt-1 text-2xl font-bold" style={{ color: u.fill }}>{u.value}%</p>
              </div>
            ))}
          </div>
        </div>
      </Panel>
    </div>
  );
};

const Panel = ({ title, sub, children, className = "" }) => (
  <motion.section
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    className={`cp-surface p-8 ${className}`}
  >
    <h3 className="font-display text-lg font-bold">{title}</h3>
    <p className="mt-1 text-sm text-[var(--text-secondary)]">{sub}</p>
    <div className="mt-6">{children}</div>
  </motion.section>
);
