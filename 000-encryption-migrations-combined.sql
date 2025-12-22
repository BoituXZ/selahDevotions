-- ============================================
-- COMBINED ENCRYPTION MIGRATIONS
-- ============================================
-- This file combines all encryption-related migrations
-- Run this in Supabase Dashboard > SQL Editor
-- ============================================

-- Migration 1: Add user encryption keys table
-- ============================================

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
DROP POLICY IF EXISTS "Users can read own encryption key" ON user_encryption_keys;
CREATE POLICY "Users can read own encryption key"
    ON user_encryption_keys FOR SELECT
    USING (auth.uid() = user_id);

-- Comment for documentation
COMMENT ON TABLE user_encryption_keys IS 'Stores per-user encryption keys for devotion content. Keys are encrypted with the master key.';
COMMENT ON COLUMN user_encryption_keys.encrypted_key IS 'User encryption key encrypted with master key. Format: base64(IV + encrypted_key + auth_tag)';


-- Migration 2: Add encryption columns to devotions table
-- ============================================

-- Add columns for encrypted storage
ALTER TABLE devotions
    ADD COLUMN IF NOT EXISTS encrypted_content TEXT,
    ADD COLUMN IF NOT EXISTS encryption_version INTEGER DEFAULT 1,
    ADD COLUMN IF NOT EXISTS is_encrypted BOOLEAN DEFAULT false NOT NULL;

-- Create index for encryption status queries
CREATE INDEX IF NOT EXISTS idx_devotions_encryption ON devotions(user_id, is_encrypted);

-- Add comments explaining migration strategy
COMMENT ON COLUMN devotions.encrypted_content IS 'Encrypted devotion content. Format: base64(IV + encrypted_data + auth_tag)';
COMMENT ON COLUMN devotions.is_encrypted IS 'True if content is encrypted. During migration, legacy records have false. Used to identify which devotions need migration.';
COMMENT ON COLUMN devotions.encryption_version IS 'Encryption algorithm version. Currently 1 for AES-256-GCM. Allows for future algorithm upgrades.';


-- Migration 3: Add user preferences table
-- ============================================

CREATE TABLE IF NOT EXISTS user_preferences (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Track whether user has seen encryption notice
    has_seen_encryption_notice BOOLEAN DEFAULT false NOT NULL,

    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Policy: Users can manage their own preferences
DROP POLICY IF EXISTS "Users can manage own preferences" ON user_preferences;
CREATE POLICY "Users can manage own preferences"
    ON user_preferences FOR ALL
    USING (auth.uid() = user_id);

-- Comment for documentation
COMMENT ON TABLE user_preferences IS 'User preferences and settings including UI state tracking';
COMMENT ON COLUMN user_preferences.has_seen_encryption_notice IS 'Tracks whether user has dismissed the encryption information banner';


-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Run these after migration to verify success:

-- Check if tables were created
SELECT tablename FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('user_encryption_keys', 'user_preferences');

-- Check if devotions columns were added
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'devotions'
AND column_name IN ('encrypted_content', 'is_encrypted', 'encryption_version');

-- Count existing devotions that need migration
SELECT
    COUNT(*) as total_devotions,
    COUNT(CASE WHEN is_encrypted = true THEN 1 END) as encrypted,
    COUNT(CASE WHEN is_encrypted = false THEN 1 END) as pending_migration
FROM devotions;
