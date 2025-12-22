-- Migration: Add user encryption keys table
-- Purpose: Store per-user encryption keys (encrypted with master key)
-- Created: 2025-12-22

-- Table to store per-user encryption keys
CREATE TABLE IF NOT EXISTS user_encryption_keys (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

    -- The user's data encryption key (encrypted with master key)
    -- Format: base64(IV + encrypted_key + auth_tag)
    encrypted_key TEXT NOT NULL,

    -- Key version for rotation support
    key_version INTEGER DEFAULT 1 NOT NULL,

    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_user_encryption_keys_user_id ON user_encryption_keys(user_id);

-- Enable Row Level Security
ALTER TABLE user_encryption_keys ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only read their own encryption key (backend uses service role)
CREATE POLICY IF NOT EXISTS "Users can read own encryption key"
    ON user_encryption_keys FOR SELECT
    USING (auth.uid() = user_id);

-- Comment for documentation
COMMENT ON TABLE user_encryption_keys IS 'Stores per-user encryption keys for devotion content. Keys are encrypted with the master key.';
COMMENT ON COLUMN user_encryption_keys.encrypted_key IS 'User encryption key encrypted with master key. Format: base64(IV + encrypted_key + auth_tag)';
