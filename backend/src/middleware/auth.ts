import { createMiddleware } from "hono/factory";
import { supabase } from "../lib/supabase";
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

    // Attach user to the context so we can use it in routes
    c.set("user", user);

    await next();
});
