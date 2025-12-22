-- Migration: Add encryption columns to devotions table
-- Purpose: Support encrypted storage of devotion content
-- Created: 2025-12-22

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
