import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    Calendar,
    BookHeart,
    Flame,
    LogOut,
    Instagram,
    Linkedin,
    Mail,
    Turntable,
    Sun,
    Moon,
    Monitor,
} from "lucide-react";
import { supabase } from "../auth/supabase";
import { useAuth } from "../AuthProvider";
import { useTheme } from "../providers/ThemeProvider";
import { api } from "../api";
import { toast } from "sonner";
import UserAvatar from "../components/UserAvatar";
import type { Devotion } from "../types/types";

interface StreakData {
    current_streak: number;
    longest_streak: number;
}

export default function Profile() {
    const { user, profile, profileLoading } = useAuth();
    const { themeMode, effectiveTheme, setTheme } = useTheme();
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

    // Extract user name from profile or default
    const userName = profileLoading
        ? "..."
        : (profile?.full_name || "Friend");
    const memberSince = new Date(user.created_at).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
    });

    return (
        <div className="flex-1 overflow-y-auto bg-stone-50 dark:bg-stone-950 pb-28 md:pb-12 p-4 md:p-8">
            <div className="max-w-2xl mx-auto">
                {/* Header Section */}
                <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-lg p-8 mb-6 text-center animate-[scaleIn_0.5s_ease-out]">
                    {/* Avatar */}
                    <div className="flex justify-center mb-4">
                        <UserAvatar
                            email={user.email || ""}
                            name={userName}
                            size="xl"
                        />
                    </div>

                    {/* User Info */}
                    <h1 className="text-3xl font-serif text-stone-800 dark:text-stone-100 mb-1 capitalize">
                        {userName}
                    </h1>
                    <p className="text-stone-500 dark:text-stone-400">{user.email}</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    {/* Member Since Card */}
                    <div
                        className="bg-white dark:bg-stone-900 rounded-xl shadow-sm border border-stone-200 dark:border-stone-800 p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 animate-[fadeInUp_0.5s_ease-out_forwards] opacity-0"
                        style={{ animationDelay: "100ms" }}
                    >
                        <div className="flex flex-col items-center text-center">
                            <div className="bg-stone-100 dark:bg-stone-800 p-3 rounded-full mb-3 text-stone-700 dark:text-stone-300">
                                <Calendar size={24} />
                            </div>
                            <div className="text-2xl font-bold text-stone-800 dark:text-stone-100 mb-1">
                                {loading ? "..." : memberSince}
                            </div>
                            <div className="text-sm text-stone-500 dark:text-stone-400">
                                Member Since
                            </div>
                        </div>
                    </div>

                    {/* Total Devotions Card */}
                    <div
                        className="bg-white dark:bg-stone-900 rounded-xl shadow-sm border border-stone-200 dark:border-stone-800 p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 animate-[fadeInUp_0.5s_ease-out_forwards] opacity-0"
                        style={{ animationDelay: "200ms" }}
                    >
                        <div className="flex flex-col items-center text-center">
                            <div className="bg-emerald-100 dark:bg-emerald-900/30 p-3 rounded-full mb-3 text-emerald-700 dark:text-emerald-400">
                                <BookHeart size={24} />
                            </div>
                            <div className="text-4xl font-bold text-stone-800 dark:text-stone-100 mb-1">
                                {loading ? "..." : devotionsCount}
                            </div>
                            <div className="text-sm text-stone-500 dark:text-stone-400">
                                Total Devotions
                            </div>
                        </div>
                    </div>

                    {/* Current Streak Card */}
                    <div
                        className="bg-white dark:bg-stone-900 rounded-xl shadow-sm border border-stone-200 dark:border-stone-800 p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 animate-[fadeInUp_0.5s_ease-out_forwards] opacity-0"
                        style={{ animationDelay: "300ms" }}
                    >
                        <div className="flex flex-col items-center text-center">
                            <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-full mb-3 text-orange-600 dark:text-orange-400">
                                <Flame size={24} />
                            </div>
                            <div className="text-4xl font-bold text-stone-800 dark:text-stone-100 mb-1">
                                {loading ? "..." : streak?.current_streak || 0}
                            </div>
                            <div className="text-sm text-stone-500 dark:text-stone-400">
                                Day Streak
                            </div>
                        </div>
                    </div>
                </div>

                {/* Settings Section */}
                <div
                    className="bg-white dark:bg-stone-900 rounded-xl shadow-sm border border-stone-200 dark:border-stone-800 p-6 mb-6 animate-[fadeInUp_0.5s_ease-out_forwards] opacity-0"
                    style={{ animationDelay: "400ms" }}
                >
                    <h2 className="text-xl font-serif text-stone-800 dark:text-stone-100 mb-4">
                        Settings
                    </h2>

                    {/* Theme Preference Section */}
                    <div className="mb-6">
                        <label className="text-sm font-medium text-stone-700 dark:text-stone-300 mb-3 block">
                            Appearance
                        </label>
                        <div className="flex gap-3">
                            {/* Light Theme */}
                            <button
                                onClick={() => setTheme("light")}
                                className={`flex-1 px-4 py-3 rounded-lg border transition-all duration-200 ${
                                    themeMode === "light"
                                        ? "border-stone-900 dark:border-stone-50 bg-stone-900 dark:bg-stone-50 text-white dark:text-stone-900 shadow-lg"
                                        : "border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:border-stone-300 dark:hover:border-stone-600 hover:bg-stone-50 dark:hover:bg-stone-800"
                                }`}
                            >
                                <div className="flex flex-col items-center">
                                    <Sun size={18} className="mb-1" />
                                    <span className="text-xs font-medium">Light</span>
                                </div>
                            </button>

                            {/* Dark Theme */}
                            <button
                                onClick={() => setTheme("dark")}
                                className={`flex-1 px-4 py-3 rounded-lg border transition-all duration-200 ${
                                    themeMode === "dark"
                                        ? "border-stone-900 dark:border-stone-50 bg-stone-900 dark:bg-stone-50 text-white dark:text-stone-900 shadow-lg"
                                        : "border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:border-stone-300 dark:hover:border-stone-600 hover:bg-stone-50 dark:hover:bg-stone-800"
                                }`}
                            >
                                <div className="flex flex-col items-center">
                                    <Moon size={18} className="mb-1" />
                                    <span className="text-xs font-medium">Dark</span>
                                </div>
                            </button>

                            {/* System Theme */}
                            <button
                                onClick={() => setTheme("system")}
                                className={`flex-1 px-4 py-3 rounded-lg border transition-all duration-200 ${
                                    themeMode === "system"
                                        ? "border-stone-900 dark:border-stone-50 bg-stone-900 dark:bg-stone-50 text-white dark:text-stone-900 shadow-lg"
                                        : "border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:border-stone-300 dark:hover:border-stone-600 hover:bg-stone-50 dark:hover:bg-stone-800"
                                }`}
                            >
                                <div className="flex flex-col items-center">
                                    <Monitor size={18} className="mb-1" />
                                    <span className="text-xs font-medium">System</span>
                                </div>
                            </button>
                        </div>

                        {/* System preference indicator */}
                        {themeMode === "system" && (
                            <p className="text-xs text-stone-500 dark:text-stone-400 mt-2 text-center">
                                Following system preference:{" "}
                                <span className="font-medium capitalize">{effectiveTheme}</span>
                            </p>
                        )}
                    </div>
                </div>

                {/* Credits & Connect Card */}
                <div
                    className="bg-white dark:bg-stone-900 rounded-xl shadow-sm border border-stone-200 dark:border-stone-800 p-8 mb-6 animate-[fadeInUp_0.5s_ease-out_forwards] opacity-0"
                    style={{ animationDelay: "500ms" }}
                >
                    <h2 className="text-2xl font-serif text-stone-800 dark:text-stone-100 mb-6 text-center">
                        Connect with the Creator
                    </h2>

                    {/* Social Links */}
                    <div className="space-y-3 mb-6">
                        {/* Instagram */}
                        <a
                            href="https://instagram.com/b0ituu"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-4 p-4 rounded-lg hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors duration-200 group"
                        >
                            <div className="bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 p-2 rounded-lg text-white">
                                <Instagram size={20} />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm text-stone-500 dark:text-stone-400">
                                    Instagram
                                </p>
                                <p className="text-stone-800 dark:text-stone-200 font-medium group-hover:text-stone-600 dark:group-hover:text-stone-300">
                                    @b0ituu
                                </p>
                            </div>
                        </a>

                        {/* LinkedIn */}
                        <a
                            href="https://www.linkedin.com/in/boituxz/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-4 p-4 rounded-lg hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors duration-200 group"
                        >
                            <div className="bg-[#0A66C2] p-2 rounded-lg text-white">
                                <Linkedin size={20} />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm text-stone-500 dark:text-stone-400">
                                    LinkedIn
                                </p>
                                <p className="text-stone-800 dark:text-stone-200 font-medium group-hover:text-stone-600 dark:group-hover:text-stone-300">
                                    Boitu
                                </p>
                            </div>
                        </a>

                        {/* Email */}
                        <a
                            href="mailto:boituu.xz@gmail.com"
                            className="flex items-center gap-4 p-4 rounded-lg hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors duration-200 group"
                        >
                            <div className="bg-stone-700 dark:bg-stone-600 p-2 rounded-lg text-white">
                                <Mail size={20} />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm text-stone-500 dark:text-stone-400">Email</p>
                                <p className="text-stone-800 dark:text-stone-200 font-medium group-hover:text-stone-600 dark:group-hover:text-stone-300">
                                    boituu.xz@gmail.com
                                </p>
                            </div>
                        </a>
                        <a
                            href="https://open.spotify.com/playlist/7HKpLTkiJYRKGQs6ZJypzr?si=51660fdc4341448d"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-4 p-4 rounded-lg hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors duration-200 group"
                        >
                            <div className="bg-[#1ed760] p-2 rounded-lg text-black">
                                <Turntable size={20} />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm text-stone-500 dark:text-stone-400">
                                    Spotify Playlist
                                </p>
                                <p className="text-stone-800 dark:text-stone-200 font-medium group-hover:text-stone-600 dark:group-hover:text-stone-300">
                                    Boitu
                                </p>
                            </div>
                        </a>
                    </div>

                    {/* Quirky Note */}
                    <div className="border-t border-stone-200 dark:border-stone-700 pt-6 mb-4">
                        <p className="text-center text-stone-600 dark:text-stone-400 italic text-sm">
                            "Built with code, coffee, and a lot of grace."
                        </p>
                    </div>

                    {/* Footer Version */}
                    <div className="text-center">
                        <p className="text-xs text-stone-400 dark:text-stone-500">
                            Selah App v1.0.0
                        </p>
                    </div>
                </div>

                {/* Danger Zone - Logout */}
                <div
                    className="bg-white dark:bg-stone-900 rounded-xl shadow-sm border border-red-200 dark:border-red-900/50 p-6 animate-[fadeInUp_0.5s_ease-out_forwards] opacity-0"
                    style={{ animationDelay: "600ms" }}
                >
                    <h2 className="text-xl font-serif text-stone-800 dark:text-stone-100 mb-2">
                        Sign Out
                    </h2>
                    <p className="text-stone-600 dark:text-stone-400 text-sm mb-4">
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
