import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_KEY!;

// This creates a single instance we can import anywhere
export const supabase = createClient(supabaseUrl, supabaseKey);
