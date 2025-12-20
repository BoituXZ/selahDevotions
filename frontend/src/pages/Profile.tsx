import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, BookHeart, Flame, LogOut } from "lucide-react";
import { supabase } from "../auth/supabase";
import { useAuth } from "../AuthProvider";
import { api } from "../api";
import { toast } from "sonner";
import UserAvatar from "../components/UserAvatar";
import type { Devotion } from "../types/types";

interface StreakData {
    current_streak: number;
    longest_streak: number;
}

export default function Profile() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [devotionsCount, setDevotionsCount] = useState<number>(0);
    const [streak, setStreak] = useState<StreakData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch user stats
        Promise.all([
            api.get<Devotion[]>("/api/devotions"),
            api.get<StreakData>("/api/streaks"),
        ])
            .then(([devotions, streakData]) => {
                setDevotionsCount(devotions.length);
                setStreak(streakData);
            })
            .catch((err) => console.error("Failed to fetch stats:", err))
            .finally(() => setLoading(false));
    }, []);

    const handleLogout = () => {
        toast("Are you sure you want to sign out?", {
            action: {
                label: "Sign Out",
                onClick: async () => {
                    await supabase.auth.signOut();
                    toast.success("Signed out successfully");
                    navigate("/");
                },
            },
            cancel: {
                label: "Cancel",
                onClick: () => {},
            },
            duration: 5000,
        });
    };

    if (!user) return null;

    // Extract user name from email or metadata
    const userName =
        user.user_metadata?.name ||
        user.email?.split("@")[0] ||
        "Friend";
    const memberSince = new Date(user.created_at).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
    });

    return (
        <div className="min-h-screen bg-stone-50 p-4 md:p-8">
            <div className="max-w-2xl mx-auto">
                {/* Header Section */}
                <div className="bg-white rounded-2xl shadow-lg p-8 mb-6 text-center animate-[scaleIn_0.5s_ease-out]">
                    {/* Avatar */}
                    <div className="flex justify-center mb-4">
                        <UserAvatar
                            email={user.email || ""}
                            name={userName}
                            size="xl"
                        />
                    </div>

                    {/* User Info */}
                    <h1 className="text-3xl font-serif text-stone-800 mb-1 capitalize">
                        {userName}
                    </h1>
                    <p className="text-stone-500">{user.email}</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    {/* Member Since Card */}
                    <div
                        className="bg-white rounded-xl shadow-sm border border-stone-200 p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 animate-[fadeInUp_0.5s_ease-out_forwards] opacity-0"
                        style={{ animationDelay: "100ms" }}
                    >
                        <div className="flex flex-col items-center text-center">
                            <div className="bg-stone-100 p-3 rounded-full mb-3 text-stone-700">
                                <Calendar size={24} />
                            </div>
                            <div className="text-2xl font-bold text-stone-800 mb-1">
                                {loading ? "..." : memberSince}
                            </div>
                            <div className="text-sm text-stone-500">
                                Member Since
                            </div>
                        </div>
                    </div>

                    {/* Total Devotions Card */}
                    <div
                        className="bg-white rounded-xl shadow-sm border border-stone-200 p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 animate-[fadeInUp_0.5s_ease-out_forwards] opacity-0"
                        style={{ animationDelay: "200ms" }}
                    >
                        <div className="flex flex-col items-center text-center">
                            <div className="bg-emerald-100 p-3 rounded-full mb-3 text-emerald-700">
                                <BookHeart size={24} />
                            </div>
                            <div className="text-4xl font-bold text-stone-800 mb-1">
                                {loading ? "..." : devotionsCount}
                            </div>
                            <div className="text-sm text-stone-500">
                                Total Devotions
                            </div>
                        </div>
                    </div>

                    {/* Current Streak Card */}
                    <div
                        className="bg-white rounded-xl shadow-sm border border-stone-200 p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 animate-[fadeInUp_0.5s_ease-out_forwards] opacity-0"
                        style={{ animationDelay: "300ms" }}
                    >
                        <div className="flex flex-col items-center text-center">
                            <div className="bg-orange-100 p-3 rounded-full mb-3 text-orange-600">
                                <Flame size={24} />
                            </div>
                            <div className="text-4xl font-bold text-stone-800 mb-1">
                                {loading ? "..." : streak?.current_streak || 0}
                            </div>
                            <div className="text-sm text-stone-500">
                                Day Streak
                            </div>
                        </div>
                    </div>
                </div>

                {/* Settings Section (Placeholder for future) */}
                <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6 mb-6 animate-[fadeInUp_0.5s_ease-out_forwards] opacity-0" style={{ animationDelay: "400ms" }}>
                    <h2 className="text-xl font-serif text-stone-800 mb-4">
                        Settings
                    </h2>
                    <p className="text-stone-500 text-sm">
                        More settings and preferences coming soon...
                    </p>
                </div>

                {/* Danger Zone - Logout */}
                <div
                    className="bg-white rounded-xl shadow-sm border border-red-200 p-6 animate-[fadeInUp_0.5s_ease-out_forwards] opacity-0"
                    style={{ animationDelay: "500ms" }}
                >
                    <h2 className="text-xl font-serif text-stone-800 mb-2">
                        Sign Out
                    </h2>
                    <p className="text-stone-600 text-sm mb-4">
                        You can always come back and continue your spiritual
                        journey.
                    </p>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700 transition shadow-lg hover:shadow-xl hover:-translate-y-0.5 duration-200"
                    >
                        <LogOut size={18} />
                        Sign Out
                    </button>
                </div>
            </div>
        </div>
    );
}
