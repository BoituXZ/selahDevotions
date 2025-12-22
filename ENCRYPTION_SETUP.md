# Devotion Encryption Setup Guide

This guide walks you through completing the encryption setup for devotions.

## Overview

Your devotions are now protected with **AES-256-GCM encryption**:
- All new devotions are encrypted before storage
- Even database administrators cannot read devotion content
- Each user has a unique encryption key
- Keys are encrypted with a master key

## Setup Steps

### 1. Database Migrations ✅ (Ready to Run)

Run the combined migration file via Supabase Dashboard:

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to **SQL Editor** (left sidebar)
4. Click **New Query**
5. Copy and paste the contents of `000-encryption-migrations-combined.sql`
6. Click **Run**
7. Verify success by checking the verification queries at the bottom

**What this does:**
- Creates `user_encryption_keys` table
- Creates `user_preferences` table
- Adds encryption columns to `devotions` table

### 2. Environment Variables ✅ (Already Configured)

Your `.env` file has been updated with:
```bash
ENCRYPTION_MASTER_KEY=<secure-key>
ENCRYPTION_SALT=selah-encryption-v1
```

**⚠️ IMPORTANT:**
- Never commit the master key to version control
- Back up the master key securely
- If you lose the master key, encrypted devotions cannot be recovered

### 3. Migrate Existing Devotions (Optional)

If you have existing plain-text devotions in the database, encrypt them:

```bash
cd backend
bun run src/scripts/migrate-encrypt-devotions.ts
```

This script:
- Fetches all unencrypted devotions
- Generates user keys if needed
- Encrypts content and updates database
- Clears plain-text content

**Note:** This is safe to run multiple times (idempotent).

### 4. Test the Implementation

#### Start the Backend
```bash
cd backend
bun run dev
```

#### Start the Frontend
```bash
cd frontend
bun run dev
```

#### Test Checklist

- [ ] Backend starts without errors
- [ ] Create a new devotion via the UI
- [ ] Verify devotion is encrypted in database:
  - Go to Supabase Dashboard > Table Editor > devotions
  - Check that `encrypted_content` has base64 data
  - Check that `content` is empty
  - Check that `is_encrypted` is `true`
- [ ] Retrieve devotion - should display decrypted content
- [ ] Check encryption notice appears on first visit
- [ ] Dismiss notice - should not appear again
- [ ] List all devotions - should all decrypt properly

### 5. Verify Database Encryption

Run this query in Supabase SQL Editor:

```sql
-- Check a devotion record
SELECT
    id,
    user_id,
    LEFT(encrypted_content, 50) as encrypted_preview,
    content as plaintext_content,
    is_encrypted,
    encryption_version,
    created_at
FROM devotions
ORDER BY created_at DESC
LIMIT 5;
```

**Expected Result:**
- `encrypted_content` should have base64 data
- `content` should be empty for encrypted devotions
- `is_encrypted` should be `true`

### 6. Production Deployment

Before deploying to production:

1. **Set Production Environment Variables:**
   - Set `ENCRYPTION_MASTER_KEY` in your production environment
   - Use a **different** key than development
   - Store in secure secrets manager (Google Secret Manager, etc.)

2. **Run Migrations:**
   - Execute `000-encryption-migrations-combined.sql` on production database

3. **Migrate Existing Data:**
   - Run migration script: `bun run src/scripts/migrate-encrypt-devotions.ts`

4. **Backup Database:**
   - Take a full backup before migration
   - Keep backup until encryption is verified

## Architecture Details

### Encryption Flow

**Creating a Devotion:**
1. User submits devotion text
2. Backend sanitizes HTML
3. Backend gets/creates user encryption key
4. Backend encrypts sanitized content with AES-256-GCM
5. Backend stores encrypted content in `encrypted_content` column
6. Backend returns decrypted content to user

**Retrieving a Devotion:**
1. Backend fetches devotion from database
2. Backend checks `is_encrypted` flag
3. If encrypted: decrypt with user's key
4. Return plaintext to user

### Security Features

- **Server-side encryption**: Backend encrypts before database storage
- **Per-user keys**: Each user has unique encryption key
- **Key encryption**: User keys encrypted with master key
- **Authenticated encryption**: AES-256-GCM provides integrity verification
- **Unique IVs**: Each encryption uses a random initialization vector

### Data Format

All encrypted data uses this format:
```
base64(IV + encrypted_data + auth_tag)
```

- **IV**: 12 bytes (96 bits) - random per encryption
- **Auth Tag**: 16 bytes (128 bits) - GCM authentication
- **Encrypted Data**: Variable length

## Files Created/Modified

### New Files (13)
1. `000-encryption-migrations-combined.sql` - Database migrations
2. `001-add-user-encryption-keys.sql` - Individual migration 1
3. `002-add-devotion-encryption-columns.sql` - Individual migration 2
4. `003-add-user-preferences.sql` - Individual migration 3
5. `backend/src/services/encryption.ts` - Core encryption logic
6. `backend/src/services/key-management.ts` - Key management
7. `backend/src/routes/preferences.ts` - Preferences API
8. `backend/src/scripts/migrate-encrypt-devotions.ts` - Migration script
9. `frontend/src/components/EncryptionNotice.tsx` - UI notice
10. `ENCRYPTION_SETUP.md` - This file

### Modified Files (7)
1. `backend/.env` - Added encryption keys
2. `backend/.env.example` - Added encryption config template
3. `backend/src/lib/env.ts` - Added encryption env validation
4. `backend/src/index.ts` - Registered preferences route
5. `backend/src/routes/devotions.ts` - Added encryption/decryption
6. `backend/src/types/types.ts` - Added encryption types
7. `frontend/src/types/types.ts` - Added UserPreferences type
8. `frontend/src/pages/Devotions.tsx` - Added encryption notice

## Troubleshooting

### "ENCRYPTION_MASTER_KEY not configured"
- Check `.env` file has `ENCRYPTION_MASTER_KEY` set
- Restart backend server after updating `.env`

### "Failed to decrypt content"
- User key may be corrupted
- Check database `user_encryption_keys` table
- Verify master key hasn't changed

### Devotions not appearing
- Check browser console for errors
- Verify database migrations ran successfully
- Check backend logs for decryption errors

### Migration script fails
- Check database connectivity
- Verify Supabase credentials in `.env`
- Run with `LOG_LEVEL=debug` for detailed output

## Security Best Practices

1. **Master Key Management:**
   - Generate with: `openssl rand -base64 48`
   - Store in secrets manager (production)
   - Rotate periodically (requires re-encrypting user keys)
   - Never log or expose in error messages

2. **Backup Strategy:**
   - Backup database regularly
   - **Backup master key separately** (encrypted storage)
   - Test restoration procedures
   - Without master key, encrypted data is unrecoverable

3. **Monitoring:**
   - Monitor decryption failure rates
   - Alert on unusual encryption errors
   - Track key generation frequency

## Support

If you encounter issues:
1. Check backend logs: Look for encryption/decryption errors
2. Verify database schema: Run verification queries
3. Test with fresh user: Create new account and test flow
4. Check this guide's troubleshooting section

---

**Implementation Status:** ✅ Complete
- Backend encryption: ✅
- Frontend UI: ✅
- Database schema: ⏳ (requires manual run)
- Migration script: ✅
- Documentation: ✅
