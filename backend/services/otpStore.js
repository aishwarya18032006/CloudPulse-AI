// OTP disabled for hackathon deployment

import crypto from "crypto";
import bcrypt from "bcryptjs";
import pool from "../database/pool.js";

/** OTP validity: 5 minutes */
export const OTP_EXPIRY_MS = 5 * 60 * 1000;

/** Cryptographically secure 6-digit OTP */
export const generateOtp = () => String(crypto.randomInt(100000, 1000000));

const hashOtp = async (code) => bcrypt.hash(code, 10);

/**
 * Persist hashed OTP (never store plain text).
 * Replaces any existing OTP for the user.
 */
export const storeOtpForUser = async (userId, plainOtp) => {
  const codeHash = await hashOtp(plainOtp);
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MS);

  await pool.query("DELETE FROM otp_codes WHERE user_id = $1", [userId]);
  try {
    await pool.query(
      `INSERT INTO otp_codes (user_id, code_hash, expires_at) VALUES ($1, $2, $3)`,
      [userId, codeHash, expiresAt]
    );
  } catch (err) {
    if (err.code === "42703") {
      const e = new Error(
        'Database schema outdated: missing otp_codes.code_hash. Run: npm run db:migrate'
      );
      e.code = "SCHEMA_MISMATCH";
      throw e;
    }
    throw err;
  }

  return expiresAt;
};

/**
 * Verify OTP against latest non-expired hash for user.
 */
export const verifyOtpForUser = async (userId, plainOtp) => {
  const result = await pool.query(
    `SELECT id, code_hash, expires_at FROM otp_codes
     WHERE user_id = $1 AND expires_at > NOW()
     ORDER BY created_at DESC LIMIT 1`,
    [userId]
  );

  if (result.rows.length === 0) {
    return { valid: false, reason: "expired_or_missing" };
  }

  const row = result.rows[0];
  const valid = await bcrypt.compare(String(plainOtp).trim(), row.code_hash);

  if (!valid) {
    return { valid: false, reason: "invalid" };
  }

  return { valid: true, otpId: row.id };
};

export const clearOtpForUser = async (userId) => {
  await pool.query("DELETE FROM otp_codes WHERE user_id = $1", [userId]);
};
