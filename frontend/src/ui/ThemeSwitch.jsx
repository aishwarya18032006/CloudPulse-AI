import { motion } from "framer-motion";
import { HiOutlineMoon, HiOutlineSun } from "react-icons/hi2";
import { useTheme } from "../context/ThemeContext";

export const ThemeSwitch = ({ className = "" }) => {
  const { theme, toggleTheme } = useTheme();
  const dark = theme === "dark";

  return (
    <motion.button
      type="button"
      onClick={toggleTheme}
      className={`relative flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-secondary)] shadow-[var(--shadow-xs)] transition-colors hover:text-[var(--accent)] ${className}`}
      whileTap={{ scale: 0.94 }}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <motion.span
        key={theme}
        initial={{ rotate: -90, opacity: 0 }}
        animate={{ rotate: 0, opacity: 1 }}
        transition={{ duration: 0.25 }}
      >
        {dark ? <HiOutlineSun className="h-5 w-5" /> : <HiOutlineMoon className="h-5 w-5" />}
      </motion.span>
    </motion.button>
  );
};
