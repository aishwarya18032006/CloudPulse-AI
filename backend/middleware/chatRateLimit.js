const WINDOW_MS = 60_000;
const MAX_REQUESTS = 30;

/** @type {Map<string, number[]>} */
const buckets = new Map();

function prune(timestamps, now) {
  const cutoff = now - WINDOW_MS;
  while (timestamps.length && timestamps[0] <= cutoff) {
    timestamps.shift();
  }
  return timestamps;
}

export function getChatRateLimitKey(req) {
  if (req.user?.id) return `user:${req.user.id}`;
  const ip = req.ip || req.socket?.remoteAddress || "unknown";
  return `ip:${ip}`;
}

export const chatRateLimit = (req, res, next) => {
  const key = getChatRateLimitKey(req);
  const now = Date.now();
  const timestamps = prune(buckets.get(key) || [], now);

  if (timestamps.length >= MAX_REQUESTS) {
    return res.status(429).json({
      error: "Too many requests. Please wait a moment before sending more messages.",
    });
  }

  timestamps.push(now);
  buckets.set(key, timestamps);
  next();
};
