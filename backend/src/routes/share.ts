import { Hono } from "hono";
import { z } from "zod";
import { supabase } from "../lib/supabase";
import type { Devotion } from "../types/types";
import { logger } from "../lib/logger";
import { SupabaseClient } from "@supabase/supabase-js";
import {
    decryptContent,
    generateShareKey,
    encryptForSharing,
} from "../services/encryption";
import { getUserEncryptionKey } from "../services/key-management";

type Variables = {
    user: {
        id: string;
    };
    supabase: SupabaseClient;
    userId: string;
};

const share = new Hono<{ Variables: Variables }>();

/**
 * POST /api/devotions/:id/share
 * Generate a share link for a devotion
 * Protected route - requires authentication
 */
share.post("/:id/share", async (c) => {
    try {
        const devotionId = c.req.param("id");
        const userId = c.get("userId");
        const supabaseClient = c.get("supabase");

        if (!userId) {
            return c.json({ error: "Unauthorized" }, 401);
        }

        logger.info("Creating share link", { devotionId, userId });

        // Fetch the devotion (ensure user owns it)
        const { data: devotion, error: fetchError } = await supabaseClient
            .from("devotions")
            .select("*")
            .eq("id", devotionId)
            .eq("user_id", userId)
            .single();

        if (fetchError || !devotion) {
            logger.error(
                "Devotion not found or access denied",
                fetchError as Error,
            );
            return c.json(
                { error: "Devotion not found or access denied" },
                404,
            );
        }

        // Get the decrypted content
        let plainContent: string;
        if (devotion.is_encrypted && devotion.encrypted_content) {
            // Fetch user's encryption key
            const userKey = await getUserEncryptionKey(userId);
            if (!userKey) {
                logger.error("User encryption key not found");
                return c.json({ error: "Encryption key not found" }, 500);
            }
            plainContent = decryptContent(devotion.encrypted_content, userKey);
        } else {
            plainContent = devotion.content;
        }

        // Generate share token and encryption key
        const shareToken = crypto.randomUUID();
        const shareKey = generateShareKey();

        // Encrypt content with share-specific key
        const encryptedSharedContent = encryptForSharing(
            plainContent,
            shareKey,
        );

        // Update devotion with share info
        const { error: updateError } = await supabaseClient
            .from("devotions")
            .update({
                share_token: shareToken,
                encrypted_shared_content: encryptedSharedContent,
                is_shared: true,
                shared_at: new Date().toISOString(),
            })
            .eq("id", devotionId);

        if (updateError) {
            logger.error(
                "Failed to update devotion with share info",
                updateError as Error,
            );
            return c.json({ error: "Failed to create share link" }, 500);
        }

        logger.info("Share link created successfully", {
            devotionId,
            shareToken,
        });

        // Return the share token and key (key will be added to URL hash on frontend)
        return c.json({
            shareToken,
            shareKey,
            message: "Share link created successfully",
        });
    } catch (error) {
        logger.error("Error creating share link", error as Error);
        return c.json({ error: "Internal server error" }, 500);
    }
});

/**
 * DELETE /api/devotions/:id/share
 * Revoke a share link (disable sharing)
 * Protected route - requires authentication
 */
share.delete("/:id/share", async (c) => {
    try {
        const devotionId = c.req.param("id");
        const userId = c.get("userId");
        const supabaseClient = c.get("supabase");

        if (!userId) {
            return c.json({ error: "Unauthorized" }, 401);
        }

        logger.info("Revoking share link", { devotionId, userId });

        // Update devotion to disable sharing
        const { error: updateError } = await supabaseClient
            .from("devotions")
            .update({
                share_token: null,
                encrypted_shared_content: null,
                is_shared: false,
                shared_at: null,
            })
            .eq("id", devotionId)
            .eq("user_id", userId);

        if (updateError) {
            logger.error("Failed to revoke share link", updateError as Error);
            return c.json({ error: "Failed to revoke share link" }, 500);
        }

        logger.info("Share link revoked successfully", { devotionId });

        return c.json({ message: "Share link revoked successfully" });
    } catch (error) {
        logger.error("Error revoking share link", error as Error);
        return c.json({ error: "Internal server error" }, 500);
    }
});

export default share;
