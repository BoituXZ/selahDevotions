import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    Globe,
    Linkedin,
    Mail,
    Turntable,
    MessageCircle,
    ChevronDown,
} from "lucide-react";
import { supabase } from "../auth/supabase";
import { useAuth } from "../AuthProvider";
import {
    useTheme,
    type ThemePreference,
} from "../providers/ThemeProvider";
import { api } from "../api";
import { toast } from "sonner";
import UserAvatar from "../components/UserAvatar";
import type { Devotion } from "../types/types";

interface StreakData {
    current_streak: number;
    longest_streak: number;
}

// Smooth count-up animation hook
function useCountUp(target: number, active: boolean, duration = 900) {
    const [count, setCount] = useState(0);
    useEffect(() => {
        if (!active) return;
        if (target === 0) {
            setCount(0);
            return;
        }
        const startTime = performance.now();
        const tick = (now: number) => {
            const progress = Math.min((now - startTime) / duration, 1);
            // Cubic ease-out
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * target));
            if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    }, [target, active, duration]);
    return count;
}

const THEME_OPTIONS: { value: ThemePreference; label: string }[] = [
    { value: "light", label: "Light" },
    { value: "system", label: "System" },
    { value: "dark", label: "Dark" },
];

export default function Profile() {
    const { user, profile, profileLoading } = useAuth();
    const { preference, setPreference } = useTheme();
    const navigate = useNavigate();
    const [devotionsCount, setDevotionsCount] = useState(0);
    const [streak, setStreak] = useState<StreakData | null>(null);
    const [loading, setLoading] = useState(true);
    const [statsVisible, setStatsVisible] = useState(false);
    const [aboutExpanded, setAboutExpanded] = useState(false);

    useEffect(() => {
        Promise.all([
            api.get<Devotion[]>("/api/devotions"),
            api.get<StreakData>("/api/streaks"),
        ])
            .then(([devotions, streakData]) => {
                setDevotionsCount(devotions.length);
                setStreak(streakData);
                setLoading(false);
                // Small delay so the entrance animation is visible before counting starts
                setTimeout(() => setStatsVisible(true), 200);
            })
            .catch((err) => {
                console.error("Failed to fetch stats:", err);
                setLoading(false);
            });
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
            cancel: { label: "Cancel", onClick: () => {} },
            duration: 5000,
        });
    };

    const handleThemeChange = (pref: ThemePreference) => {
        setPreference(pref);
        api.post("/api/preferences/update-theme", { theme_preference: pref }).catch(
            () => {},
        );
    };

    // Count-up values — always called at top level (rules of hooks)
    const countDevotions = useCountUp(devotionsCount, statsVisible);
    const countStreak = useCountUp(streak?.current_streak ?? 0, statsVisible);
    const countLongest = useCountUp(streak?.longest_streak ?? 0, statsVisible);

    if (!user) return null;

    const userName = profileLoading ? "..." : profile?.full_name || "Friend";
    const memberSince = new Date(user.created_at).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
    });

    return (
        <div className="flex-1 overflow-y-auto bg-stone-50 dark:bg-stone-950 pb-28 md:pb-16 p-6 md:p-12">
            <div className="max-w-xl mx-auto space-y-6">

                {/* Header — left-aligned, no card wrapper */}
                <header className="flex items-start gap-5 animate-[fadeInUp_0.4s_ease-out] pt-2">
                    <div className="ring-2 ring-[#A3B18A] rounded-full shrink-0">
                        <UserAvatar
                            email={user.email || ""}
                            name={userName}
                            size="lg"
                        />
                    </div>
                    <div className="pt-2 min-w-0">
                        <h1 className="text-3xl font-serif text-stone-800 dark:text-stone-100 capitalize leading-tight truncate">
                            {userName}
                        </h1>
                        <p className="text-sm text-stone-400 dark:text-stone-500 mt-0.5 font-sans truncate">
                            {user.email}
                        </p>
                        <p className="text-xs text-stone-400 dark:text-stone-500 mt-1 font-sans">
                            Member since {memberSince}
                        </p>
                    </div>
                </header>

                {/* Stats — horizontal 3-column with count-up */}
                <div className="grid grid-cols-3 border border-stone-200 dark:border-stone-800 rounded-2xl overflow-hidden divide-x divide-stone-200 dark:divide-stone-800 bg-white dark:bg-stone-900 animate-[fadeInUp_0.5s_ease-out_0.1s_forwards] opacity-0">
                    <div className="px-4 py-6 text-center">
                        <div className="text-4xl font-serif font-light text-stone-800 dark:text-stone-100 animate-[countUp_0.4s_ease-out]">
                            {loading ? "—" : countDevotions}
                        </div>
                        <div className="text-[10px] uppercase tracking-widest text-stone-400 dark:text-stone-500 mt-2 font-sans">
                            Entries
                        </div>
                    </div>
                    <div className="px-4 py-6 text-center">
                        <div className="text-4xl font-serif font-light text-stone-800 dark:text-stone-100 animate-[countUp_0.4s_ease-out_0.1s_both]">
                            {loading ? "—" : countStreak}
                        </div>
                        <div className="text-[10px] uppercase tracking-widest text-stone-400 dark:text-stone-500 mt-2 font-sans">
                            Day Streak
                        </div>
                    </div>
                    <div className="px-4 py-6 text-center">
                        <div className="text-4xl font-serif font-light text-stone-800 dark:text-stone-100 animate-[countUp_0.4s_ease-out_0.2s_both]">
                            {loading ? "—" : countLongest}
                        </div>
                        <div className="text-[10px] uppercase tracking-widest text-stone-400 dark:text-stone-500 mt-2 font-sans">
                            Best Streak
                        </div>
                    </div>
                </div>

                {/* Appearance / Theme toggle */}
                <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 px-6 py-4 animate-[fadeInUp_0.5s_ease-out_0.2s_forwards] opacity-0">
                    <div className="flex items-center justify-between gap-4">
                        <span className="text-sm font-sans text-stone-600 dark:text-stone-300 shrink-0">
                            Appearance
                        </span>
                        <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-800 rounded-lg p-1">
                            {THEME_OPTIONS.map(({ value, label }) => (
                                <button
                                    key={value}
                                    onClick={() => handleThemeChange(value)}
                                    className={`px-3 py-1.5 rounded-md text-xs font-sans transition-all duration-150 ${
                                        preference === value
                                            ? "bg-white dark:bg-stone-700 text-stone-800 dark:text-stone-100 shadow-sm font-medium"
                                            : "text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300"
                                    }`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* About / Social — collapsible */}
                <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 overflow-hidden animate-[fadeInUp_0.5s_ease-out_0.3s_forwards] opacity-0">
                    <button
                        onClick={() => setAboutExpanded((p) => !p)}
                        className="w-full flex items-center justify-between px-6 py-4 text-left"
                    >
                        <span className="text-sm font-sans text-stone-500 dark:text-stone-400">
                            Selah v1.2.0 <br/> Built by Boitu
                        </span>
                        <ChevronDown
                            size={15}
                            strokeWidth={1.5}
                            className={`text-stone-400 shrink-0 transition-transform duration-200 ${
                                aboutExpanded ? "rotate-180" : ""
                            }`}
                        />
                    </button>

                    {aboutExpanded && (
                        <div className="px-6 pb-6 border-t border-stone-100 dark:border-stone-800 pt-5">
                            {/* Icon-only social links */}
                            <div className="flex items-center gap-6 mb-5">
                                <a
                                    href="https://boitumelo.me/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors"
                                    aria-label="Website"
                                >
                                    <Globe size={18} strokeWidth={1.5} />
                                </a>
                                <a
                                    href="https://www.linkedin.com/in/boituxz/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors"
                                    aria-label="LinkedIn"
                                >
                                    <Linkedin size={18} strokeWidth={1.5} />
                                </a>
                                <a
                                    href="mailto:boituu.xz@gmail.com"
                                    className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors"
                                    aria-label="Email"
                                >
                                    <Mail size={18} strokeWidth={1.5} />
                                </a>
                                <a
                                    href="https://wa.me/27672178866"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors"
                                    aria-label="WhatsApp"
                                >
                                    <MessageCircle size={18} strokeWidth={1.5} />
                                </a>
                                <a
                                    href="https://open.spotify.com/playlist/7HKpLTkiJYRKGQs6ZJypzr?si=51660fdc4341448d"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors"
                                    aria-label="Spotify"
                                >
                                    <Turntable size={18} strokeWidth={1.5} />
                                </a>
                            </div>
                            <p className="text-xs text-stone-400 dark:text-stone-500 italic font-sans">
                                "Built with code, coffee, and a lot of grace."
                            </p>
                        </div>
                    )}
                </div>

                {/* Sign out — understated text link */}
                <div className="text-center py-2 animate-[fadeInUp_0.5s_ease-out_0.4s_forwards] opacity-0">
                    <button
                        onClick={handleLogout}
                        className="text-sm font-sans text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 transition-colors"
                    >
                        Sign out
                    </button>
                </div>
            </div>
        </div>
    );
}
