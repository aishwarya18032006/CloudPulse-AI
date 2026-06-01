import jwt from "jsonwebtoken";

export const requireAuth = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Authentication required." });
  }

  try {
    const token = header.slice(7);
    const payload = jwt.verify(token, process.env.JWT_SECRET || "cloudpulse-dev-secret");
    req.user = { id: payload.id, email: payload.email, name: payload.name };
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired session." });
  }
};

export const signToken = (user) =>
  jwt.sign(
    { id: user.id, email: user.email, name: user.full_name },
    process.env.JWT_SECRET || "cloudpulse-dev-secret",
    { expiresIn: "7d" }
  );
