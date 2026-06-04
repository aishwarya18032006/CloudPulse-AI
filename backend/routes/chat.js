import { Router } from "express";
import { optionalAuth } from "../middleware/optionalAuth.js";
import { chatRateLimit } from "../middleware/chatRateLimit.js";
import { generateChatReply, isGeminiConfigured } from "../services/gemini/index.js";

const router = Router();

const logChat = (level, message, meta = {}) => {
  const ts = new Date().toISOString();
  const extra = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : "";
  const line = `[${ts}] [Chat] [${level}] ${message}${extra}`;
  if (level === "ERROR") console.error(line);
  else console.log(line);
};

router.post("/", optionalAuth, chatRateLimit, async (req, res) => {
  const requestTime = new Date().toISOString();
  const started = Date.now();
  const userKey = req.user?.id ? `user:${req.user.id}` : "anonymous";

  const { message, history } = req.body ?? {};

  if (!message || typeof message !== "string" || !message.trim()) {
    return res.status(400).json({ error: "message is required" });
  }

  if (!isGeminiConfigured()) {
    logChat("ERROR", "GEMINI_API_KEY not configured", { requestTime, userKey });
    return res.status(503).json({
      error: "AI service is temporarily unavailable.",
      unavailable: true,
    });
  }

  logChat("INFO", "Chat request received", {
    requestTime,
    userKey,
    messageLength: message.trim().length,
    historyLength: Array.isArray(history) ? history.length : 0,
  });

  try {
    const { reply, model } = await generateChatReply(message, history);
    const responseTime = Date.now() - started;

    logChat("INFO", "Chat response sent", {
      requestTime,
      responseTimeMs: responseTime,
      userKey,
      model,
      replyLength: reply.length,
    });

    return res.json({ reply });
  } catch (err) {
    const responseTime = Date.now() - started;

    logChat("ERROR", "Chat request failed", {
      requestTime,
      responseTimeMs: responseTime,
      userKey,
      message: err.message,
      code: err.code,
      status: err.status,
    });

    return res.status(503).json({
      error: "AI service is temporarily unavailable.",
      unavailable: true,
    });
  }
});

router.post("/predict", async (req, res) => {
  const ML_MODEL_URL = process.env.ML_MODEL_URL || "http://localhost:8000";
  try {
    const { data } = req.body;
    if (!data) {
      return res.status(400).json({ error: "Missing 'data' in request body" });
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
    return res.json(prediction);
  } catch (err) {
    console.error("[ML Predict] Error:", err.message);
    return res.status(500).json({ error: "Failed to get prediction from ML model: " + err.message });
  }
});

export default router;
