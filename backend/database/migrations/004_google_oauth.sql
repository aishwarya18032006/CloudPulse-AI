-- Add Google OAuth support to users table

ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id VARCHAR(255) UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS login_provider VARCHAR(50) DEFAULT 'email';
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_picture VARCHAR(500);

-- Create index for Google OAuth lookups
CREATE INDEX IF NOT EXISTS idx_google_id ON users(google_id);
CREATE INDEX IF NOT EXISTS idx_login_provider ON users(login_provider);
