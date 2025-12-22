import { supabase } from "../lib/supabase";
import { logger } from "../lib/logger";
import { generateUserKey } from "./encryption";

interface UserEncryptionKey {
    user_id: string;
    encrypted_key: string;
    key_version: number;
}

/**
 * Get or create encryption key for a user
 * This is called on every encrypted operation to ensure key exists
 */
export async function getUserEncryptionKey(userId: string): Promise<string> {
    // Try to fetch existing key
    const { data, error } = await supabase
        .from("user_encryption_keys")
        .select("encrypted_key")
        .eq("user_id", userId)
        .single();

    if (error && error.code !== "PGRST116") {
        // PGRST116 = not found, which is OK
        logger.error("Failed to fetch user encryption key", error, { userId });
        throw new Error("Failed to retrieve encryption key");
    }

    // If key exists, return it
    if (data) {
        logger.debug("Retrieved existing encryption key", { userId });
        return data.encrypted_key;
    }

    // Generate new key for user
    logger.info("Generating new encryption key for user", { userId });
    const newEncryptedKey = generateUserKey();

    const { error: insertError } = await supabase
        .from("user_encryption_keys")
        .insert({
            user_id: userId,
            encrypted_key: newEncryptedKey,
            key_version: 1,
        });

    if (insertError) {
        logger.error("Failed to store user encryption key", insertError, {
            userId,
        });
        throw new Error("Failed to create encryption key");
    }

    logger.info("Encryption key created successfully", { userId });
    return newEncryptedKey;
}

/**
 * Rotate a user's encryption key (for future use)
 * This would require re-encrypting all devotions with new key
 */
export async function rotateUserKey(userId: string): Promise<void> {
    // TODO: Implementation for key rotation
    // 1. Generate new key
    // 2. Fetch all encrypted devotions
    // 3. Decrypt with old key, re-encrypt with new key
    // 4. Update all devotions in transaction
    // 5. Update user_encryption_keys table

    throw new Error("Key rotation not yet implemented");
}
