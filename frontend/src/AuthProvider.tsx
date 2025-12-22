import { createContext, useContext, useEffect, useState } from "react";
import { type Session, type User } from "@supabase/supabase-js";
import { supabase } from "../src/auth/supabase";
import type { Profile } from "./types/types";

interface AuthContextType {
    user: User | null;
    session: Session | null;
    profile: Profile | null;
    loading: boolean;        // Auth loading (session check)
    profileLoading: boolean; // Profile fetch loading
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    session: null,
    profile: null,
    loading: true,
    profileLoading: false,
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [profileLoading, setProfileLoading] = useState(false);

    // Fetch profile data from the profiles table
    const fetchProfile = async (user: User) => {
        try {
            // Add timeout to profile fetch to prevent hanging
            const profileTimeout = new Promise<null>((_, reject) =>
                setTimeout(() => reject(new Error("Profile fetch timeout")), 8000)
            );

            const profileFetch = supabase
                .from("profiles")
                .select("*")
                .eq("id", user.id)
                .single();

            const result = await Promise.race([profileFetch, profileTimeout]);

            if (result === null) {
                console.error("Profile fetch timed out");
                return null;
            }

            const { data, error } = result as any;

            if (error) {
                console.error("Error fetching profile:", error);
                return null;
            }

            let profileData = data as Profile;

            // Sync full_name from auth metadata if missing in profile
            if (!profileData.full_name && user.user_metadata?.full_name) {
                const fullName = user.user_metadata.full_name;

                const { error: updateError } = await supabase
                    .from("profiles")
                    .update({ full_name: fullName })
                    .eq("id", user.id);

                if (!updateError) {
                    profileData = { ...profileData, full_name: fullName };
                }
            }

            return profileData;
        } catch (err) {
            console.error("Failed to fetch profile:", err);
            return null;
        }
    };

    useEffect(() => {
        let isCancelled = false;

        const initAuth = async () => {
            try {
                // Create a promise that rejects after 10 seconds
                const timeoutPromise = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error("Auth timeout")), 10000)
                );

                // Check active session with race condition
                const {
                    data: { session },
                    error,
                } = await Promise.race([
                    supabase.auth.getSession(),
                    timeoutPromise.then(() => { throw new Error("Auth timeout"); })
                ]) as any;

                if (isCancelled) return;

                if (error) {
                    console.error("Session error:", error);
                    setSession(null);
                    setUser(null);
                    setProfile(null);
                } else {
                    setSession(session);
                    setUser(session?.user ?? null);

                    if (session?.user) {
                        // Set profileLoading BEFORE starting fetch
                        setProfileLoading(true);

                        // Fetch profile in background (non-blocking for faster app load)
                        fetchProfile(session.user).then((profileData) => {
                            if (!isCancelled) {
                                setProfile(profileData);
                                setProfileLoading(false);
                            }
                        }).catch((err) => {
                            console.error("Profile fetch failed:", err);
                            if (!isCancelled) {
                                setProfileLoading(false);
                            }
                        });
                    }
                }
            } catch (err) {
                console.error("Auth initialization error:", err);
                if (!isCancelled) {
                    setSession(null);
                    setUser(null);
                    setProfile(null);
                    setProfileLoading(false);
                }
            } finally {
                if (!isCancelled) {
                    setLoading(false);
                }
            }
        };

        initAuth();

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (isCancelled) return;

            setSession(session);
            setUser(session?.user ?? null);

            if (event === "SIGNED_OUT") {
                setProfile(null);
                setProfileLoading(false);
            } else if (
                session?.user &&
                (event === "SIGNED_IN" || event === "TOKEN_REFRESHED")
            ) {
                // Set profileLoading BEFORE fetching
                setProfileLoading(true);

                // Refresh profile in background (non-blocking)
                fetchProfile(session.user).then((profileData) => {
                    if (!isCancelled) {
                        setProfile(profileData);
                        setProfileLoading(false);
                    }
                }).catch((err) => {
                    console.error("Profile fetch on auth change failed:", err);
                    if (!isCancelled) {
                        setProfileLoading(false);
                    }
                });
            }

            setLoading(false);
        });

        return () => {
            isCancelled = true;
            subscription.unsubscribe();
        };
    }, []);

    return (
        <AuthContext.Provider value={{ user, session, profile, loading, profileLoading }}>
            {children}
        </AuthContext.Provider>
    );
}
