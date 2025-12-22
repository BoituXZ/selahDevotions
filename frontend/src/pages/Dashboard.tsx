import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { MoveRight, Sparkles, BookOpen } from "lucide-react";
import { api } from "../api";
import { useAuth } from "../AuthProvider";
import WelcomeModal from "../components/WelcomeModal";
import IndieTips from "../components/IndieTips";
import type { Devotion } from "../types/types";

interface StreakData {
    current_streak: number;
    longest_streak: number;
}

export default function Dashboard() {
    const { user, profile, profileLoading } = useAuth();
    const [streak, setStreak] = useState<StreakData | null>(null);
    const [latestDevotion, setLatestDevotion] = useState<Devotion | null>(null);
    const [devotionCount, setDevotionCount] = useState(0);
    const [showWelcome, setShowWelcome] = useState(false);

    // Check localStorage on mount for welcome modal
    useEffect(() => {
        const hasSeenWelcome = localStorage.getItem("hasSeenWelcome");
        if (!hasSeenWelcome) {
            setTimeout(() => setShowWelcome(true), 300);
        }
    }, []);

    // Fetch data
    useEffect(() => {
        // Fetch Streak
        api.get<StreakData>("/api/streaks")
            .then(setStreak)
            .catch((err) => console.error("Streak fetch failed:", err));

        // Fetch Devotions (for count and latest)
        api.get<Devotion[]>("/api/devotions")
            .then((data) => {
                setDevotionCount(data.length);
                if (data.length > 0) {
                    // Assuming API returns sorted, otherwise sort by date desc
                    const sorted = data.sort(
                        (a, b) =>
                            new Date(b.created_at).getTime() -
                            new Date(a.created_at).getTime()
                    );
                    setLatestDevotion(sorted[0]);
                }
            })
            .catch((err) => console.error("Devotions fetch failed:", err));
    }, []);

    const handleWelcomeClose = () => {
        localStorage.setItem("hasSeenWelcome", "true");
        setShowWelcome(false);
    };

    const userName = profileLoading
        ? "..."
        : (profile?.full_name || "Friend");

    return (
        <>
            <WelcomeModal isOpen={showWelcome} onClose={handleWelcomeClose} />

            <div className="flex-1 overflow-y-auto bg-stone-50 pb-28 md:pb-12 p-6 md:p-12">
                <div className="max-w-5xl mx-auto space-y-12">
                    {/* Header Section */}
                    <header className="space-y-4 animate-[fadeInUp_0.5s_ease-out]">
                        <h1 className="text-4xl md:text-5xl font-serif text-stone-800 tracking-tight">
                            Peace be with you,{" "}
                            <span className="capitalize">{userName}</span>.
                        </h1>

                        {/* Clean Stats Row */}
                        <div className="flex items-center gap-3 text-stone-500 font-sans text-sm tracking-wide uppercase">
                            <span>
                                {streak?.current_streak || 0} Days Active
                            </span>
                            <span className="w-1 h-1 rounded-full bg-stone-300"></span>
                            <span>{devotionCount} Prayers</span>
                        </div>
                    </header>

                    {/* The Devotion Deck */}
                    <main className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Left Card: Last Devotion / Continue Journey */}
                        <Link
                            to={
                                latestDevotion
                                    ? `/devotions/${latestDevotion.id}`
                                    : "/devotions"
                            }
                            className="group relative bg-white rounded-2xl p-8 shadow-sm border border-stone-100 hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col justify-between min-h-[280px]"
                        >
                            <div className="absolute top-0 left-0 w-2 h-full bg-[#A3B18A]" />{" "}
                            {/* Sage accent */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-[#A3B18A]">
                                    <BookOpen size={20} strokeWidth={1.5} />
                                    <span className="text-xs font-bold tracking-wider uppercase">
                                        {latestDevotion
                                            ? "Continue your journey"
                                            : "Begin your journey"}
                                    </span>
                                </div>

                                <h3 className="text-2xl font-serif text-stone-800 leading-tight group-hover:text-stone-600 transition-colors line-clamp-3">
                                    {latestDevotion
                                        ? latestDevotion.content
                                              .replace(/<[^>]*>?/gm, "")
                                              .substring(0, 100) + "..."
                                        : "Start your first devotion today."}
                                </h3>
                            </div>
                            <div className="flex items-center gap-2 text-stone-400 group-hover:text-stone-800 transition-colors mt-8">
                                <span className="text-sm font-medium">
                                    Open Journal
                                </span>
                                <MoveRight
                                    size={16}
                                    strokeWidth={1.5}
                                    className="group-hover:translate-x-1 transition-transform"
                                />
                            </div>
                        </Link>

                        {/* Right Card: New Chat / Selah for a moment */}
                        <Link
                            to="/chat"
                            className="group relative bg-stone-900 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between min-h-[280px]"
                        >
                            {/* Decorative gradient blob */}
                            <div className="absolute -top-20 -right-20 w-64 h-64 bg-stone-800 rounded-full blur-3xl opacity-50 group-hover:opacity-70 transition-opacity" />

                            <div className="relative space-y-4 z-10">
                                <div className="flex items-center gap-2 text-stone-400">
                                    <Sparkles size={20} strokeWidth={1.5} />
                                    <span className="text-xs font-bold tracking-wider uppercase">
                                        New Reflection
                                    </span>
                                </div>

                                <h3 className="text-3xl font-serif text-white leading-tight">
                                    Selah for a moment...
                                </h3>
                                <p className="text-stone-400 font-sans leading-relaxed max-w-sm">
                                    Find clarity and peace through conversation.
                                </p>
                            </div>

                            <div className="relative flex items-center gap-2 text-stone-500 group-hover:text-white transition-colors mt-8 z-10">
                                <span className="text-sm font-medium">
                                    Start Chat
                                </span>
                                <MoveRight
                                    size={16}
                                    strokeWidth={1.5}
                                    className="group-hover:translate-x-1 transition-transform"
                                />
                            </div>
                        </Link>
                    </main>

                    {/* Indie Vibe Tip */}
                    <IndieTips />
                </div>
            </div>
        </>
    );
}
