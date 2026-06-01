import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HiOutlineArrowDownTray, HiOutlineDocumentText, HiOutlineTrash } from "react-icons/hi2";
import { useCloud } from "../context/CloudContext";
import { useToast } from "../context/ToastContext";
import { api, getAuthToken } from "../services/api";
import { formatCurrency } from "../utils/formatters";

const REPORTS = [
  { id: "monthly-cost", title: "Monthly Cost Report", type: "Financial", pages: 12 },
  { id: "carbon", title: "Carbon & Sustainability Report", type: "ESG", pages: 8 },
  { id: "optimization", title: "Resource Optimization Report", type: "Operations", pages: 15 },
  { id: "savings", title: "FinOps Savings Report", type: "Executive", pages: 6 },
];

const CLOUD_OPTIONS = [
  { value: "aws", label: "AWS" },
  { value: "azure", label: "Azure" },
  { value: "gcp", label: "Google Cloud" },
  { value: "demo", label: "Demo Mode" },
];

const cloudLabel = (t) => CLOUD_OPTIONS.find((c) => c.value === t)?.label || t;

export const ReportsPage = () => {
  const { metrics, providerName } = useCloud();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(null);
  const [genLoading, setGenLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [form, setForm] = useState({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().slice(0, 10),
    endDate: new Date().toISOString().slice(0, 10),
    cloudType: "demo",
  });
  const [genError, setGenError] = useState("");

  const loadHistory = async () => {
    if (!getAuthToken()) return;
    try {
      const data = await api.reportHistory();
      setHistory(data.reports || []);
    } catch {
      /* API offline */
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const download = (id, title) => {
    setLoading(id);
    setTimeout(() => {
      const body = `
CLOUDPULSE AI — ${title.toUpperCase()}
Generated: ${new Date().toLocaleString()}
Environment: ${providerName}
────────────────────────────────────────
Current spend:     ${formatCurrency(metrics.monthlyCost)}
Predicted spend:   ${formatCurrency(metrics.predictedCost)}
Potential savings: ${formatCurrency(metrics.savings)}
Carbon footprint:  ${metrics.carbon} kg CO₂
Green score:       ${metrics.greenScore}/100
────────────────────────────────────────
Confidential — For internal use only
`;
      const blob = new Blob([body], { type: "text/plain" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `cloudpulse-${id}.txt`;
      a.click();
      setLoading(null);
    }, 900);
  };

  const generatePdf = async (e) => {
    e.preventDefault();
    setGenError("");
    setGenLoading(true);
    try {
      const data = await api.generateReport(form);
      const token = getAuthToken();
      const url = `${api.reportDownloadUrl(data.report.id)}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Download failed");
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `cloudpulse-report-${data.report.id}.pdf`;
      a.click();
      await loadHistory();
    } catch (err) {
      setGenError(err.message || "Could not generate report. Is the API server running?");
    } finally {
      setGenLoading(false);
    }
  };

  const downloadHistory = async (reportId) => {
    try {
      const token = getAuthToken();
      const res = await fetch(api.reportDownloadUrl(reportId), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Download failed");
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `cloudpulse-report-${reportId}.pdf`;
      a.click();
    } catch (err) {
      setGenError(err.message);
    }
  };

  const confirmDeleteReport = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.deleteReport(deleteTarget.id);
      setHistory((h) => h.filter((r) => r.id !== deleteTarget.id));
      setDeleteTarget(null);
      showToast("Report deleted successfully");
    } catch (err) {
      showToast(err.message || "Failed to delete report.", "error");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-w-0">
      <header className="mb-8 sm:mb-10">
        <p className="text-sm font-semibold text-[var(--accent)]">Export center</p>
        <h1 className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl">Reports</h1>
        <p className="mt-2 text-[var(--text-secondary)]">Board-ready PDF layouts · one-click export</p>
      </header>

      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="cp-surface mb-10 p-4 sm:p-6 md:p-8"
      >
        <h2 className="font-display text-lg font-bold">Generate PDF Report</h2>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          Select date range and cloud provider — data fetched from your account
        </p>

        <form onSubmit={generatePdf} autoComplete="off" className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-[var(--text-secondary)]">Start date</label>
            <input
              type="date"
              required
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              className="cp-input w-full"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-[var(--text-secondary)]">End date</label>
            <input
              type="date"
              required
              value={form.endDate}
              onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              className="cp-input w-full"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-[var(--text-secondary)]">Cloud provider</label>
            <select
              value={form.cloudType}
              onChange={(e) => setForm({ ...form, cloudType: e.target.value })}
              className="cp-input w-full"
            >
              {CLOUD_OPTIONS.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <motion.button
              type="submit"
              disabled={genLoading}
              whileHover={{ scale: genLoading ? 1 : 1.02 }}
              whileTap={{ scale: genLoading ? 1 : 0.98 }}
              className="cp-btn-primary w-full py-3"
            >
              <HiOutlineArrowDownTray className="inline" />
              {genLoading ? "Generating…" : "Generate & Download PDF"}
            </motion.button>
          </div>
        </form>

        {genError && (
          <p className="mt-4 rounded-lg bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]">{genError}</p>
        )}
      </motion.section>

      {history.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="cp-surface mb-10 overflow-hidden"
        >
          <div className="border-b border-[var(--border)] bg-[var(--bg-subtle)] px-4 py-3 sm:px-8 sm:py-4">
            <h2 className="font-display font-bold">Report History</h2>
          </div>
          <div className="cp-scroll-x divide-y divide-[var(--border)]">
            {history.map((r) => (
              <div key={r.id} className="flex min-w-[280px] flex-col gap-3 px-4 py-4 sm:min-w-0 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-4 sm:px-8">
                <div>
                  <p className="font-semibold text-[var(--text-primary)]">{cloudLabel(r.cloud_type)}</p>
                  <p className="text-sm text-[var(--text-secondary)]">
                    {r.start_date} — {r.end_date} · {new Date(r.generated_at).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <motion.button
                    type="button"
                    onClick={() => downloadHistory(r.id)}
                    whileHover={{ scale: 1.02 }}
                    className="cp-btn-ghost text-sm"
                  >
                    <HiOutlineArrowDownTray /> Download PDF
                  </motion.button>
                  <motion.button
                    type="button"
                    title="Delete Report"
                    aria-label="Delete Report"
                    onClick={() => setDeleteTarget(r)}
                    whileHover={{ scale: 1.02 }}
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border)] text-[var(--text-secondary)] transition-colors hover:border-[var(--danger)] hover:bg-[var(--danger-soft)] hover:text-[var(--danger)]"
                  >
                    <HiOutlineTrash className="h-5 w-5" />
                  </motion.button>
                </div>
              </div>
            ))}
          </div>
        </motion.section>
      )}

      <AnimatePresence>
        {deleteTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          >
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => !deleting && setDeleteTarget(null)}
            />
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              className="relative w-full max-w-md rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--bg-elevated)] p-6 shadow-[var(--shadow-lg)]"
            >
              <h3 className="font-display text-lg font-bold text-[var(--text-primary)]">Delete Report</h3>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">
                Are you sure you want to delete this report?
              </p>
              <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setDeleteTarget(null)}
                  disabled={deleting}
                  className="cp-btn-ghost w-full sm:w-auto"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDeleteReport}
                  disabled={deleting}
                  className="w-full rounded-xl bg-[var(--danger)] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50 sm:w-auto"
                >
                  {deleting ? "Deleting…" : "Delete"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid gap-8 lg:grid-cols-2">
        {REPORTS.map((r, i) => (
          <motion.article
            key={r.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="cp-surface overflow-hidden"
          >
            <div className="border-b border-[var(--border)] bg-[var(--bg-subtle)] px-4 py-3 sm:px-8 sm:py-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-bold uppercase tracking-widest text-[var(--text-tertiary)]">{r.type}</span>
                <span className="text-xs text-[var(--text-tertiary)]">{r.pages} pages</span>
              </div>
            </div>

            <div className="p-4 sm:p-6 md:p-8">
              <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">
                  <HiOutlineDocumentText className="h-7 w-7" />
                </div>
                <div>
                  <h2 className="font-display text-xl font-bold">{r.title}</h2>
                  <p className="mt-1 text-sm text-[var(--text-secondary)]">CloudPulse AI · {providerName}</p>
                </div>
              </div>

              <div className="mt-8 space-y-3 border-l-2 border-[var(--border)] pl-6">
                <PreviewRow label="Period" value="June 2026" />
                <PreviewRow label="Total spend" value={formatCurrency(metrics.monthlyCost)} />
                <PreviewRow label="Sustainability" value={`${metrics.greenScore}/100`} />
                <PreviewRow label="Recommendation" value={`Save ${formatCurrency(metrics.savings)}/mo`} highlight />
              </div>

              <div className="mt-6 flex flex-col gap-2 sm:mt-8 sm:flex-row sm:gap-3">
                <motion.button
                  type="button"
                  onClick={() => download(r.id, r.title)}
                  disabled={loading === r.id}
                  whileHover={{ scale: loading === r.id ? 1 : 1.02 }}
                  whileTap={{ scale: loading === r.id ? 1 : 0.98 }}
                  className="cp-btn-primary w-full flex-1 py-3 disabled:opacity-70 sm:w-auto"
                >
                  <HiOutlineArrowDownTray />
                  {loading === r.id ? "Preparing…" : "Export report"}
                </motion.button>
                <motion.button type="button" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="cp-btn-ghost w-full px-5 sm:w-auto">
                  Preview
                </motion.button>
              </div>
            </div>
          </motion.article>
        ))}
      </div>
    </div>
  );
};

const PreviewRow = ({ label, value, highlight }) => (
  <div className="flex justify-between gap-4 text-sm">
    <span className="text-[var(--text-tertiary)]">{label}</span>
    <span className={`font-semibold ${highlight ? "text-[var(--success)]" : "text-[var(--text-primary)]"}`}>{value}</span>
  </div>
);
