import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { HiOutlineArrowRight, HiOutlineShieldCheck } from "react-icons/hi2";
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
  const [registerStep, setRegisterStep] = useState("form");
  const [pendingEmail, setPendingEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [login, setLogin] = useState({ email: "", password: "", remember: true });
  const [register, setRegister] = useState({ name: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { login: doLogin, register: doRegister, verifyOtp, resendOtp } = useAuth();
  const navigate = useNavigate();
  const { isEnvironmentReady } = useCloud();

  const goNext = () => {
    if (isEnvironmentReady) navigate("/dashboard");
    else navigate("/workspace");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    if (!login.email || !login.password) {
      setError("Enter your email and password.");
      return;
    }
    setSubmitting(true);
    try {
      const result = await doLogin(login.email, login.password);
      if (result?.requiresOtp) {
        setPendingEmail(result.email);
        setRegisterStep("otp");
        setTab("register");
        setError(result.error || "");
      } else {
        goNext();
      }
    } catch (err) {
      setError(err.message || "Login failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
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
      setPendingEmail(data.email);
      setRegisterStep("otp");
      setError("");
    } catch (err) {
      setError(err.message || "Registration failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    if (!otp || otp.length !== 6) {
      setError("Enter the 6-digit verification code.");
      return;
    }
    setSubmitting(true);
    try {
      await verifyOtp(pendingEmail, otp);
      navigate("/workspace");
    } catch (err) {
      setError(err.message || "Invalid verification code.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    setError("");
    setSubmitting(true);
    try {
      await resendOtp(pendingEmail);
      setError("");
    } catch (err) {
      setError(err.message || "Could not resend code.");
    } finally {
      setSubmitting(false);
    }
  };

  const showOtp = registerStep === "otp";

  return (
    <div className="relative min-h-screen">
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

        <section className="flex items-center justify-center p-6 sm:p-10 lg:p-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="cp-glass w-full max-w-[440px] rounded-[var(--radius-xl)] p-8 sm:p-10"
          >
            <div className="mb-8 lg:hidden">
              <BrandMark />
            </div>

            {showOtp ? (
              <>
                <h2 className="font-display text-2xl font-bold text-[var(--text-primary)]">Verify your email</h2>
                <p className="mt-2 text-sm text-[var(--text-secondary)]">
                  Enter the 6-digit code sent to <strong className="text-[var(--text-primary)]">{pendingEmail}</strong>.
                  Check your inbox and spam folder. Code expires in 5 minutes.
                </p>
                {error && (
                  <p className="mt-4 rounded-lg bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]">{error}</p>
                )}
                <form onSubmit={handleVerifyOtp} autoComplete="off" className="mt-6 space-y-4">
                  <PremiumInput
                    name="otp-code"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="Enter 6-digit code"
                    autoComplete="one-time-code"
                    required
                  />
                  <motion.button
                    type="submit"
                    disabled={submitting}
                    whileHover={{ scale: submitting ? 1 : 1.01 }}
                    whileTap={{ scale: submitting ? 1 : 0.99 }}
                    className="cp-btn-primary w-full py-3.5"
                  >
                    {submitting ? "Verifying…" : <>Verify email <HiOutlineArrowRight /></>}
                  </motion.button>
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={handleResendOtp}
                    className="w-full text-center text-sm text-[var(--accent)] hover:underline"
                  >
                    Resend code
                  </button>
                </form>
              </>
            ) : (
              <>
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
                      onClick={() => { setTab(t); setError(""); setRegisterStep("form"); }}
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
                        {submitting ? "Sending code…" : <>Create account <HiOutlineArrowRight /></>}
                      </motion.button>
                    </motion.form>
                  )}
                </AnimatePresence>
              </>
            )}

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
