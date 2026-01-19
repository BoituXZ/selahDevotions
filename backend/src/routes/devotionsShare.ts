import { SupabaseClient } from "@supabase/supabase-js";
import { Hono } from "hono";

type Variables = {
    supabase: SupabaseClient;
};
const devotionShare = new Hono<{ Variables: Variables }>();

devotionShare.get("/:shareid", async (c) => {
    const token = c.req.param("shareid");
    const supabase = c.get("supabase");

    const { data, error } = await supabase
        .from("devotions")
        .select(
            `
    content,
    mood,
    created_at,
    profiles ( full_name ) 
  `,
        )
        .eq("share_token", token)
        .single();
});
