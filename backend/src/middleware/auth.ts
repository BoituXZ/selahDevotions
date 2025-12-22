import { createMiddleware } from "hono/factory";
import { createClient } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import { env } from "../lib/env";
import { logger } from "../lib/logger";

export const authMiddleware = createMiddleware(async (c, next) => {
    const authHeader = c.req.header("Authorization");

    if (!authHeader) {
        logger.warn("Auth failed: Missing Authorization header");
        return c.json({ error: "Unauthorized: Missing token" }, 401);
    }

    // The header looks like: "Bearer eyJhbGci..."
    const token = authHeader.split(" ")[1];

    if (!token) {
        logger.warn("Auth failed: Malformed Authorization header");
        return c.json({ error: "Unauthorized: Malformed token" }, 401);
    }

    // Verify the user using singleton Supabase client
    const {
        data: { user },
        error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
        logger.warn("Auth failed: Invalid token", {
            error: error?.message,
        });
        return c.json({ error: "Unauthorized: Invalid token" }, 401);
    }

    logger.debug("User authenticated successfully", {
        userId: user.id,
        email: user.email,
    });

    // Create a scoped Supabase client for this request
    // This passes the user's JWT to Postgres, enabling RLS
    const scopedSupabase = createClient(env.SUPABASE_URL, env.SUPABASE_KEY, {
        global: {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        },
    });

    // Attach user and scoped client to the context
    c.set("user", user);
    c.set("supabase", scopedSupabase);

    await next();
});
