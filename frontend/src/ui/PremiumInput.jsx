import { useState } from "react";
import { motion } from "framer-motion";

export const PremiumInput = ({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  required,
  autoComplete = "off",
  name,
  id,
  error = false,
}) => {
  const [readOnly, setReadOnly] = useState(true);
  const inputId = id || name || `input-${Math.random().toString(36).slice(2)}`;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="mb-2 block text-sm font-medium text-[var(--text-secondary)]">
          {label}
        </label>
      )}
      <motion.input
        id={inputId}
        name={name || inputId}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        autoComplete={autoComplete}
        placeholder={placeholder}
        readOnly={readOnly}
        onFocus={() => setReadOnly(false)}
        data-lpignore="true"
        data-1p-ignore="true"
        data-form-type="other"
        whileFocus={{ scale: 1.005 }}
        transition={{ duration: 0.2 }}
        className={`cp-input w-full${error ? " !border-[var(--danger)] focus:!border-[var(--danger)] focus:!shadow-[0_0_0_4px_var(--danger-soft)]" : ""}`}
      />
    </div>
  );
};
