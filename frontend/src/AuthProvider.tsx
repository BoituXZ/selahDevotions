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
        // 1. Check active session on load
        supabase.auth
            .getSession()
            .then(async ({ data: { session }, error }) => {
                // If there's an error getting the session, redirect to login
                if (error) {
                    console.error("Session error:", error);
                    window.location.href = "/auth?mode=login";
                    return;
                }

                setSession(session);
                setUser(session?.user ?? null);

                if (session?.user) {
                    const profileData = await fetchProfile(session.user.id);
                    setProfile(profileData);
                }

                setLoading(false);
            });

        // 2. Listen for changes (login/logout)
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, session) => {
            setSession(session);
            setUser(session?.user ?? null);

            // Handle token expiration or sign out
            if (event === "TOKEN_REFRESHED") {
                console.log("Token refreshed successfully");
            }

            if (event === "SIGNED_OUT") {
                setProfile(null);
                // Redirect to login
                window.location.href = "/auth?mode=login";
            }

            if (session?.user) {
                const profileData = await fetchProfile(session.user.id);
                setProfile(profileData);
            } else {
                setProfile(null);
            }

            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    return (
        <AuthContext.Provider value={{ user, session, profile, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
}
