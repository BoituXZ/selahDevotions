import { Hono } from "hono";
import { SupabaseClient } from "@supabase/supabase-js";
import { logger } from "../lib/logger";

type Variables = {
    user: {
        id: string;
    };
    supabase: SupabaseClient;
};

const preferences = new Hono<{ Variables: Variables }>();

// GET /api/preferences
preferences.get("/", async (c) => {
    const user = c.get("user");
    const supabase = c.get("supabase");

    const { data, error } = await supabase
        .from("user_preferences")
        .select("*")
        .eq("user_id", user.id)
        .single();

    // Return defaults for ANY error OR if no data
    // This handles table not existing, network errors, etc.
    if (error || !data) {
        logger.debug("Preferences not found, returning defaults", {
            userId: user.id,
            errorCode: error?.code,
        });
        return c.json({
            user_id: user.id,
            has_seen_encryption_notice: false,
            theme_preference: "system",
        });
    }

    return c.json(data);
});

// POST /api/preferences/mark-encryption-notice-seen
preferences.post("/mark-encryption-notice-seen", async (c) => {
    const user = c.get("user");
    const supabase = c.get("supabase");

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

// POST /api/preferences/update-theme
preferences.post("/update-theme", async (c) => {
    const user = c.get("user");
    const supabase = c.get("supabase");

    const body = await c.req.json();
    const { theme_preference } = body;

    // Validate theme preference
    if (!theme_preference || !["light", "dark", "system"].includes(theme_preference)) {
        logger.warn("Invalid theme preference", { userId: user.id, theme_preference });
        return c.json({ error: "Invalid theme preference. Must be 'light', 'dark', or 'system'" }, 400);
    }

    const { error } = await supabase
        .from("user_preferences")
        .upsert({
            user_id: user.id,
            theme_preference,
            updated_at: new Date().toISOString(),
        });

    if (error) {
        logger.error("Failed to update theme preference", error, { userId: user.id });
        return c.json({ error: error.message }, 500);
    }

    logger.info("User updated theme preference", { userId: user.id, theme_preference });
    return c.json({ success: true, theme_preference });
});

export default preferences;