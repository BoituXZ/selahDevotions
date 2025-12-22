import { Hono } from "hono";
import { SupabaseClient } from "@supabase/supabase-js";

type Variables = {
    user: {
        id: string;
    };
    supabase: SupabaseClient;
};

const streaks = new Hono<{ Variables: Variables }>();

streaks.get("/", async (c) => {
    const user = c.get("user");
    const supabase = c.get("supabase");

    const { data, error } = await supabase
        .from("streaks")
        .select("*")
        .eq("user_id", user.id)
        .single();

    // Handle "new user has no streak row yet" gracefully
    if (error && error.code !== "PGRST116") {
        return c.json({ error: error.message }, 500);
    }

    return c.json(data || { current_streak: 0, longest_streak: 0 });
});

export default streaks;