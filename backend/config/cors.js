const normalizeOrigin = (url) => {
  if (!url || typeof url !== "string") return null;
  return url.trim().replace(/\/+$/, "");
};

const isVercelAppOrigin = (origin) =>
  typeof origin === "string" && origin.startsWith("https://") && origin.endsWith(".vercel.app");

/**
 * Dynamic CORS origin check.
 * Production: CLIENT_URL + any https://*.vercel.app preview deployment.
 * Development: http://localhost:5173 (+ CLIENT_URL if set for local testing).
 */
export const createCorsOriginValidator = () => {
  const nodeEnv = process.env.NODE_ENV || "development";
  const isProduction = nodeEnv === "production";
  const clientUrl = normalizeOrigin(process.env.CLIENT_URL);

  const devOrigins = new Set(
    ["http://localhost:5173", "http://127.0.0.1:5173", clientUrl].filter(Boolean)
  );

  return (origin, callback) => {
    // Same-origin or non-browser clients (no Origin header)
    if (!origin) {
      callback(null, true);
      return;
    }

    const normalized = normalizeOrigin(origin);

    if (!isProduction) {
      if (devOrigins.has(normalized) || isVercelAppOrigin(normalized)) {
        callback(null, true);
        return;
      }
      callback(null, false);
      return;
    }

    if (clientUrl && normalized === clientUrl) {
      callback(null, true);
      return;
    }

    if (isVercelAppOrigin(normalized)) {
      callback(null, true);
      return;
    }

    callback(null, false);
  };
};

export const corsOptions = {
  origin: createCorsOriginValidator(),
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 204,
};

export const logCorsBootstrap = () => {
  const nodeEnv = process.env.NODE_ENV || "development";
  const clientUrl = normalizeOrigin(process.env.CLIENT_URL);
  console.log(`[CORS] Environment: ${nodeEnv}`);
  if (clientUrl) {
    console.log(`[CORS] CLIENT_URL: ${clientUrl}`);
  } else if (nodeEnv === "production") {
    console.warn("[CORS] CLIENT_URL is not set — only *.vercel.app origins will be allowed");
  }
  if (nodeEnv !== "production") {
    console.log("[CORS] Development origins: http://localhost:5173");
  } else {
    console.log("[CORS] Production also allows: https://*.vercel.app");
  }
};
