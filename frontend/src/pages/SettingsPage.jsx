import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTheme } from "../context/ThemeContext";
import { useToast } from "../context/ToastContext";
import { api } from "../services/api";

export const SettingsPage = () => {
  const { theme, setTheme } = useTheme();
  const { showToast } = useToast();

  const [profile, setProfile] = useState({
    display_name: "",
    email: "",
    organization: "",
    role: "",
  });
  const [profileLoading, setProfileLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);

  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  const [savingPassword, setSavingPassword] = useState(false);

  const [notif, setNotif] = useState({ cost: true, idle: true, carbon: false, digest: true });
  const [emailPrefs, setEmailPrefs] = useState({ reports: true, product: false, security: true });

  useEffect(() => {
    const load = async () => {
      try {
        const { profile: p } = await api.getProfile();
        setProfile({
          display_name: p.display_name || "",
          email: p.email || "",
          organization: p.organization || "",
          role: p.role || "",
        });
      } catch {
        showToast("Could not load profile.", "error");
      } finally {
        setProfileLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveProfile = async () => {
    if (!profile.display_name.trim()) {
      showToast("Display name is required.", "error");
      return;
    }
    setSavingProfile(true);
    try {
      const data = await api.updateProfile({
        display_name: profile.display_name,
        organization: profile.organization,
        role: profile.role,
      });
      setProfile((p) => ({ ...p, ...data.profile }));
      showToast("Profile updated successfully");
    } catch (err) {
      showToast(err.message || "Failed to save profile.", "error");
    } finally {
      setSavingProfile(false);
    }
  };

  const updatePassword = async () => {
    if (!passwords.current) {
      showToast("Current password is required.", "error");
      return;
    }
    if (passwords.new.length < 8) {
      showToast("New password must be at least 8 characters.", "error");
      return;
    }
    if (passwords.new !== passwords.confirm) {
      showToast("Confirm password must match new password.", "error");
      return;
    }
    setSavingPassword(true);
    try {
      await api.changePassword({
        currentPassword: passwords.current,
        newPassword: passwords.new,
        confirmPassword: passwords.confirm,
      });
      setPasswords({ current: "", new: "", confirm: "" });
      showToast("Password updated successfully");
    } catch (err) {
      showToast(err.message || "Failed to update password.", "error");
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="min-w-0">
      <header className="mb-8 sm:mb-10">
        <h1 className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl">Settings</h1>
        <p className="mt-2 text-sm text-[var(--text-secondary)] sm:text-base">Workspace, appearance & notifications</p>
      </header>

      <div className="grid min-w-0 gap-6 lg:grid-cols-[240px_1fr] xl:grid-cols-[280px_1fr]">
        <nav className="hidden lg:block">
          <ul className="sticky top-28 space-y-1">
            {["Profile", "Appearance", "Notifications", "Email", "Security"].map((item, i) => (
              <li key={item}>
                <a
                  href={`#${item.toLowerCase()}`}
                  className={`block rounded-xl px-4 py-2.5 text-sm font-semibold ${
                    i === 0 ? "bg-[var(--accent-soft)] text-[var(--accent)]" : "text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]"
                  }`}
                >
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="min-w-0 space-y-6">
          <Section id="profile" title="Profile" description="Your account identity">
            {profileLoading ? (
              <p className="text-sm text-[var(--text-secondary)]">Loading profile…</p>
            ) : (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field
                    label="Display name"
                    placeholder="Enter your full name"
                    value={profile.display_name}
                    onChange={(v) => setProfile((p) => ({ ...p, display_name: v }))}
                  />
                  <Field label="Email" type="email" value={profile.email} readOnly placeholder="Email address" />
                  <Field
                    label="Organization"
                    placeholder="Enter organization name"
                    value={profile.organization}
                    onChange={(v) => setProfile((p) => ({ ...p, organization: v }))}
                  />
                  <Field
                    label="Role"
                    placeholder="Enter your role"
                    value={profile.role}
                    onChange={(v) => setProfile((p) => ({ ...p, role: v }))}
                  />
                </div>
                <motion.button
                  type="button"
                  onClick={saveProfile}
                  disabled={savingProfile}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="cp-btn-primary mt-6 disabled:opacity-60"
                >
                  {savingProfile ? "Saving…" : "Save changes"}
                </motion.button>
              </>
            )}
          </Section>

          <Section id="appearance" title="Appearance" description="Theme affects every surface, chart & shadow">
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { id: "light", label: "Light", desc: "Default · optimized for demos" },
                { id: "dark", label: "Dark", desc: "Low-light operations" },
              ].map((t) => (
                <motion.button
                  key={t.id}
                  type="button"
                  onClick={() => setTheme(t.id)}
                  whileHover={{ y: -2 }}
                  transition={{ duration: 0.3 }}
                  className={`rounded-2xl border p-4 text-left transition-all duration-300 sm:p-5 ${
                    theme === t.id
                      ? "border-[var(--accent)] bg-[var(--accent-soft)] shadow-[var(--shadow-glow)]"
                      : "border-[var(--border)] hover:border-[var(--border-strong)]"
                  }`}
                >
                  <p className="font-display font-bold">{t.label}</p>
                  <p className="mt-1 text-sm text-[var(--text-secondary)]">{t.desc}</p>
                </motion.button>
              ))}
            </div>
          </Section>

          <Section id="notifications" title="Notifications" description="In-app and push alerts">
            <div className="divide-y divide-[var(--border)]">
              <Toggle label="High spend alerts" checked={notif.cost} onChange={() => setNotif({ ...notif, cost: !notif.cost })} />
              <Toggle label="Idle resource detection" checked={notif.idle} onChange={() => setNotif({ ...notif, idle: !notif.idle })} />
              <Toggle label="Carbon threshold breaches" checked={notif.carbon} onChange={() => setNotif({ ...notif, carbon: !notif.carbon })} />
              <Toggle label="Weekly executive digest" checked={notif.digest} onChange={() => setNotif({ ...notif, digest: !notif.digest })} />
            </div>
          </Section>

          <Section id="email" title="Email preferences" description="What we send to your inbox">
            <div className="divide-y divide-[var(--border)]">
              <Toggle label="Monthly report delivery" checked={emailPrefs.reports} onChange={() => setEmailPrefs({ ...emailPrefs, reports: !emailPrefs.reports })} />
              <Toggle label="Product updates" checked={emailPrefs.product} onChange={() => setEmailPrefs({ ...emailPrefs, product: !emailPrefs.product })} />
              <Toggle label="Security notifications" checked={emailPrefs.security} onChange={() => setEmailPrefs({ ...emailPrefs, security: !emailPrefs.security })} />
            </div>
          </Section>

          <Section id="security" title="Security" description="Password & account">
            <div className="grid gap-4 sm:max-w-md">
              <Field
                label="Current password"
                type="password"
                placeholder="Enter current password"
                value={passwords.current}
                onChange={(v) => setPasswords((p) => ({ ...p, current: v }))}
                autoComplete="new-password"
                name="cp-current-password"
              />
              <Field
                label="New password"
                type="password"
                placeholder="Enter new password (min 8 characters)"
                value={passwords.new}
                onChange={(v) => setPasswords((p) => ({ ...p, new: v }))}
                autoComplete="new-password"
                name="cp-new-password"
              />
              <Field
                label="Confirm new password"
                type="password"
                placeholder="Confirm new password"
                value={passwords.confirm}
                onChange={(v) => setPasswords((p) => ({ ...p, confirm: v }))}
                autoComplete="new-password"
                name="cp-confirm-password"
              />
            </div>
            <motion.button
              type="button"
              onClick={updatePassword}
              disabled={savingPassword}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="cp-btn-primary mt-6 disabled:opacity-60"
            >
              {savingPassword ? "Updating…" : "Update Password"}
            </motion.button>
          </Section>
        </div>
      </div>
    </div>
  );
};

const Section = ({ id, title, description, children }) => (
  <motion.section
    id={id}
    initial={{ opacity: 0 }}
    whileInView={{ opacity: 1 }}
    viewport={{ once: true }}
    className="cp-surface min-w-0 p-5 sm:p-8"
  >
    <h2 className="font-display text-lg font-bold">{title}</h2>
    <p className="mt-1 text-sm text-[var(--text-secondary)]">{description}</p>
    <div className="mt-6">{children}</div>
  </motion.section>
);

const Field = ({ label, placeholder, type = "text", value, onChange, readOnly, autoComplete = "off", name }) => (
  <div>
    <label className="mb-2 block text-sm font-medium text-[var(--text-secondary)]">{label}</label>
    <input
      type={type}
      placeholder={placeholder}
      value={value ?? ""}
      onChange={onChange ? (e) => onChange(e.target.value) : undefined}
      readOnly={readOnly}
      autoComplete={autoComplete}
      name={name}
      className={`cp-input w-full ${readOnly ? "opacity-70" : ""}`}
    />
  </div>
);

const Toggle = ({ label, checked, onChange }) => (
  <div className="flex items-center justify-between gap-4 py-4 first:pt-0">
    <span className="text-sm font-medium text-[var(--text-primary)]">{label}</span>
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={`relative h-7 w-12 shrink-0 rounded-full transition-colors duration-300 ${checked ? "bg-[var(--accent)]" : "bg-[var(--bg-muted)]"}`}
    >
      <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all duration-300 ease-out ${checked ? "left-6" : "left-1"}`} />
    </button>
  </div>
);
