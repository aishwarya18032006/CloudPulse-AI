import { trimEnv } from "../../config/env.js";
import { CLOUDPULSE_SYSTEM_PROMPT } from "./systemPrompt.js";

const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta";

/** Primary model, then Flash fallbacks */
const MODEL_CANDIDATES = [
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-1.5-flash",
  "gemini-1.5-flash-latest",
];

const MAX_HISTORY_TURNS = 20;

export function isGeminiConfigured() {
  return Boolean(trimEnv("GEMINI_API_KEY"));
}

function toGeminiRole(role) {
  if (role === "assistant" || role === "model") return "model";
  return "user";
}

function normalizeHistory(history) {
  if (!Array.isArray(history)) return [];

  return history
    .slice(-MAX_HISTORY_TURNS * 2)
    .filter((m) => m && typeof m.text === "string" && m.text.trim())
    .map((m) => ({
      role: toGeminiRole(m.role),
      parts: [{ text: m.text.trim() }],
    }));
}

function extractReply(data) {
  const text = data?.candidates?.[0]?.content?.parts
    ?.map((p) => p.text)
    .filter(Boolean)
    .join("");

  if (!text?.trim()) {
    throw new Error("Empty response from Gemini");
  }
  return text.trim();
}

function isModelUnavailable(status, body) {
  if (status === 404) return true;
  const msg = (body?.error?.message || "").toLowerCase();
  return (
    status === 400 &&
    (msg.includes("not found") ||
      msg.includes("not supported") ||
      msg.includes("does not exist"))
  );
}

async function callGeminiModel(apiKey, model, contents) {
  const url = `${GEMINI_BASE}/models/${model}:generateContent`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
    },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: CLOUDPULSE_SYSTEM_PROMPT }],
      },
      contents,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
      },
    }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const err = new Error(data?.error?.message || `Gemini API error (${res.status})`);
    err.status = res.status;
    err.model = model;
    err.retryable = isModelUnavailable(res.status, data);
    throw err;
  }

  return extractReply(data);
}

/**
 * @param {string} message
 * @param {{ role: string, text: string }[]} history
 * @returns {Promise<{ reply: string, model: string }>}
 */
export async function generateChatReply(message, history = []) {
  const apiKey = trimEnv("GEMINI_API_KEY");
  if (!apiKey) {
    const err = new Error("GEMINI_API_KEY is not configured");
    err.code = "GEMINI_NOT_CONFIGURED";
    throw err;
  }

  const trimmed = message?.trim();
  if (!trimmed) {
    const err = new Error("Message is required");
    err.code = "INVALID_MESSAGE";
    throw err;
  }

  const contents = normalizeHistory(history);
  contents.push({ role: "user", parts: [{ text: trimmed }] });

  let lastError;

  for (const model of MODEL_CANDIDATES) {
    try {
      const reply = await callGeminiModel(apiKey, model, contents);
      return { reply, model };
    } catch (err) {
      lastError = err;
      if (err.retryable) continue;
      throw err;
    }
  }

  throw lastError || new Error("All Gemini models failed");
}
