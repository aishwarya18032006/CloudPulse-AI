import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HiOutlineXMark, HiOutlineArrowUpTray } from "react-icons/hi2";
import { PremiumInput } from "../../ui/PremiumInput";
import { validateCloudCredentials } from "../../utils/cloudCredentials";

const PLACEHOLDERS = {
  accessKey: "Enter AWS access key",
  secretKey: "Enter AWS secret key",
  region: "e.g. ap-south-1",
  tenantId: "Enter Azure tenant ID",
  subscriptionId: "Enter Azure subscription ID",
  clientId: "Enter Azure client ID",
  clientSecret: "Enter Azure client secret",
  projectId: "Enter Google Cloud project ID",
};

const SCHEMA = {
  aws: [
    { key: "accessKey", label: "Access Key ID" },
    { key: "secretKey", label: "Secret Access Key", type: "password" },
    { key: "region", label: "Default Region", optional: true },
  ],
  azure: [
    { key: "subscriptionId", label: "Subscription ID" },
    { key: "tenantId", label: "Tenant ID" },
    { key: "clientId", label: "Client ID" },
    { key: "clientSecret", label: "Client Secret", type: "password" },
  ],
  gcp: [
    { key: "projectId", label: "Project ID" },
    { key: "keyFile", label: "Service Account Key", file: true },
  ],
};

const TITLES = { aws: "Amazon Web Services", azure: "Microsoft Azure", gcp: "Google Cloud" };

export const ConnectDialog = ({ provider, onClose, onSuccess }) => {
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  if (!provider) return null;

  const fields = SCHEMA[provider] || [];

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (fieldErrors[key]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
    if (error) setError("");
  };

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => updateField("keyFile", reader.result);
    reader.readAsText(file);
  };

  const submit = (e) => {
    e.preventDefault();
    const { valid, fieldErrors: nextFieldErrors, message } = validateCloudCredentials(provider, form);

    if (!valid) {
      setFieldErrors(nextFieldErrors);
      setError(message);
      return;
    }

    setError("");
    setFieldErrors({});
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onSuccess(provider, { ...form });
    }, 1400);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.35 }}
        className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto bg-black/40 p-3 backdrop-blur-md sm:items-center sm:p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.97, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.97, y: 12 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          onClick={(e) => e.stopPropagation()}
          className="cp-glass max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-[var(--radius-xl)] p-5 sm:max-h-none sm:p-8"
        >
          <div className="flex items-start justify-between">
            <div>
              <h2 className="font-display text-xl font-bold">Connect {TITLES[provider]}</h2>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">Credentials are encrypted in transit.</p>
            </div>
            <motion.button
              type="button"
              onClick={onClose}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="rounded-lg p-2 text-[var(--text-tertiary)] hover:bg-[var(--bg-subtle)]"
            >
              <HiOutlineXMark className="h-5 w-5" />
            </motion.button>
          </div>

          <form onSubmit={submit} autoComplete="off" className="mt-6 space-y-4">
            {fields.map((f) => (
              <div key={f.key}>
                {f.file ? (
                  <>
                    <label className="mb-2 block text-sm font-medium text-[var(--text-secondary)]">{f.label}</label>
                    <motion.label
                      whileHover={{ borderColor: fieldErrors.keyFile ? "var(--danger)" : "var(--accent)" }}
                      className={`flex cursor-pointer flex-col items-center rounded-xl border-2 border-dashed bg-[var(--bg-subtle)] py-10 transition-colors duration-300 ${
                        fieldErrors.keyFile ? "border-[var(--danger)]" : "border-[var(--border)]"
                      }`}
                    >
                      <HiOutlineArrowUpTray className="h-8 w-8 text-[var(--accent)]" />
                      <span className="mt-2 text-sm text-[var(--text-tertiary)] opacity-60">
                        {form.keyFile ? "Service account key selected" : "Upload service account JSON"}
                      </span>
                      <input type="file" accept=".json" className="hidden" onChange={handleFile} />
                    </motion.label>
                  </>
                ) : (
                  <PremiumInput
                    label={f.label}
                    type={f.type || "text"}
                    name={`cp-cloud-${f.key}`}
                    value={form[f.key] || ""}
                    onChange={(e) => updateField(f.key, e.target.value)}
                    placeholder={PLACEHOLDERS[f.key] || `Enter ${f.label.toLowerCase()}`}
                    autoComplete="off"
                    error={!!fieldErrors[f.key]}
                  />
                )}
              </div>
            ))}

            {error && (
              <p className="rounded-lg bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]">{error}</p>
            )}

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.01 }}
              whileTap={{ scale: loading ? 1 : 0.99 }}
              className="cp-btn-primary w-full py-3.5 disabled:opacity-70"
            >
              {loading ? "Establishing connection…" : "Connect environment"}
            </motion.button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
