import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { AppChrome } from "../layouts/AppChrome";
import { AuthPage } from "../pages/AuthPage";
import { WorkspacePage } from "../pages/WorkspacePage";
import { DashboardPage } from "../pages/DashboardPage";
import { AnalyticsPage } from "../pages/AnalyticsPage";
import { ReportsPage } from "../pages/ReportsPage";
import { SettingsPage } from "../pages/SettingsPage";
import { RouteTransition } from "../ui/RouteTransition";
import { useAuth } from "../context/AuthContext";
import { getAuthToken } from "../services/api";
import { useCloud } from "../context/CloudContext";

const Protected = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg-base)]">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated || !getAuthToken()) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const NeedsEnvironment = ({ children }) => {
  const { isEnvironmentReady } = useCloud();
  if (!isEnvironmentReady) return <Navigate to="/workspace" replace />;
  return children;
};

export const AppRoutes = () => {
  const location = useLocation();
  const { isAuthenticated, loading } = useAuth();
  const { isEnvironmentReady } = useCloud();

  if (loading && location.pathname !== "/login") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg-base)]">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" />
      </div>
    );
  }

  if (isAuthenticated && getAuthToken() && (location.pathname === "/login" || location.pathname === "/")) {
    return <Navigate to={isEnvironmentReady ? "/dashboard" : "/workspace"} replace />;
  }

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/login"
          element={
            <RouteTransition className="min-h-screen">
              <AuthPage />
            </RouteTransition>
          }
        />
        <Route path="/register" element={<Navigate to="/login?tab=register" replace />} />

        <Route
          path="/workspace"
          element={
            <Protected>
              <RouteTransition className="min-h-screen">
                <WorkspacePage />
              </RouteTransition>
            </Protected>
          }
        />

        <Route path="/cloud-selection" element={<Navigate to="/workspace" replace />} />

        <Route
          element={
            <Protected>
              <NeedsEnvironment>
                <AppChrome />
              </NeedsEnvironment>
            </Protected>
          }
        >
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>

        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AnimatePresence>
  );
};
