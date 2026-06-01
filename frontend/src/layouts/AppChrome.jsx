import { useState, useEffect } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ContentTransition } from "../ui/RouteTransition";
import {
  HiOutlineSquares2X2,
  HiOutlineChartBarSquare,
  HiOutlineDocumentChartBar,
  HiOutlineCog6Tooth,
  HiOutlineArrowLeft,
  HiOutlineBars3,
  HiOutlineXMark,
  HiOutlineArrowRightOnRectangle,
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
  const [menuOpen, setMenuOpen] = useState(false);
  const initials = user?.name?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "CP";

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const handleSignOut = () => {
    setMenuOpen(false);
    logout();
    navigate("/login");
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="cp-page-shell relative min-h-screen">
      <PremiumCanvas />

      <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--nav-bg)] backdrop-blur-2xl">
        <div className="mx-auto flex h-14 w-full max-w-[1440px] min-w-0 items-center gap-2 px-3 sm:h-[68px] sm:gap-3 sm:px-6">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] lg:hidden"
            aria-label="Open menu"
          >
            <HiOutlineBars3 className="h-5 w-5" />
          </button>

          <BrandMark size="sm" className="min-w-0 shrink" showWordmarkOnMobile={false} />

          <nav className="hidden min-w-0 flex-1 items-center justify-center gap-1 lg:flex">
            {NAV.map(({ to, label, icon: Icon }) => (
              <NavLink key={to} to={to} className="relative shrink-0 px-3 py-2 xl:px-4">
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
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="hidden xl:inline">{label}</span>
                    </span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="ml-auto flex min-w-0 shrink-0 items-center gap-1.5 sm:gap-2">
            <ThemeSwitch />
            <motion.button
              type="button"
              onClick={() => navigate("/workspace")}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="cp-btn-ghost hidden items-center gap-1 sm:inline-flex"
            >
              <HiOutlineArrowLeft className="h-4 w-4 shrink-0" />
              <span className="hidden md:inline">Environments</span>
            </motion.button>
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
              style={{ background: "linear-gradient(135deg, var(--accent), var(--cyan))" }}
              aria-hidden
            >
              {initials}
            </div>
            <button
              type="button"
              onClick={handleSignOut}
              className="cp-btn-ghost hidden shrink-0 text-sm lg:inline-flex"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm lg:hidden"
              aria-label="Close menu"
              onClick={closeMenu}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 400, damping: 35 }}
              className="fixed inset-y-0 left-0 z-50 flex w-[min(100vw-3rem,320px)] flex-col border-r border-[var(--border)] bg-[var(--bg-elevated)] shadow-[var(--shadow-lg)] lg:hidden"
            >
              <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-4">
                <BrandMark size="sm" />
                <button
                  type="button"
                  onClick={closeMenu}
                  className="flex h-10 w-10 items-center justify-center rounded-xl hover:bg-[var(--bg-subtle)]"
                  aria-label="Close menu"
                >
                  <HiOutlineXMark className="h-5 w-5" />
                </button>
              </div>

              {user?.name && (
                <p className="border-b border-[var(--border)] px-4 py-3 text-sm text-[var(--text-secondary)]">
                  Signed in as <span className="font-medium text-[var(--text-primary)]">{user.name}</span>
                </p>
              )}

              <nav className="flex-1 overflow-y-auto px-3 py-4">
                <ul className="space-y-1">
                  {NAV.map(({ to, label, icon: Icon }) => (
                    <li key={to}>
                      <NavLink
                        to={to}
                        onClick={closeMenu}
                        className={({ isActive }) =>
                          `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${
                            isActive
                              ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                              : "text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]"
                          }`
                        }
                      >
                        <Icon className="h-5 w-5 shrink-0" />
                        {label}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </nav>

              <div className="space-y-2 border-t border-[var(--border)] p-4">
                <button
                  type="button"
                  onClick={() => {
                    closeMenu();
                    navigate("/workspace");
                  }}
                  className="cp-btn-ghost flex w-full items-center justify-center gap-2"
                >
                  <HiOutlineArrowLeft className="h-4 w-4" />
                  Environments
                </button>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--danger)] bg-[var(--danger-soft)] px-4 py-3 text-sm font-semibold text-[var(--danger)]"
                >
                  <HiOutlineArrowRightOnRectangle className="h-5 w-5" />
                  Sign out
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <main className="relative z-10 mx-auto w-full max-w-[1440px] min-w-0 px-3 py-5 pb-24 sm:px-6 sm:py-10 sm:pb-10">
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
