-- Align otp_codes with application (bcrypt code_hash).
-- Safe to run multiple times. Does NOT modify users or other tables.

-- Ensure table exists (legacy DBs may have partial schema)
CREATE TABLE IF NOT EXISTS otp_codes (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add FK only if users exists and constraint missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'otp_codes'
      AND constraint_type = 'FOREIGN KEY'
      AND constraint_name = 'otp_codes_user_id_fkey'
  ) THEN
    ALTER TABLE otp_codes
      ADD CONSTRAINT otp_codes_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Add missing columns (legacy used plain `code` instead of `code_hash`)
ALTER TABLE otp_codes ADD COLUMN IF NOT EXISTS code_hash VARCHAR(255);
ALTER TABLE otp_codes ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE otp_codes ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;

-- Legacy plain-text OTP rows cannot be verified — clear only otp_codes rows
DELETE FROM otp_codes WHERE code_hash IS NULL;

-- Remove deprecated plain `code` column
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'otp_codes'
      AND column_name = 'code'
  ) THEN
    ALTER TABLE otp_codes DROP COLUMN code;
  END IF;
END $$;

-- Enforce NOT NULL on required columns when safe
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM otp_codes WHERE code_hash IS NULL) THEN
    ALTER TABLE otp_codes ALTER COLUMN code_hash SET NOT NULL;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM otp_codes WHERE expires_at IS NULL) THEN
    ALTER TABLE otp_codes ALTER COLUMN expires_at SET NOT NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_otp_user ON otp_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_otp_expires ON otp_codes(user_id, expires_at);
