import { createContext, useContext, useEffect, useState } from "react";
import { type Session, type User } from "@supabase/supabase-js";
import { supabase } from "../src/auth/supabase";
import type { Profile } from "./types/types";

interface AuthContextType {
    user: User | null;
    session: Session | null;
    profile: Profile | null;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    session: null,
    profile: null,
    loading: true,
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);

    // Fetch profile data from the profiles table
    const fetchProfile = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", userId)
                .single();

            if (error) {
                console.error("Error fetching profile:", error);
                return null;
            }

            return data as Profile;
        } catch (err) {
            console.error("Failed to fetch profile:", err);
            return null;
        }
    };

    useEffect(() => {
        let isCancelled = false;
        console.log("🔐 AuthProvider: Initializing auth...");

        const initAuth = async () => {
            try {
                // Check active session
                const {
                    data: { session },
                    error,
                } = await supabase.auth.getSession();

                if (isCancelled) return;

                if (error) {
                    console.error("❌ Session error:", error);
                    // Don't nuking tokens immediately on error allows for retry if it's network related
                    // but if we have an explicit error, we might want to redirect.
                    // For now, let's just set no session and let the UI handle it (ProtectedLayout will redirect).
                    setSession(null);
                    setUser(null);
                } else {
                    setSession(session);
                    setUser(session?.user ?? null);

                    if (session?.user) {
                        // Fetch profile in background, don't block
                        fetchProfile(session.user.id).then((profileData) => {
                            if (!isCancelled) setProfile(profileData);
                        });
                    }
                }
            } catch (err) {
                console.error("❌ Auth initialization error:", err);
                if (!isCancelled) {
                    setSession(null);
                    setUser(null);
                }
            } finally {
                if (!isCancelled) setLoading(false);
            }
        };

        initAuth();

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log(`🔐 Auth event: ${event}`);

            if (isCancelled) return;

            setSession(session);
            setUser(session?.user ?? null);

            if (event === "SIGNED_OUT") {
                setProfile(null);
                // Optional: Clear data if needed, but usually handled by redirection
            } else if (
                session?.user &&
                (event === "SIGNED_IN" || event === "TOKEN_REFRESHED")
            ) {
                // Refresh profile on sign in
                const profileData = await fetchProfile(session.user.id);
                if (!isCancelled) setProfile(profileData);
            }

            setLoading(false);
        });

        return () => {
            isCancelled = true;
            subscription.unsubscribe();
        };
    }, []);

    return (
        <AuthContext.Provider value={{ user, session, profile, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
}
