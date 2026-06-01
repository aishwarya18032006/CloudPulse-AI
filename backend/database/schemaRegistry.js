/**
 * Expected schema for runtime validation.
 * Must stay in sync with otpStore.js and migrations.
 */

export const SCHEMA_REGISTRY = {
  users: {
    requiredColumns: [
      "id",
      "full_name",
      "email",
      "password_hash",
      "verified",
      "otp_verified",
      "created_at",
    ],
  },
  otp_codes: {
    requiredColumns: ["id", "user_id", "code_hash", "expires_at", "created_at"],
    deprecatedColumns: ["code"],
  },
};
