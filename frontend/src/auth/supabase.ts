import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Clear all Supabase auth tokens from localStorage.
 * Used to clean up potentially corrupted session data that can cause
 * blank screens when Chrome restores tabs after being completely closed.
 */
export const clearSupabaseAuth = (): void => {
    try {
        // Find and remove all Supabase auth-related localStorage keys
        // Pattern: sb-<project-ref>-auth-token
        const keysToRemove: string[] = [];

        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith("sb-") && key.includes("-auth-token")) {
                keysToRemove.push(key);
            }
        }

        keysToRemove.forEach((key) => {
            localStorage.removeItem(key);
        });

        // Also try to sign out from Supabase client to clear any in-memory state
        supabase.auth.signOut().catch(() => {
            // Ignore errors - we're already in a failed state
        });
    } catch (err) {
        console.error("Failed to clear Supabase auth tokens:", err);
    }
};
