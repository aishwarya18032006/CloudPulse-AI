-- Run once if otp_codes still has plain `code` column from older schema:
-- psql -d cloudpulse -f server/db/upgrade-otp-hash.sql

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'otp_codes' AND column_name = 'code'
  ) THEN
    ALTER TABLE otp_codes DROP COLUMN code;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'otp_codes' AND column_name = 'code_hash'
  ) THEN
    ALTER TABLE otp_codes ADD COLUMN code_hash VARCHAR(255);
    -- Existing rows invalid without hash — clear them
    DELETE FROM otp_codes WHERE code_hash IS NULL;
    ALTER TABLE otp_codes ALTER COLUMN code_hash SET NOT NULL;
  END IF;
END $$;
