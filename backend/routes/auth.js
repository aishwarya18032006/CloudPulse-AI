// OTP disabled for hackathon deployment

import { Router } from "express";
import bcrypt from "bcryptjs";
import pool from "../database/pool.js";
import { signToken, requireAuth } from "../middleware/auth.js";
import { seedDefaultSubscriptions } from "../services/alerts/index.js";

const router = Router();

const activateUser = async (userId) => {
  await pool.query(`UPDATE users SET verified = true, otp_verified = true WHERE id = $1`, [userId]);
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
      await activateUser(user.id);
      return res.json({
        message: "Account ready. Please sign in.",
        email: normalizedEmail,
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const result = await pool.query(
      `INSERT INTO users (full_name, email, password_hash, verified, otp_verified)
       VALUES ($1, $2, $3, true, true)
       RETURNING id, full_name, email`,
      [fullName.trim(), normalizedEmail, passwordHash]
    );

    const user = result.rows[0];
    await seedDefaultSubscriptions(user.id);

    res.status(201).json({
      message: "Account created successfully. Please sign in.",
      email: normalizedEmail,
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

// OTP disabled for hackathon deployment
router.post("/verify-otp", (_req, res) => {
  res.status(410).json({ error: "OTP verification is disabled." });
});

// OTP disabled for hackathon deployment
router.post("/resend-otp", (_req, res) => {
  res.status(410).json({ error: "OTP verification is disabled." });
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
      await activateUser(user.id);
    }

    const token = signToken({ ...user, verified: true, otp_verified: true });
    res.json({
      token,
      user: {
        id: user.id,
        name: user.full_name,
        email: user.email,
        verified: true,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Login failed." });
  }
});

// Google OAuth Handler
router.post("/google-login", async (req, res) => {
  try {
    const { token, name, email, picture } = req.body;

    if (!token || !email) {
      return res.status(400).json({ error: "Google token and email are required." });
    }

    // Verify Google token (basic validation - in production, verify with Google's servers)
    // For now, we trust the frontend's validation from Google Identity Services
    if (!token.length) {
      return res.status(401).json({ error: "Invalid Google token." });
    }

    const normalizedEmail = email.trim().toLowerCase();
    let user = null;

    // Check if user exists by email
    const existingByEmail = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [normalizedEmail]
    );

    if (existingByEmail.rows.length > 0) {
      // User exists, update Google ID if not already set
      user = existingByEmail.rows[0];
      if (!user.google_id) {
        await pool.query(
          `UPDATE users SET google_id = $1, login_provider = 'google', profile_picture = $2
           WHERE id = $3`,
          [token, picture || null, user.id]
        );
        user.google_id = token;
        user.login_provider = 'google';
        user.profile_picture = picture || null;
      }
    } else {
      // Create new user
      const result = await pool.query(
        `INSERT INTO users (full_name, email, google_id, login_provider, profile_picture, password_hash, verified, otp_verified)
         VALUES ($1, $2, $3, $4, $5, $6, true, true)
         RETURNING id, full_name, email, google_id, login_provider, profile_picture`,
        [
          name || email.split("@")[0],
          normalizedEmail,
          token,
          "google",
          picture || null,
          "", // No password hash for Google accounts
        ]
      );

      user = result.rows[0];
      await seedDefaultSubscriptions(user.id);
    }

    if (!user.verified || !user.otp_verified) {
      await activateUser(user.id);
    }

    const jwtToken = signToken({ ...user, verified: true, otp_verified: true });
    res.json({
      token: jwtToken,
      user: {
        id: user.id,
        name: user.full_name,
        email: user.email,
        picture: user.profile_picture,
        verified: true,
      },
    });
  } catch (err) {
    console.error("Google login error:", err);
    if (err.code === "23505") {
      // Unique constraint violation
      return res.status(409).json({
        error: "This email is already associated with another account.",
      });
    }
    res.status(500).json({ error: "Google login failed. Please try again." });
  }
});

router.get("/me", requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, full_name, email, verified, otp_verified, profile_picture, created_at FROM users WHERE id = $1",
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
        picture: u.profile_picture,
        verified: true,
      },
    });
  } catch (err) {
    res.status(500).json({ error: "Could not fetch profile." });
  }
});

export default router;
