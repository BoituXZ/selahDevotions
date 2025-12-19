import { createMiddleware } from "hono/factory";
import { createClient } from "@supabase/supabase-js";

// You need these in your backend .env file too!
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_KEY!; // Use the SERVICE_ROLE key or ANON key

export const authMiddleware = createMiddleware(async (c, next) => {
    const authHeader = c.req.header("Authorization");

    if (!authHeader) {
        return c.json({ error: "Unauthorized: Missing token" }, 401);
    }

    // The header looks like: "Bearer eyJhbGci..."
    const token = authHeader.split(" ")[1];

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify the user
    const {
        data: { user },
        error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
        return c.json({ error: "Unauthorized: Invalid token" }, 401);
    }

    // Attach user to the context so we can use it in routes
    c.set("user", user);

    await next();
});
