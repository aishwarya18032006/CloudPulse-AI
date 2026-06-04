import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { HiOutlineArrowRight, HiOutlineShieldCheck } from "react-icons/hi2";
import { FaGoogle } from "react-icons/fa6";
import { PremiumCanvas } from "../ui/PremiumCanvas";
import { BrandMark } from "../ui/BrandMark";
import { ThemeSwitch } from "../ui/ThemeSwitch";
import { PremiumInput } from "../ui/PremiumInput";
import { useAuth } from "../context/AuthContext";
import { useCloud } from "../context/CloudContext";

const HERO_STATS = [
  { value: "₹2.4M+", label: "Cloud Cost Optimized" },
  { value: "35%", label: "Average Savings" },
  { value: "98%", label: "Prediction Accuracy" },
];

const FloatingMetric = ({ label, value, style, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.6 }}
    className="cp-glass absolute rounded-2xl px-4 py-3 shadow-[var(--shadow-md)]"
    style={style}
  >
    <p className="font-display text-lg font-bold text-[var(--text-primary)]">{value}</p>
    <p className="text-xs text-[var(--text-secondary)]">{label}</p>
  </motion.div>
);

export const AuthPage = () => {
  const [params] = useSearchParams();
  const initialTab = params.get("tab") === "register" ? "register" : "login";
  const [tab, setTab] = useState(initialTab);
  const [login, setLogin] = useState({ email: "", password: "", remember: true });
  const [register, setRegister] = useState({ name: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { login: doLogin, register: doRegister, googleLogin: doGoogleLogin } = useAuth();
  const navigate = useNavigate();
  const { isEnvironmentReady } = useCloud();

  // Initialize Google Sign-In
  useEffect(() => {
    if (window.google?.accounts?.id) {
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: handleGoogleResponse,
      });
    }
  }, []);

  const goNext = () => {
    if (isEnvironmentReady) navigate("/dashboard");
    else navigate("/workspace");
  };

  const handleGoogleResponse = async (response) => {
    if (!response.credential) {
      setError("Failed to retrieve Google credentials. Please try again.");
      return;
    }

    setError("");
    setSuccessMessage("");
    setGoogleLoading(true);

    try {
      // Decode the JWT token from Google (without verification on client side - backend will handle)
      const base64Url = response.credential.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      const userData = JSON.parse(jsonPayload);

      // Call backend to login/register with Google
      await doGoogleLogin(
        response.credential,
        userData.name,
        userData.email,
        userData.picture
      );
      goNext();
    } catch (err) {
      console.error("Google login error:", err);
      setError(err.message || "Google login failed. Please try again.");
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    if (window.google?.accounts?.id) {
      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          // Prompt wasn't displayed, fallback to click-based flow
          window.google.accounts.id.renderButton(
            document.getElementById("google-signin-button"),
            { theme: "outline", size: "large", width: "100%" }
          );
          document.getElementById("google-signin-button").click();
        }
      });
    } else {
      setError("Google Sign-In is not available. Please check your connection.");
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    if (!login.email || !login.password) {
      setError("Enter your email and password.");
      return;
    }
    setSubmitting(true);
    try {
      await doLogin(login.email, login.password);
      goNext();
    } catch (err) {
      setError(err.message || "Login failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    if (!register.name || !register.email || !register.password) {
      setError("All fields are required.");
      return;
    }
    if (register.password !== register.confirm) {
      setError("Passwords do not match.");
      return;
    }
    setSubmitting(true);
    try {
      const data = await doRegister(register.name, register.email, register.password);
      setLogin((prev) => ({ ...prev, email: register.email }));
      setRegister({ name: "", email: "", password: "", confirm: "" });
      setTab("login");
      setSuccessMessage(data.message || "Account created successfully. Please sign in.");
    } catch (err) {
      setError(err.message || "Registration failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="cp-page-shell relative min-h-screen overflow-x-hidden">
      <PremiumCanvas />
      <div className="absolute right-6 top-6 z-20">
        <ThemeSwitch />
      </div>

      <div className="relative z-10 grid min-h-screen lg:grid-cols-2">
        <section className="relative hidden flex-col justify-between overflow-hidden p-12 lg:flex xl:p-16">
          <BrandMark size="lg" />
          <div className="relative max-w-xl">
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent)]"
            >
              Cloud Intelligence For Modern Enterprises
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="font-display text-5xl font-extrabold leading-[1.08] tracking-tight text-[var(--text-primary)] xl:text-6xl"
            >
              Predict costs.
              <br />
              Reduce waste.
              <br />
              <span className="cp-gradient-text">Improve sustainability.</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 }}
              className="mt-6 text-lg text-[var(--text-secondary)]"
            >
              The multi-cloud FinOps platform trusted by engineering teams optimizing spend and carbon at scale.
            </motion.p>
            <div className="relative mt-16 h-64">
              <FloatingMetric label="Monthly forecast" value="₹31.2K" style={{ top: 0, left: 0 }} delay={0.4} />
              <FloatingMetric label="Carbon score" value="86/100" style={{ top: 40, right: 0 }} delay={0.55} />
              <FloatingMetric label="Idle resources" value="3 VMs" style={{ bottom: 20, left: 40 }} delay={0.7} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-6 border-t border-[var(--border)] pt-10">
            {HERO_STATS.map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 + i * 0.08 }}>
                <p className="font-display text-2xl font-bold text-[var(--text-primary)]">{s.value}</p>
                <p className="mt-1 text-sm text-[var(--text-secondary)]">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="flex items-center justify-center p-4 sm:p-10 lg:p-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="cp-glass w-full max-w-[440px] min-w-0 rounded-[var(--radius-xl)] p-6 sm:p-10"
          >
            <div className="mb-8 lg:hidden">
              <BrandMark />
            </div>

            <h2 className="font-display text-2xl font-bold text-[var(--text-primary)]">
              {tab === "login" ? "Welcome back" : "Create your workspace"}
            </h2>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              {tab === "login"
                ? "Sign in to access your cloud intelligence dashboard."
                : "Start optimizing cloud costs in minutes."}
            </p>

            <div className="mt-8 flex rounded-xl bg-[var(--bg-subtle)] p-1">
              {["login", "register"].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    setTab(t);
                    setError("");
                    setSuccessMessage("");
                    setOauthNotice("");
                  }}
                  className={`relative flex-1 rounded-lg py-2.5 text-sm font-semibold transition-colors ${
                    tab === t ? "text-[var(--text-primary)]" : "text-[var(--text-tertiary)]"
                  }`}
                >
                  {tab === t && (
                    <motion.div
                      layoutId="authTab"
                      className="absolute inset-0 rounded-lg bg-[var(--bg-elevated)] shadow-[var(--shadow-sm)]"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{t === "login" ? "Sign in" : "Register"}</span>
                </button>
              ))}
            </div>

            {successMessage && tab === "login" && (
              <p className="mt-4 rounded-lg bg-[var(--success-soft)] px-3 py-2 text-sm text-[var(--success)]">
                {successMessage}
              </p>
            )}

            {error && (
              <p className="mt-4 rounded-lg bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]">{error}</p>
            )}

            <AnimatePresence mode="wait">
              {tab === "login" ? (
                <motion.form
                  key="login"
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 8 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  onSubmit={handleLogin}
                  autoComplete="off"
                  className="mt-6 space-y-4"
                >
                  <PremiumInput
                    type="email"
                    name="cp-login-email"
                    value={login.email}
                    onChange={(e) => setLogin({ ...login, email: e.target.value })}
                    placeholder="Enter your email"
                    autoComplete="off"
                    required
                  />
                  <PremiumInput
                    type="password"
                    name="cp-login-password"
                    value={login.password}
                    onChange={(e) => setLogin({ ...login, password: e.target.value })}
                    placeholder="Enter your password"
                    autoComplete="new-password"
                    required
                  />
                  <label className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                    <input
                      type="checkbox"
                      checked={login.remember}
                      onChange={(e) => setLogin({ ...login, remember: e.target.checked })}
                      className="rounded border-[var(--border)] accent-[var(--accent)]"
                    />
                    Remember this device
                  </label>
                  <motion.button
                    type="submit"
                    disabled={submitting}
                    whileHover={{ scale: submitting ? 1 : 1.01 }}
                    whileTap={{ scale: submitting ? 1 : 0.99 }}
                    className="cp-btn-primary w-full py-3.5"
                  >
                    {submitting ? "Signing in…" : <>Sign in <HiOutlineArrowRight /></>}
                  </motion.button>
                </motion.form>
              ) : (
                <motion.form
                  key="register"
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 8 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  onSubmit={handleRegister}
                  autoComplete="off"
                  className="mt-6 space-y-4"
                >
                  <PremiumInput
                    name="cp-register-name"
                    value={register.name}
                    onChange={(e) => setRegister({ ...register, name: e.target.value })}
                    placeholder="Enter your full name"
                    autoComplete="off"
                    required
                  />
                  <PremiumInput
                    type="email"
                    name="cp-register-email"
                    value={register.email}
                    onChange={(e) => setRegister({ ...register, email: e.target.value })}
                    placeholder="Enter your email"
                    autoComplete="off"
                    required
                  />
                  <PremiumInput
                    type="password"
                    name="cp-register-password"
                    value={register.password}
                    onChange={(e) => setRegister({ ...register, password: e.target.value })}
                    placeholder="Enter your password"
                    autoComplete="new-password"
                    required
                  />
                  <PremiumInput
                    type="password"
                    name="cp-register-confirm"
                    value={register.confirm}
                    onChange={(e) => setRegister({ ...register, confirm: e.target.value })}
                    placeholder="Confirm your password"
                    autoComplete="new-password"
                    required
                  />
                  <motion.button
                    type="submit"
                    disabled={submitting}
                    whileHover={{ scale: submitting ? 1 : 1.01 }}
                    whileTap={{ scale: submitting ? 1 : 0.99 }}
                    className="cp-btn-primary w-full py-3.5"
                  >
                    {submitting ? "Creating account…" : <>Create account <HiOutlineArrowRight /></>}
                  </motion.button>
                </motion.form>
              )}
            </AnimatePresence>

            <div className="relative my-8 flex items-center gap-3">
              <div className="h-px flex-1 bg-[var(--border)]" />
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
                OR
              </span>
              <div className="h-px flex-1 bg-[var(--border)]" />
            </div>

            <div className="grid gap-3">
              <motion.button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={googleLoading}
                whileHover={{ scale: !googleLoading ? 1.01 : 1 }}
                whileTap={{ scale: !googleLoading ? 0.99 : 1 }}
                className="cp-btn-ghost w-full justify-center gap-3 border-[var(--border)] py-3"
              >
                <FaGoogle className="h-5 w-5 text-[#4285F4]" />
                {googleLoading ? "Signing in…" : "Continue with Google"}
              </motion.button>
              <div id="google-signin-button" style={{ display: "none" }} />
            </div>

            <p className="mt-8 flex items-center justify-center gap-2 text-xs text-[var(--text-tertiary)]">
              <HiOutlineShieldCheck className="h-4 w-4" />
              SOC 2 ready · Enterprise encryption
            </p>
          </motion.div>
        </section>
      </div>
    </div>
  );
};
