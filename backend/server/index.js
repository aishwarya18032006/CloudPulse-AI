import "../config/env.js";
import { logEnvBootstrap } from "../config/env.js";
import express from "express";
import cors from "cors";
import authRoutes from "../routes/auth.js";
import reportRoutes from "../routes/reports.js";
import chatRoutes from "../routes/chat.js";
import profileRoutes from "../routes/profile.js";
import changePasswordRoutes from "../routes/changePassword.js";
import { verifySmtpConnection, isSmtpConfigured } from "../services/email.js";
import { runMigrations } from "../database/runMigrations.js";
import { logSchemaValidation } from "../database/validateSchema.js";

const app = express();
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || "development";
const AUTO_MIGRATE = process.env.AUTO_MIGRATE !== "false";

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());

app.get("/api/health", async (_req, res) => {
  const { validateDatabaseSchema } = await import("../database/validateSchema.js");
  const schema = await validateDatabaseSchema();
  res.json({
    status: schema.valid ? "ok" : "degraded",
    service: "CloudPulse AI API",
    smtp: isSmtpConfigured() ? "configured" : "dev-fallback",
    env: NODE_ENV,
    schema: schema.valid ? "valid" : { errors: schema.errors },
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/change-password", changePasswordRoutes);
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error." });
});

async function startServer() {
  console.log(`[Server] Starting CloudPulse API (${NODE_ENV})…`);
  logEnvBootstrap();

  if (AUTO_MIGRATE) {
    try {
      const { applied } = await runMigrations({ log: true });
      if (applied.length) {
        console.log(`[Server] Applied migrations: ${applied.join(", ")}`);
      }
    } catch (err) {
      console.error("[Server] Auto-migration failed:", err.message);
      console.error("[Server] Run manually: npm run db:migrate");
    }
  }

  const schema = await logSchemaValidation();
  if (!schema.valid) {
    console.error("[Server] Cannot start safely — fix schema with: npm run db:migrate");
    if (NODE_ENV === "production") {
      process.exit(1);
    }
    console.warn("[Server] Starting anyway in non-production mode (registration may fail)");
  }

  try {
    const smtpStatus = await verifySmtpConnection();
    if (smtpStatus.verified) {
      console.log("[Server] Gmail SMTP ready for OTP delivery");
    } else if (smtpStatus.devFallback) {
      console.log("[Server] Development mode: OTP will log to console if SMTP unset");
    }
  } catch (err) {
    console.error("[Server] SMTP startup check failed:", err.message);
    if (NODE_ENV === "production") {
      process.exit(1);
    }
    console.warn("[Server] Continuing without verified SMTP (non-production only)");
  }

  app.listen(PORT, () => {
    console.log(`CloudPulse API running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("[Server] Fatal:", err);
  process.exit(1);
});
