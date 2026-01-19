import {
    createCipheriv,
    createDecipheriv,
    randomBytes,
    scryptSync,
} from "crypto";
import { env } from "../lib/env";
import { logger } from "../lib/logger";

// Constants
const ALGORITHM = "aes-256-gcm" as const;
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 12; // 96 bits (recommended for GCM)
const AUTH_TAG_LENGTH = 16; // 128 bits

// Master key derivation from environment variable
let masterKey: Buffer | null = null;

function getMasterKey(): Buffer {
    if (masterKey) return masterKey;

    const masterKeyEnv = env.ENCRYPTION_MASTER_KEY;
    if (!masterKeyEnv) {
        throw new Error("ENCRYPTION_MASTER_KEY not configured");
    }

    // Derive key from passphrase using scrypt
    const salt = Buffer.from(
        env.ENCRYPTION_SALT || "selah-encryption-v1",
        "utf-8",
    );
    masterKey = scryptSync(masterKeyEnv, salt, KEY_LENGTH);

    logger.info("Master encryption key initialized");
    return masterKey;
}

/**
 * Generate a new random encryption key for a user
 * Returns base64-encoded encrypted key (IV + encrypted + tag)
 */
export function generateUserKey(): string {
    const userKey = randomBytes(KEY_LENGTH);
    const encryptedKey = encryptWithMasterKey(userKey);
    return encryptedKey;
}

/**
 * Encrypt data with master key
 * Format: base64(IV + encrypted_data + auth_tag)
 */
function encryptWithMasterKey(data: Buffer): string {
    const iv = randomBytes(IV_LENGTH);
    const cipher = createCipheriv(ALGORITHM, getMasterKey(), iv);

    const encrypted = Buffer.concat([cipher.update(data), cipher.final()]);
    const authTag = cipher.getAuthTag();

    // Combine: IV + encrypted + tag
    const combined = Buffer.concat([iv, encrypted, authTag]);
    return combined.toString("base64");
}

/**
 * Decrypt data with master key
 * Input: base64(IV + encrypted_data + auth_tag)
 */
function decryptWithMasterKey(encryptedData: string): Buffer {
    const combined = Buffer.from(encryptedData, "base64");

    const iv = combined.subarray(0, IV_LENGTH);
    const authTag = combined.subarray(combined.length - AUTH_TAG_LENGTH);
    const encrypted = combined.subarray(
        IV_LENGTH,
        combined.length - AUTH_TAG_LENGTH,
    );

    const decipher = createDecipheriv(ALGORITHM, getMasterKey(), iv);
    decipher.setAuthTag(authTag);

    return Buffer.concat([decipher.update(encrypted), decipher.final()]);
}

/**
 * Encrypt devotion content with user's key
 * @param content - Plain text content
 * @param userEncryptedKey - User's encrypted key from database
 * @returns Base64-encoded encrypted content (IV + encrypted + tag)
 */
export function encryptContent(
    content: string,
    userEncryptedKey: string,
): string {
    try {
        // Decrypt the user's key using master key
        const userKey = decryptWithMasterKey(userEncryptedKey);

        // Generate random IV for this content
        const iv = randomBytes(IV_LENGTH);

        // Encrypt the content
        const cipher = createCipheriv(ALGORITHM, userKey, iv);
        const contentBuffer = Buffer.from(content, "utf-8");
        const encrypted = Buffer.concat([
            cipher.update(contentBuffer),
            cipher.final(),
        ]);
        const authTag = cipher.getAuthTag();

        // Combine: IV + encrypted + tag
        const combined = Buffer.concat([iv, encrypted, authTag]);

        logger.debug("Content encrypted successfully", {
            originalLength: content.length,
            encryptedLength: combined.length,
        });

        return combined.toString("base64");
    } catch (error) {
        logger.error("Content encryption failed", error as Error);
        throw new Error("Failed to encrypt content");
    }
}

