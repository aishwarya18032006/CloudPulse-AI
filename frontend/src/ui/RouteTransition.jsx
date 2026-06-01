import { useEffect } from "react";
import { motion } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1];

export const pageTransition = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.4, ease: EASE },
};

export const RouteTransition = ({ children, className = "" }) => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <motion.div
      {...pageTransition}
      className={className}
      style={{ willChange: "opacity, transform" }}
    >
      {children}
    </motion.div>
  );
};

export const ContentTransition = ({ children, className = "" }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -8 }}
    transition={{ duration: 0.4, ease: EASE }}
    className={className}
    style={{ willChange: "opacity, transform" }}
  >
    {children}
  </motion.div>
);
