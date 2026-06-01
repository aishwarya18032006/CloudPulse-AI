import bcrypt from "bcryptjs";
import pool from "../database/pool.js";

export async function getProfile(userId) {
  const result = await pool.query(
    `SELECT id, email, full_name, display_name, organization, role, created_at
     FROM users WHERE id = $1`,
    [userId]
  );

  if (result.rows.length === 0) {
    return null;
  }

  const u = result.rows[0];
  return {
    id: u.id,
    email: u.email,
    display_name: u.display_name || u.full_name || "",
    organization: u.organization || "",
    role: u.role || "",
  };
}

export async function updateProfile(userId, { display_name, organization, role }) {
  const result = await pool.query(
    `UPDATE users
     SET display_name = $1, organization = $2, role = $3
     WHERE id = $4
     RETURNING id, email, display_name, organization, role`,
    [
      display_name?.trim() || "",
      organization?.trim() || "",
      role?.trim() || "",
      userId,
    ]
  );

  if (result.rows.length === 0) {
    return null;
  }

  const u = result.rows[0];
  return {
    id: u.id,
    email: u.email,
    display_name: u.display_name,
    organization: u.organization,
    role: u.role,
  };
}

export async function changePassword(userId, { currentPassword, newPassword }) {
  const result = await pool.query("SELECT password_hash FROM users WHERE id = $1", [userId]);

  if (result.rows.length === 0) {
    return { ok: false, error: "User not found." };
  }

  const valid = await bcrypt.compare(currentPassword, result.rows[0].password_hash);
  if (!valid) {
    return { ok: false, error: "Current password is incorrect." };
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);
  await pool.query("UPDATE users SET password_hash = $1 WHERE id = $2", [passwordHash, userId]);

  return { ok: true };
}
