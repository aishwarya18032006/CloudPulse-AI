-- User profile fields for Settings page

ALTER TABLE users ADD COLUMN IF NOT EXISTS display_name VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS organization VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(100);

UPDATE users
SET display_name = full_name
WHERE display_name IS NULL OR TRIM(display_name) = '';
