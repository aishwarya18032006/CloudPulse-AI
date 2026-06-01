import { Router } from "express";
import bcrypt from "bcryptjs";
import pool from "../database/pool.js";
import { sendOtpEmail, EmailDeliveryError } from "../services/email.js";
import {
  generateOtp,
  storeOtpForUser,
  verifyOtpForUser,
  clearOtpForUser,
} from "../services/otpStore.js";
import { signToken, requireAuth } from "../middleware/auth.js";
import { seedDefaultSubscriptions } from "../services/alerts/index.js";

const router = Router();

const handleEmailError = (res, err) => {
  if (err instanceof EmailDeliveryError) {
    return res.status(503).json({
      error: err.message,
      code: "EMAIL_SEND_FAILED",
    });
  }
  return null;
};

/**
 * Generate OTP, store bcrypt hash, send email to registrant.
 * Called only after user row exists in database.
 */
const createAndSendOtp = async (userId, email, fullName) => {
  const code = generateOtp();
  await storeOtpForUser(userId, code);
  await sendOtpEmail(email, code, fullName || "User");
};

router.post("/register", async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName?.trim() || !email?.trim() || !password) {
      return res.status(400).json({ error: "Name, email, and password are required." });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters." });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existing = await pool.query(
      "SELECT id, full_name, verified, otp_verified FROM users WHERE email = $1",
      [normalizedEmail]
    );

    if (existing.rows.length > 0) {
      const user = existing.rows[0];
      if (user.verified && user.otp_verified) {
        return res.status(409).json({
          error: "An account with this email already exists. Please sign in.",
        });
      }
      try {
        await createAndSendOtp(user.id, normalizedEmail, user.full_name);
      } catch (err) {
        const handled = handleEmailError(res, err);
        if (handled) return handled;
        throw err;
      }
      return res.json({
        message: "Verification code sent to your email.",
        email: normalizedEmail,
        requiresOtp: true,
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const result = await pool.query(
      `INSERT INTO users (full_name, email, password_hash, verified, otp_verified)
       VALUES ($1, $2, $3, false, false)
       RETURNING id, full_name, email`,
      [fullName.trim(), normalizedEmail, passwordHash]
    );

    const user = result.rows[0];
    await seedDefaultSubscriptions(user.id);

    try {
      await createAndSendOtp(user.id, normalizedEmail, user.full_name);
    } catch (err) {
      const handled = handleEmailError(res, err);
      if (handled) return handled;
      throw err;
    }

    res.status(201).json({
      message: "Account created. Verification code sent to your email.",
      email: normalizedEmail,
      requiresOtp: true,
    });
  } catch (err) {
    console.error("Register error:", err);
    if (err.code === "SCHEMA_MISMATCH" || err.code === "42703") {
      return res.status(503).json({
        error: "Database schema update required. Please contact administrator or run db:migrate.",
      });
    }
    res.status(500).json({ error: "Registration failed. Please try again." });
  }
});

router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ error: "Email and OTP are required." });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const userResult = await pool.query("SELECT * FROM users WHERE email = $1", [normalizedEmail]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: "No account found. Please register first." });
    }

    const user = userResult.rows[0];
    const check = await verifyOtpForUser(user.id, String(otp).trim());

    if (!check.valid) {
      const msg =
        check.reason === "expired_or_missing"
          ? "Verification code has expired. Request a new code."
          : "Invalid verification code. Please try again.";
      return res.status(400).json({ error: msg });
    }

    await pool.query(`UPDATE users SET verified = true, otp_verified = true WHERE id = $1`, [user.id]);
    await clearOtpForUser(user.id);

    const token = signToken(user);
    res.json({
      message: "Email verified successfully.",
      token,
      user: {
        id: user.id,
        name: user.full_name,
        email: user.email,
        verified: true,
      },
    });
  } catch (err) {
    console.error("Verify OTP error:", err);
    res.status(500).json({ error: "Verification failed." });
  }
});

router.post("/resend-otp", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required." });

    const normalizedEmail = email.trim().toLowerCase();
    const userResult = await pool.query(
      "SELECT id, full_name FROM users WHERE email = $1",
      [normalizedEmail]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: "No account found. Please register first." });
    }

    const user = userResult.rows[0];
    try {
      await createAndSendOtp(user.id, normalizedEmail, user.full_name);
    } catch (err) {
      const handled = handleEmailError(res, err);
      if (handled) return handled;
      throw err;
    }

    res.json({ message: "Verification code sent to your email." });
  } catch (err) {
    console.error("Resend OTP error:", err);
    res.status(500).json({ error: "Could not resend code." });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [normalizedEmail]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "No account found. Please register first." });
    }

    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);

    if (!valid) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    if (!user.verified || !user.otp_verified) {
      try {
        await createAndSendOtp(user.id, normalizedEmail, user.full_name);
      } catch (err) {
        const handled = handleEmailError(res, err);
        if (handled) return handled;
        throw err;
      }
      return res.status(403).json({
        error: "Please verify your email with the code sent to your inbox.",
        requiresOtp: true,
        email: normalizedEmail,
      });
    }

    const token = signToken(user);
    res.json({
      token,
      user: {
        id: user.id,
        name: user.full_name,
        email: user.email,
        verified: user.verified,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Login failed." });
  }
});

router.get("/me", requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, full_name, email, verified, otp_verified, created_at FROM users WHERE id = $1",
      [req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found." });
    }
    const u = result.rows[0];
    res.json({
      user: {
        id: u.id,
        name: u.full_name,
        email: u.email,
        verified: u.verified && u.otp_verified,
      },
    });
  } catch (err) {
    res.status(500).json({ error: "Could not fetch profile." });
  }
});

export default router;
