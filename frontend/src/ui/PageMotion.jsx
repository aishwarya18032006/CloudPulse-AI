import { motion } from "framer-motion";

/** @deprecated Use RouteTransition / ContentTransition for page-level motion */
export const PageMotion = ({ children, className = "" }) => <div className={className}>{children}</div>;

export const Stagger = ({ children, className = "" }) => (
  <motion.div
    initial="hidden"
    animate="show"
    variants={{
      hidden: {},
      show: { transition: { staggerChildren: 0.06 } },
    }}
    className={className}
  >
    {children}
  </motion.div>
);

export const StaggerItem = ({ children, className = "" }) => (
  <motion.div
    variants={{
      hidden: { opacity: 0, y: 16 },
      show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
    }}
    className={className}
  >
    {children}
  </motion.div>
);
