import { createClient } from "@supabase/supabase-js";
import { env } from "./env";

// This creates a single instance we can import anywhere
// Uses type-safe environment variables validated at startup
export const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_KEY);

// Admin client with Service Role Key - strict RLS bypass for admin tasks only
// USE WITH CAUTION: Only for system-level operations (e.g., encryption key management)
export const supabaseAdmin = createClient(
    env.SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY
);
