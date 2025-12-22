import { Hono } from "hono";
import { supabase } from "../lib/supabase";
import { logger } from "../lib/logger";

type Variables = {
    user: {
        id: string;
    };
};

const preferences = new Hono<{ Variables: Variables }>();

// GET /api/preferences
preferences.get("/", async (c) => {
    const user = c.get("user");

    const { data, error } = await supabase
        .from("user_preferences")
        .select("*")
        .eq("user_id", user.id)
        .single();

    if (error && error.code !== "PGRST116") {
        logger.error("Failed to fetch preferences", error, { userId: user.id });
        return c.json({ error: error.message }, 500);
    }

    // Return default preferences if not found
    if (!data) {
        return c.json({
            user_id: user.id,
            has_seen_encryption_notice: false,
        });
    }

    return c.json(data);
});

// POST /api/preferences/mark-encryption-notice-seen
preferences.post("/mark-encryption-notice-seen", async (c) => {
    const user = c.get("user");

    const { error } = await supabase
        .from("user_preferences")
        .upsert({
            user_id: user.id,
            has_seen_encryption_notice: true,
            updated_at: new Date().toISOString(),
        });

    if (error) {
        logger.error("Failed to update preferences", error, { userId: user.id });
        return c.json({ error: error.message }, 500);
    }

    logger.info("User marked encryption notice as seen", { userId: user.id });
    return c.json({ success: true });
});

export default preferences;
