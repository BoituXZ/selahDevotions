-- Add sharing columns to devotions table
-- This enables secure public sharing of devotions with client-side encryption

-- Add share_token column for unique share URLs
ALTER TABLE devotions
ADD COLUMN share_token UUID UNIQUE,
ADD COLUMN encrypted_shared_content TEXT,
ADD COLUMN is_shared BOOLEAN DEFAULT false NOT NULL,
ADD COLUMN shared_at TIMESTAMPTZ;

-- Create index on share_token for faster lookups
CREATE INDEX idx_devotions_share_token ON devotions(share_token) WHERE share_token IS NOT NULL;

-- Add comment explaining the sharing mechanism
COMMENT ON COLUMN devotions.share_token IS 'Unique token for public sharing. Generated when user enables sharing.';
COMMENT ON COLUMN devotions.encrypted_shared_content IS 'Content encrypted with share-specific key (key included in share URL hash). Server never has access to decrypted shared content.';
COMMENT ON COLUMN devotions.is_shared IS 'Whether this devotion is publicly shared';
COMMENT ON COLUMN devotions.shared_at IS 'Timestamp when sharing was enabled';
