import { createClient } from "@supabase/supabase-js";
import { env } from "./env";

// This creates a single instance we can import anywhere
// Uses type-safe environment variables validated at startup
export const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_KEY);
