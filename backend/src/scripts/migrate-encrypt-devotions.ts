import { supabase } from "../lib/supabase";
import { logger } from "../lib/logger";
import { encryptContent } from "../services/encryption";
import { getUserEncryptionKey } from "../services/key-management";

/**
 * One-time migration script to encrypt existing plain-text devotions
 * Run with: bun run src/scripts/migrate-encrypt-devotions.ts
 */
async function migrateDevotions() {
    logger.info("Starting devotion encryption migration...");

    // Fetch all unencrypted devotions
    const { data: devotions, error } = await supabase
        .from("devotions")
        .select("id, user_id, content")
        .eq("is_encrypted", false)
        .not("content", "is", null)
        .limit(100); // Process in batches

    if (error) {
        logger.error("Failed to fetch devotions for migration", error);
        throw error;
    }

    if (!devotions || devotions.length === 0) {
        logger.info("No devotions to migrate");
        return;
    }

    logger.info(`Found ${devotions.length} devotions to encrypt`);

    let successCount = 0;
    let errorCount = 0;

    for (const devotion of devotions) {
        try {
            // Get user's encryption key (creates if not exists)
            const userKey = await getUserEncryptionKey(devotion.user_id);

            // Encrypt the content
            const encryptedContent = encryptContent(devotion.content, userKey);

            // Update devotion
            const { error: updateError } = await supabase
                .from("devotions")
                .update({
                    encrypted_content: encryptedContent,
                    is_encrypted: true,
                    encryption_version: 1,
                    content: "", // Clear plain text
                })
                .eq("id", devotion.id);

            if (updateError) {
                logger.error("Failed to update devotion", updateError, {
                    devotionId: devotion.id,
                });
                errorCount++;
            } else {
                successCount++;
                logger.debug("Encrypted devotion", {
                    devotionId: devotion.id,
                    userId: devotion.user_id,
                });
            }
        } catch (err) {
            logger.error("Migration error for devotion", err as Error, {
                devotionId: devotion.id,
            });
            errorCount++;
        }
    }

    logger.info("Migration complete", {
        total: devotions.length,
        success: successCount,
        errors: errorCount,
    });
}

// Run migration
migrateDevotions()
    .then(() => {
        console.log("Migration finished successfully");
        process.exit(0);
    })
    .catch((error) => {
        console.error("Migration failed:", error);
        process.exit(1);
    });