/**
 * Decrypt devotion content with user's key
 * @param encryptedContent - Base64-encoded encrypted content
 * @param userEncryptedKey - User's encrypted key from database
 * @returns Plain text content
 */
export function decryptContent(
    encryptedContent: string,
    userEncryptedKey: string,
): string {
    try {
        // Decrypt the user's key using master key
        const userKey = decryptWithMasterKey(userEncryptedKey);

        // Parse the encrypted content
        const combined = Buffer.from(encryptedContent, "base64");

        const iv = combined.subarray(0, IV_LENGTH);
        const authTag = combined.subarray(combined.length - AUTH_TAG_LENGTH);
        const encrypted = combined.subarray(
            IV_LENGTH,
            combined.length - AUTH_TAG_LENGTH,
        );

        // Decrypt
        const decipher = createDecipheriv(ALGORITHM, userKey, iv);
        decipher.setAuthTag(authTag);

        const decrypted = Buffer.concat([
            decipher.update(encrypted),
            decipher.final(),
        ]);

        logger.debug("Content decrypted successfully", {
            encryptedLength: combined.length,
            decryptedLength: decrypted.length,
        });

        return decrypted.toString("utf-8");
    } catch (error) {
        logger.error("Content decryption failed", error as Error);
        throw new Error("Failed to decrypt content");
    }
}

/**
 * Generate a random encryption key for share links
 * Returns the raw key (to be included in share URL hash)
 */
export function generateShareKey(): string {
    const key = randomBytes(KEY_LENGTH);
    return key.toString("base64");
}

/**
 * Encrypt content for sharing with a share-specific key
 * @param content - Plain text content
 * @param shareKeyBase64 - Base64-encoded share key
 * @returns Base64-encoded encrypted content (IV + encrypted + tag)
 */
export function encryptForSharing(
    content: string,
    shareKeyBase64: string,
): string {
    try {
        const shareKey = Buffer.from(shareKeyBase64, "base64");

        // Generate random IV for this content
        const iv = randomBytes(IV_LENGTH);

        // Encrypt the content
        const cipher = createCipheriv(ALGORITHM, shareKey, iv);
        const contentBuffer = Buffer.from(content, "utf-8");
        const encrypted = Buffer.concat([
            cipher.update(contentBuffer),
            cipher.final(),
        ]);
        const authTag = cipher.getAuthTag();

        // Combine: IV + encrypted + tag
        const combined = Buffer.concat([iv, encrypted, authTag]);

        logger.debug("Content encrypted for sharing", {
            originalLength: content.length,
            encryptedLength: combined.length,
        });

        return combined.toString("base64");
    } catch (error) {
        logger.error("Share encryption failed", error as Error);
        throw new Error("Failed to encrypt content for sharing");
    }
}

/**
 * Decrypt shared content with share key (client-side compatible)
 * @param encryptedContent - Base64-encoded encrypted content
 * @param shareKeyBase64 - Base64-encoded share key
 * @returns Plain text content
 */
export function decryptSharedContent(
    encryptedContent: string,
    shareKeyBase64: string,
): string {
    try {
        const shareKey = Buffer.from(shareKeyBase64, "base64");

        // Parse the encrypted content
        const combined = Buffer.from(encryptedContent, "base64");

        const iv = combined.subarray(0, IV_LENGTH);
        const authTag = combined.subarray(combined.length - AUTH_TAG_LENGTH);
        const encrypted = combined.subarray(
            IV_LENGTH,
            combined.length - AUTH_TAG_LENGTH,
        );

        // Decrypt
        const decipher = createDecipheriv(ALGORITHM, shareKey, iv);
        decipher.setAuthTag(authTag);

        const decrypted = Buffer.concat([
            decipher.update(encrypted),
            decipher.final(),
        ]);

        logger.debug("Shared content decrypted successfully", {
            encryptedLength: combined.length,
            decryptedLength: decrypted.length,
        });

        return decrypted.toString("utf-8");
    } catch (error) {
        logger.error("Share decryption failed", error as Error);
        throw new Error("Failed to decrypt shared content");
    }
}
