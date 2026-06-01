import { motion } from "framer-motion";

const sizes = { sm: 32, md: 40, lg: 48 };

export const BrandMark = ({ size = "md", showWordmark = true, showWordmarkOnMobile = true, className = "" }) => {
  const px = sizes[size] || sizes.md;
  return (
    <motion.div className={`flex min-w-0 items-center gap-2 sm:gap-3 ${className}`} whileHover={{ opacity: 0.92 }}>
      <div
        className="relative flex shrink-0 items-center justify-center overflow-hidden rounded-[14px]"
        style={{
          width: px + 8,
          height: px + 8,
          background: "linear-gradient(145deg, var(--accent) 0%, var(--cyan) 100%)",
          boxShadow: "var(--shadow-glow)",
        }}
      >
        <svg width={px * 0.55} height={px * 0.4} viewBox="0 0 48 32" fill="none">
          <ellipse cx="16" cy="22" rx="12" ry="7" fill="white" fillOpacity="0.95" />
          <ellipse cx="28" cy="18" rx="14" ry="8" fill="white" />
          <ellipse cx="36" cy="22" rx="10" ry="6" fill="white" fillOpacity="0.85" />
        </svg>
      </div>
      {showWordmark && (
        <div className={`min-w-0 leading-tight ${showWordmarkOnMobile ? "" : "hidden sm:block"}`}>
          <span className="font-display text-base font-bold tracking-tight text-[var(--text-primary)] sm:text-lg">
            CloudPulse
          </span>
          <span className="font-display text-base font-bold tracking-tight cp-gradient-text sm:text-lg"> AI</span>
        </div>
      )}
    </motion.div>
  );
};
