import jwt from "jsonwebtoken";

/** Sets req.user when a valid Bearer token is present; does not reject guests */
export const optionalAuth = (req, _res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return next();
  }

  try {
    const token = header.slice(7);
    const payload = jwt.verify(token, process.env.JWT_SECRET || "cloudpulse-dev-secret");
    req.user = { id: payload.id, email: payload.email, name: payload.name };
  } catch {
    /* invalid token — treat as anonymous for chat */
  }

  next();
};
