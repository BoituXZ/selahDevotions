/**
 * Client-side encryption utilities for shared devotions
 * Uses Web Crypto API for AES-256-GCM decryption
 */

const ALGORITHM = "AES-GCM";
const IV_LENGTH = 12; // 96 bits
const AUTH_TAG_LENGTH = 16; // 128 bits

/**
 * Convert base64 string to Uint8Array
 */
function base64ToUint8Array(base64: string): Uint8Array {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

/**
 * Decrypt shared content using Web Crypto API
 * @param encryptedContent - Base64-encoded encrypted content (IV + encrypted + tag)
 * @param shareKeyBase64 - Base64-encoded encryption key from URL hash
 * @returns Decrypted plain text content
 */
export async function decryptSharedContent(
    encryptedContent: string,
    shareKeyBase64: string,
): Promise<string> {
    try {
        // Parse the encrypted content
        const combined = base64ToUint8Array(encryptedContent);

        // Extract components
        const iv = combined.slice(0, IV_LENGTH);
        const encryptedData = combined.slice(
            IV_LENGTH,
            combined.length - AUTH_TAG_LENGTH,
        );
        const authTag = combined.slice(combined.length - AUTH_TAG_LENGTH);

        // Combine encrypted data and auth tag for Web Crypto API
        const ciphertext = new Uint8Array(
            encryptedData.length + authTag.length,
        );
        ciphertext.set(encryptedData);
        ciphertext.set(authTag, encryptedData.length);

        // Import the key
        const keyData = base64ToUint8Array(shareKeyBase64);
        const cryptoKey = await crypto.subtle.importKey(
            "raw",
            keyData as BufferSource,
            { name: ALGORITHM },
            false,
            ["decrypt"],
        );

        // Decrypt
        const decrypted = await crypto.subtle.decrypt(
            {
                name: ALGORITHM,
                iv: iv,
            },
            cryptoKey,
            ciphertext as BufferSource,
        );

        // Convert to string
        const decoder = new TextDecoder();
        return decoder.decode(decrypted);
    } catch (error) {
        console.error("Decryption failed:", error);
        throw new Error(
            "Failed to decrypt content. The link may be invalid or corrupted.",
        );
    }
}

/**
 * Extract share key from URL hash
 * URL format: /share/{token}#{key}
 */
export function extractShareKeyFromUrl(): string | null {
    const hash = window.location.hash;
    if (!hash || hash.length <= 1) {
        return null;
    }
    // Remove the '#' character
    return hash.substring(1);
}
