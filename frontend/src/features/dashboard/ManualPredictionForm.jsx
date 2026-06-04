import { useState } from "react";
import { motion } from "framer-motion";
import { api } from "../../services/api";

export const ManualPredictionForm = ({ onPredictionResult }) => {
  const [formData, setFormData] = useState({
    cpu_usage: 50,
    memory_usage: 60,
    storage: 100,
    compute_hours: 730,
    data_transfer: 10,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: parseFloat(value) || 0
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const prediction = await api.predictCost(formData);
      setResult(prediction);
      if (onPredictionResult) {
        onPredictionResult(prediction, formData);
      }
    } catch (err) {
      setError(err.message || "Failed to get prediction");
      console.error("Prediction error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="cp-surface p-5 sm:p-8"
    >
      <h2 className="font-display text-xl font-bold text-[var(--text-primary)] mb-6">
        Manual Cost Prediction
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
              CPU Usage (%)
            </label>
            <input
              type="range"
              name="cpu_usage"
              min="0"
              max="100"
              value={formData.cpu_usage}
              onChange={handleChange}
              className="w-full"
            />
            <span className="text-xs text-[var(--text-secondary)] mt-1">{formData.cpu_usage}%</span>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
              Memory Usage (%)
            </label>
            <input
              type="range"
              name="memory_usage"
              min="0"
              max="100"
              value={formData.memory_usage}
              onChange={handleChange}
              className="w-full"
            />
            <span className="text-xs text-[var(--text-secondary)] mt-1">{formData.memory_usage}%</span>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
              Storage (GB)
            </label>
            <input
              type="number"
              name="storage"
              min="0"
              value={formData.storage}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--bg-input)] text-[var(--text-primary)]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
              Compute Hours/Month
            </label>
            <input
              type="number"
              name="compute_hours"
              min="0"
              value={formData.compute_hours}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--bg-input)] text-[var(--text-primary)]"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
              Data Transfer (GB)
            </label>
            <input
              type="number"
              name="data_transfer"
              min="0"
              value={formData.data_transfer}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--bg-input)] text-[var(--text-primary)]"
            />
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-3 bg-[var(--accent)] text-white rounded-lg font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {loading ? "Predicting..." : "Get Prediction"}
        </button>
      </form>

      {result && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-4 bg-[var(--bg-subtle)] border border-[var(--border)] rounded-lg"
        >
          <h3 className="text-sm font-medium text-[var(--text-primary)] mb-2">Predicted Monthly Cost</h3>
          <p className="text-3xl font-bold text-[var(--accent)]">
            ₹{result.predicted_cost?.toFixed(2) || "0.00"}
          </p>
          <p className="text-xs text-[var(--text-secondary)] mt-2">
            Based on: CPU {formData.cpu_usage}% • Memory {formData.memory_usage}% • Storage {formData.storage}GB
          </p>
        </motion.div>
      )}
    </motion.section>
  );
};
