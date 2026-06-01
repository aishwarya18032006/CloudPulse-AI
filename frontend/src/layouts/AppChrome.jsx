import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ContentTransition } from "../ui/RouteTransition";
import {
  HiOutlineSquares2X2,
  HiOutlineChartBarSquare,
  HiOutlineDocumentChartBar,
  HiOutlineCog6Tooth,
  HiOutlineArrowLeft,
} from "react-icons/hi2";
import { PremiumCanvas } from "../ui/PremiumCanvas";
import { BrandMark } from "../ui/BrandMark";
import { ThemeSwitch } from "../ui/ThemeSwitch";
import { AIAssistant } from "../features/assistant/Copilot";
import { useAuth } from "../context/AuthContext";

const NAV = [
  { to: "/dashboard", label: "Overview", icon: HiOutlineSquares2X2 },
  { to: "/analytics", label: "Analytics", icon: HiOutlineChartBarSquare },
  { to: "/reports", label: "Reports", icon: HiOutlineDocumentChartBar },
  { to: "/settings", label: "Settings", icon: HiOutlineCog6Tooth },
];

export const AppChrome = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const initials = user?.name?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "CP";

  return (
    <div className="relative min-h-screen">
      <PremiumCanvas />

      <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--nav-bg)] backdrop-blur-2xl">
        <div className="mx-auto flex h-[68px] max-w-[1440px] items-center gap-3 px-4 sm:gap-6 sm:px-6">
          <BrandMark size="sm" />

          <nav className="hidden flex-1 items-center justify-center gap-1 md:flex">
            {NAV.map(({ to, label, icon: Icon }) => (
              <NavLink key={to} to={to} className="relative px-4 py-2">
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <motion.div
                        layoutId="navPill"
                        className="absolute inset-0 rounded-xl bg-[var(--accent-soft)]"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                    <span
                      className={`cp-nav-link relative z-10 flex items-center gap-2 text-sm font-semibold ${
                        isActive ? "text-[var(--accent)]" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {label}
                    </span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <ThemeSwitch />
            <motion.button
              type="button"
              onClick={() => navigate("/workspace")}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="cp-btn-ghost hidden items-center gap-1 sm:flex"
            >
              <HiOutlineArrowLeft className="h-4 w-4" /> Environments
            </motion.button>
            <div
              className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-white"
              style={{ background: "linear-gradient(135deg, var(--accent), var(--cyan))" }}
            >
              {initials}
            </div>
            <button type="button" onClick={() => { logout(); navigate("/login"); }} className="cp-btn-ghost hidden text-sm sm:inline-flex">
              Sign out
            </button>
          </div>
        </div>

        <nav className="flex gap-1 overflow-x-auto border-t border-[var(--border)] px-4 py-2 md:hidden">
          {NAV.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold ${isActive ? "bg-[var(--accent-soft)] text-[var(--accent)]" : "text-[var(--text-secondary)]"}`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="relative z-10 mx-auto max-w-[1440px] px-4 py-6 sm:px-6 sm:py-10">
        <AnimatePresence mode="wait">
          <ContentTransition key={location.pathname}>
            <Outlet />
          </ContentTransition>
        </AnimatePresence>
      </main>

      <AIAssistant />
    </div>
  );
};
