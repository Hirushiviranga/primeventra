-- SQL script to add mobile column to portal_users and create otp_verifications table

-- 1. Add mobile column to portal_users if it doesn't exist
ALTER TABLE portal_users ADD COLUMN IF NOT EXISTS mobile VARCHAR(50);

-- 2. Create otp_verifications table
CREATE TABLE IF NOT EXISTS otp_verifications (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255),
    mobile VARCHAR(50) NOT NULL,
    otp_code VARCHAR(10) NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- 3. Modify existing portal_users table columns to allow nulls for alternative signups
ALTER TABLE portal_users 
  ALTER COLUMN username DROP NOT NULL,
  ALTER COLUMN email DROP NOT NULL,
  ALTER COLUMN password_hash DROP NOT NULL;

-- 4. Add columns for first name, last name, and OAuth provider details to portal_users
ALTER TABLE portal_users 
  ADD COLUMN IF NOT EXISTS first_name VARCHAR(100),
  ADD COLUMN IF NOT EXISTS last_name VARCHAR(100),
  ADD COLUMN IF NOT EXISTS auth_provider VARCHAR(50) DEFAULT 'local', -- 'local', 'google', 'mobile'
  ADD COLUMN IF NOT EXISTS provider_id VARCHAR(255); -- e.g., Google user ID

-- 5. Add unique constraints on email and mobile columns if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'portal_users_email_unique') THEN
        ALTER TABLE portal_users ADD CONSTRAINT portal_users_email_unique UNIQUE (email);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'portal_users_mobile_unique') THEN
        ALTER TABLE portal_users ADD CONSTRAINT portal_users_mobile_unique UNIQUE (mobile);
    END IF;
END $$;

