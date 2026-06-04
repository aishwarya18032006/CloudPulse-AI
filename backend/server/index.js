import "../config/env.js";
import { logEnvBootstrap } from "../config/env.js";
import express from "express";
import cors from "cors";
import { corsOptions, logCorsBootstrap } from "../config/cors.js";
import authRoutes from "../routes/auth.js";
import reportRoutes from "../routes/reports.js";
import chatRoutes from "../routes/chat.js";
import profileRoutes from "../routes/profile.js";
import changePasswordRoutes from "../routes/changePassword.js";
import mlPredictRoutes from "../routes/mlpredict.js";
import simulatorRoutes from "../routes/simulator.js";
import { isSmtpConfigured } from "../services/email.js";
import pool from "../database/pool.js";
import { runMigrations } from "../database/runMigrations.js";
import { logSchemaValidation } from "../database/validateSchema.js";

const app = express();
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || "development";
const AUTO_MIGRATE = process.env.AUTO_MIGRATE !== "false";

app.use(cors(corsOptions));
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

app.post("/api/ml/predict", async (req, res) => {
  const ML_MODEL_URL = process.env.ML_MODEL_URL || "http://localhost:8000";
  try {
    const { data } = req.body;
    if (!data) {
      return res.status(400).json({ error: "Missing 'data' field in request body" });
    }

    const response = await fetch(`${ML_MODEL_URL}/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`ML server responded with status ${response.status}`);
    }

    const prediction = await response.json();
    res.json(prediction);
  } catch (err) {
    console.error("[ML Predict] Error:", err.message);
    res.status(500).json({ error: "Failed to get prediction from ML model" });
  }
});

app.get("/api/test-get", (req, res) => {
  res.json({ test: "get works" });
});

app.post("/api/test-post", (req, res) => {
  res.json({ test: "post works" });
});

app.use("/api/auth", authRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/change-password", changePasswordRoutes);
app.use("/api/predict", mlPredictRoutes);
app.use("/api/simulator", simulatorRoutes);
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error." });
});

async function startServer() {
  console.log("[Server] Starting CloudPulse API");
  logEnvBootstrap();
  logCorsBootstrap();

  try {
    await pool.query("SELECT 1");
    console.log("[Server] Connected to PostgreSQL");
  } catch (err) {
    console.error("[Server] PostgreSQL connection failed:", err.message);
    if (NODE_ENV === "production") {
      process.exit(1);
    }
    console.warn("[Server] Starting without a verified database connection (non-production only)");
  }

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

  if (!isSmtpConfigured() && NODE_ENV !== "production") {
    console.log("[Server] Development mode: OTP will log to console if SMTP unset");
  }

  app.listen(PORT, () => {
    console.log(`CloudPulse API running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("[Server] Fatal:", err);
  process.exit(1);
});
