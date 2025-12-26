-- Add theme preference column to user_preferences table
-- Migration: 004-add-theme-preference
-- Created: 2025-12-26
-- Purpose: Add user theme preference support (light, dark, system)

ALTER TABLE user_preferences
ADD COLUMN theme_preference TEXT DEFAULT 'system'
CHECK (theme_preference IN ('light', 'dark', 'system'));

COMMENT ON COLUMN user_preferences.theme_preference IS 'User theme preference: light, dark, or system (follows OS preference)';
