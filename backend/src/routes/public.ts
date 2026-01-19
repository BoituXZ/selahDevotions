import { Hono } from "hono";
import { supabaseAdmin } from "../lib/supabase";
import { logger } from "../lib/logger";

const publicRoutes = new Hono();

/**
 * GET /public/devotions/:token
 * Get a shared devotion by its share token
 * Public route - no authentication required
 * Uses supabaseAdmin to bypass RLS since this is a public endpoint
 */
publicRoutes.get("/devotions/:token", async (c) => {
    try {
        const token = c.req.param("token");

        logger.info("Fetching shared devotion", { shareToken: token });

        // Query devotion with share token (using admin client to bypass RLS)
        const { data: devotion, error } = await supabaseAdmin
            .from("devotions")
            .select(
                `
                id,
                user_id,
                encrypted_shared_content,
                scripture_ref,
                mood,
                created_at,
                shared_at
            `,
            )
            .eq("share_token", token)
            .eq("is_shared", true)
            .single();

        if (error || !devotion) {
            logger.error("Shared devotion not found", error as Error);
            return c.json(
                { error: "Shared devotion not found or no longer available" },
                404,
            );
        }

        // Fetch author name separately
        let authorName = "Anonymous";
        if (devotion.user_id) {
            const { data: profile } = await supabaseAdmin
                .from("profiles")
                .select("full_name")
                .eq("id", devotion.user_id)
                .single();

            if (profile?.full_name) {
                authorName = profile.full_name;
            }
        }

        // Security: Only return safe fields, never user_id or other sensitive data
        const safeResponse = {
            id: devotion.id,
            encrypted_shared_content: devotion.encrypted_shared_content,
            scripture_ref: devotion.scripture_ref || null,
            mood: devotion.mood || null,
            created_at: devotion.created_at,
            shared_at: devotion.shared_at,
            author: {
                full_name: authorName,
            },
        };

        logger.info("Shared devotion fetched successfully", {
            shareToken: token,
        });

        return c.json(safeResponse);
    } catch (error) {
        logger.error("Error fetching shared devotion", error as Error);
        return c.json({ error: "Internal server error" }, 500);
    }
});

export default publicRoutes;
