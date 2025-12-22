import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import sanitizeHtml from "sanitize-html";
import { supabase } from "../lib/supabase";
import { logger } from "../lib/logger";
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

        // 5. Safe Insertion
        const { data, error } = await supabase
            .from("devotions")
            .insert({
                user_id: user.id,
                content: cleanContent,
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

        logger.info("Devotion created successfully", {
            userId: user.id,
            devotionId: data.id,
        });

        return c.json({ success: true, devotion: data });
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
    });

    return c.json(data);
});

// GET remains mostly the same, but now serves clean data
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

    return c.json(data);
});

export default devotions;
