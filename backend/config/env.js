import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Project root (package.json), not server/ — .env lives here */
export const PROJECT_ROOT = path.resolve(__dirname, "../..");
export const ENV_PATH = path.join(PROJECT_ROOT, ".env");

const dotenvResult = dotenv.config({
  path: ENV_PATH,
  override: true,
});

export function trimEnv(name) {
  const value = process.env[name];
  return value == null ? "" : String(value).trim();
}

/** Gmail app passwords are often copied with spaces */
export function normalizeSmtpPass(raw) {
  return raw.replace(/\s+/g, "");
}

export function getSmtpSettings() {
  const host = trimEnv("SMTP_HOST") || "smtp.gmail.com";
  const user = trimEnv("SMTP_USER");
  const pass = normalizeSmtpPass(trimEnv("SMTP_PASS"));
  const port = parseInt(trimEnv("SMTP_PORT") || "587", 10);
  const secure = trimEnv("SMTP_SECURE") === "true" || port === 465;
  const from = trimEnv("SMTP_FROM");

  return { host, user, pass, port, secure, from };
}

export function isSmtpConfigured() {
  const { host, user, pass } = getSmtpSettings();
  return Boolean(host && user && pass);
}

/**
 * Startup diagnostics — never logs secret values.
 */
export function logEnvBootstrap() {
  const exists = fs.existsSync(ENV_PATH);

  console.log(`[Env] .env path: ${ENV_PATH}`);
  console.log(`[Env] .env file exists: ${exists}`);

  if (dotenvResult.error) {
    if (exists) {
      console.warn(`[Env] dotenv parse error: ${dotenvResult.error.message}`);
    } else {
      console.warn("[Env] No .env file found — using process environment only");
    }
  }

  const host = trimEnv("SMTP_HOST");
  const user = trimEnv("SMTP_USER");
  const pass = trimEnv("SMTP_PASS");

  console.log(`[Env] SMTP_HOST loaded = ${Boolean(host)}`);
  console.log(`[Env] SMTP_USER loaded = ${Boolean(user)}`);
  console.log(`[Env] SMTP_PASS loaded = ${Boolean(pass)}`);
  console.log(`[Env] SMTP fully configured = ${isSmtpConfigured()}`);
  console.log(`[Env] GEMINI_API_KEY loaded = ${Boolean(trimEnv("GEMINI_API_KEY"))}`);

  if (exists && host && (!user || !pass)) {
    console.warn(
      "[Env] SMTP_HOST is set but SMTP_USER or SMTP_PASS is empty in .env — save the file and restart the API"
    );
  }
}
