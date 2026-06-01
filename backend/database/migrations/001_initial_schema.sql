-- Baseline schema (idempotent). Safe on empty database.

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  otp_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS otp_codes (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  code_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_otp_user ON otp_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_otp_expires ON otp_codes(user_id, expires_at);

CREATE TABLE IF NOT EXISTS reports (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  cloud_type VARCHAR(50) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  report_path VARCHAR(500) NOT NULL,
  metrics_json JSONB,
  generated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reports_user ON reports(user_id);

CREATE TABLE IF NOT EXISTS alert_subscriptions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  alert_type VARCHAR(100) NOT NULL,
  enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, alert_type)
);

CREATE TABLE IF NOT EXISTS alert_queue (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  alert_type VARCHAR(100) NOT NULL,
  payload JSONB DEFAULT '{}',
  status VARCHAR(50) DEFAULT 'pending',
  scheduled_at TIMESTAMPTZ DEFAULT NOW(),
  sent_at TIMESTAMPTZ,
  error_message TEXT
);

CREATE INDEX IF NOT EXISTS idx_alert_queue_status ON alert_queue(status, scheduled_at);
