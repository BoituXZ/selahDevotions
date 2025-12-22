-- Migration: Add user preferences table
-- Purpose: Store user preferences including encryption notice visibility
-- Created: 2025-12-22

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
CREATE POLICY IF NOT EXISTS "Users can manage own preferences"
    ON user_preferences FOR ALL
    USING (auth.uid() = user_id);

-- Comment for documentation
COMMENT ON TABLE user_preferences IS 'User preferences and settings including UI state tracking';
COMMENT ON COLUMN user_preferences.has_seen_encryption_notice IS 'Tracks whether user has dismissed the encryption information banner';
