-- ============================================
-- Devotions ID Migration: Integer to UUID v4
-- ============================================
-- WARNING: This is a BREAKING CHANGE
-- All existing devotion URLs will become invalid after this migration
-- Execute this in the Supabase SQL Editor
-- ============================================

-- Step 1: Create backup table (safety first!)
CREATE TABLE devotions_backup_pre_uuid AS
SELECT * FROM devotions;

-- Step 2: Add new UUID column with default gen_random_uuid()
ALTER TABLE devotions
ADD COLUMN new_id UUID DEFAULT gen_random_uuid();

-- Step 3: Populate UUIDs for existing rows (if any don't have them)
UPDATE devotions
SET new_id = gen_random_uuid()
WHERE new_id IS NULL;

-- Step 4: Drop old primary key constraint
ALTER TABLE devotions
DROP CONSTRAINT devotions_pkey;

-- Step 5: Drop old id column
ALTER TABLE devotions
DROP COLUMN id;

-- Step 6: Rename new_id to id
ALTER TABLE devotions
RENAME COLUMN new_id TO id;

-- Step 7: Set new primary key
ALTER TABLE devotions
ADD PRIMARY KEY (id);

-- Step 8: Ensure default is still set for new inserts
ALTER TABLE devotions
ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Verify the schema (should show: id | uuid | gen_random_uuid())
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'devotions' AND column_name = 'id';

-- Test insert (creates a test devotion with UUID)
INSERT INTO devotions (user_id, content)
VALUES ('test-user-id', 'test content')
RETURNING id;

-- Clean up test
DELETE FROM devotions WHERE content = 'test content';

-- ============================================
-- POST-MIGRATION CLEANUP (run after 7-14 days)
-- ============================================
-- DROP TABLE IF EXISTS devotions_backup_pre_uuid;
