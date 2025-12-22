import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import sanitizeHtml from "sanitize-html";
import { supabase } from "../lib/supabase";
import { logger } from "../lib/logger";
import { encryptContent, decryptContent } from "../services/encryption";
import { getUserEncryptionKey } from "../services/key-management";
type Variables = {
    user: {
        id: string;
    };
};

const devotions = new Hono<{ Variables: Variables }>();

// 1. Define the Validation Schema
// This acts as a firewall for bad data shapes
const createDevotionSchema = z.object({
    content: z.string().min(1, "Content cannot be empty").max(5000),
    scripture_ref: z.string().optional(),
    mood: z.string().max(50).optional(),
});

devotions.post(
    "/",
    // 2. Middleware: Validate Body using Zod
    // If the body doesn't match the schema, this halts the request immediately.
    zValidator("json", createDevotionSchema),

    async (c) => {
        const user = c.get("user");
        const body = c.req.valid("json"); // Typed automatically by Zod!

        // 3. Sanitize the Input (Defense against XSS)
        // We allow basic formatting (b, i, p) but STRIP scripts, iframes, and on* attributes
        const cleanContent = sanitizeHtml(body.content, {
            allowedTags: ["b", "i", "em", "strong", "p", "br"],
            allowedAttributes: {}, // No attributes allowed (prevents <b onclick="...">)
        });

        // 4. Sanitize Metadata
        const cleanScripture = body.scripture_ref
            ? sanitizeHtml(body.scripture_ref, { allowedTags: [] }) // Strict text only
            : null;

        const cleanMood = body.mood
            ? sanitizeHtml(body.mood, { allowedTags: [] })
            : null;

        try {
            // 5. Get or create user's encryption key
            const userKey = await getUserEncryptionKey(user.id);

            // 6. Encrypt the sanitized content
            const encryptedContent = encryptContent(cleanContent, userKey);

            // 7. Store encrypted content
            const { data, error } = await supabase
                .from("devotions")
                .insert({
                    user_id: user.id,
                    content: "", // Keep empty for backward compatibility
                    encrypted_content: encryptedContent,
                    is_encrypted: true,
                    encryption_version: 1,
                    scripture_ref: cleanScripture,
                    mood: cleanMood,
                })
                .select()
                .single();

            if (error) {
                logger.error("Failed to create devotion", error, {
                    userId: user.id,
                });
                return c.json({ error: error.message }, 500);
            }

            logger.info("Encrypted devotion created successfully", {
                userId: user.id,
                devotionId: data.id,
            });

            // 8. Decrypt before returning to client
            const decryptedDevotion = {
                ...data,
                content: decryptContent(data.encrypted_content, userKey),
                encrypted_content: undefined, // Don't send encrypted data to client
            };

            return c.json({ success: true, devotion: decryptedDevotion });
        } catch (encryptionError) {
            logger.error("Encryption/decryption failed", encryptionError as Error, {
                userId: user.id,
            });
            return c.json({ error: "Failed to secure devotion" }, 500);
        }
    }
);

devotions.get("/:id", async (c) => {
    const user = c.get("user");
    const id = c.req.param("id");

    const { data, error } = await supabase
        .from("devotions")
        .select("*")
        .eq("user_id", user.id) // Security: Ensure they own it!
        .eq("id", id)
        .single();

    if (error) {
        logger.warn("Devotion not found", {
            userId: user.id,
            devotionId: id,
        });
        return c.json({ error: "Devotion not found" }, 404);
    }

    logger.debug("Devotion retrieved", {
        userId: user.id,
        devotionId: id,
        isEncrypted: data.is_encrypted,
    });

    try {
        // Decrypt if encrypted
        if (data.is_encrypted && data.encrypted_content) {
            const userKey = await getUserEncryptionKey(user.id);
            const decryptedContent = decryptContent(
                data.encrypted_content,
                userKey
            );

            return c.json({
                ...data,
                content: decryptedContent,
                encrypted_content: undefined,
            });
        } else {
            // Legacy plain-text devotion
            return c.json(data);
        }
    } catch (decryptionError) {
        logger.error("Failed to decrypt devotion", decryptionError as Error, {
            userId: user.id,
            devotionId: id,
        });
        return c.json({ error: "Failed to retrieve devotion" }, 500);
    }
});

// GET list - decrypt all encrypted devotions
devotions.get("/", async (c) => {
    const user = c.get("user");

    const { data, error } = await supabase
        .from("devotions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);

    if (error) {
        logger.error("Failed to fetch devotions", error, {
            userId: user.id,
        });
        return c.json({ error: error.message }, 500);
    }

    logger.debug("Devotions list retrieved", {
        userId: user.id,
        count: data?.length || 0,
    });

    try {
        // Get user encryption key once for all decryptions
        const userKey = await getUserEncryptionKey(user.id);

        // Decrypt all encrypted devotions
        const decryptedDevotions = data.map((devotion) => {
            if (devotion.is_encrypted && devotion.encrypted_content) {
                return {
                    ...devotion,
                    content: decryptContent(devotion.encrypted_content, userKey),
                    encrypted_content: undefined,
                };
            }
            return devotion;
        });

        return c.json(decryptedDevotions);
    } catch (decryptionError) {
        logger.error("Failed to decrypt devotions", decryptionError as Error, {
            userId: user.id,
        });
        return c.json({ error: "Failed to retrieve devotions" }, 500);
    }
});

export default devotions;
