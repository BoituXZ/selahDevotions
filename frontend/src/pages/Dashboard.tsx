import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { MoveRight } from "lucide-react";
import { api } from "../api";
import { useAuth } from "../AuthProvider";
import WelcomeModal from "../components/WelcomeModal";
import type { Devotion, Plan } from "../types/types";

interface StreakData {
    current_streak: number;
    longest_streak: number;
}

export default function Dashboard() {
    const { profile, profileLoading } = useAuth();
    const [streak, setStreak] = useState<StreakData | null>(null);
    const [latestDevotion, setLatestDevotion] = useState<Devotion | null>(null);
    const [devotionCount, setDevotionCount] = useState(0);
    const [activePlan, setActivePlan] = useState<Plan | null>(null);
    const [showWelcome, setShowWelcome] = useState(false);

    useEffect(() => {
        const hasSeenWelcome = localStorage.getItem("hasSeenWelcome");
        if (!hasSeenWelcome) {
            setTimeout(() => setShowWelcome(true), 300);
        }
    }, []);

    useEffect(() => {
        api.get<StreakData>("/api/streaks")
            .then(setStreak)
            .catch((err) => console.error("Streak fetch failed:", err));

        api.get<Devotion[]>("/api/devotions")
            .then((data) => {
                setDevotionCount(data.length);
                if (data.length > 0) {
                    const sorted = data.sort(
                        (a, b) =>
                            new Date(b.created_at).getTime() -
                            new Date(a.created_at).getTime(),
                    );
                    setLatestDevotion(sorted[0]);
                }
            })
            .catch((err) => console.error("Devotions fetch failed:", err));

        api.get<{ success: boolean; plans: Plan[] }>("/api/plans")
            .then(({ plans }) => {
                const active =
                    plans
                        .filter((p) => !p.is_complete)
                        .sort(
                            (a, b) =>
                                new Date(b.created_at).getTime() -
                                new Date(a.created_at).getTime(),
                        )[0] || null;
                setActivePlan(active);
            })
            .catch(() => {});
    }, []);

    const handleWelcomeClose = () => {
        localStorage.setItem("hasSeenWelcome", "true");
        setShowWelcome(false);
    };

    const userName = profileLoading ? "..." : profile?.full_name || "Friend";

    const latestDate = latestDevotion
        ? new Date(latestDevotion.created_at).toLocaleDateString("en-US", {
              weekday: "short",
              day: "numeric",
              month: "short",
          })
        : null;

    const activePlanProgress = activePlan
        ? Math.round(
              ((activePlan.days_completed ?? 0) / activePlan.duration) * 100,
          )
        : 0;

    return (
        <>
            <WelcomeModal isOpen={showWelcome} onClose={handleWelcomeClose} />

            <div className="flex-1 overflow-y-auto bg-stone-50 dark:bg-stone-950 pb-28 md:pb-12 p-6 md:p-12">
                <div className="max-w-4xl mx-auto space-y-8">

                    {/* Header + stat strip */}
                    <header className="space-y-6 animate-[fadeInUp_0.4s_ease-out]">
                        <h1 className="text-4xl md:text-5xl font-serif text-stone-800 dark:text-stone-100 tracking-tight">
                            Peace be with you,{" "}
                            <span className="capitalize">{userName}</span>.
                        </h1>

                        {/* Stat strip */}
                        <div className="flex items-stretch border border-stone-200 dark:border-stone-800 rounded-xl overflow-hidden divide-x divide-stone-200 dark:divide-stone-800 bg-white dark:bg-stone-900">
                            <div className="flex-1 px-5 py-4 flex flex-col items-center justify-center text-center">
                                <div className="text-2xl font-serif font-light text-stone-800 dark:text-stone-100">
                                    {streak?.current_streak ?? 0}
                                </div>
                                <div className="text-[11px] uppercase tracking-widest text-stone-400 dark:text-stone-500 mt-1 font-sans whitespace-nowrap">
                                    Day Streak
                                </div>
                            </div>
                            <div className="flex-1 px-5 py-4 flex flex-col items-center justify-center text-center">
                                <div className="text-2xl font-serif font-light text-stone-800 dark:text-stone-100">
                                    {devotionCount}
                                </div>
                                <div className="text-[11px] uppercase tracking-widest text-stone-400 dark:text-stone-500 mt-1 font-sans whitespace-nowrap">
                                    Entries
                                </div>
                            </div>
                            <div className="flex-1 px-5 py-4 flex flex-col items-center justify-center text-center">
                                <div className="text-2xl font-serif font-light text-stone-800 dark:text-stone-100">
                                    {streak?.longest_streak ?? 0}
                                </div>
                                <div className="text-[11px] uppercase tracking-widest text-stone-400 dark:text-stone-500 mt-1 font-sans whitespace-nowrap">
                                    Best Streak
                                </div>
                            </div>
                        </div>
                    </header>

                    {/* Main cards */}
                    <main className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Left — Last Devotion */}
                        <Link
                            to={
                                latestDevotion
                                    ? `/devotions/${latestDevotion.id}`
                                    : "/devotions"
                            }
                            className="group bg-white dark:bg-stone-900 rounded-2xl border border-stone-100 dark:border-stone-800 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 overflow-hidden flex flex-col min-h-65"
                        >
                            <div className="p-8 flex flex-col flex-1">
                                <div className="flex-1 space-y-3">
                                    {latestDate && (
                                        <p className="text-xs font-sans text-stone-400 dark:text-stone-500 tracking-wide">
                                            {latestDate}
                                        </p>
                                    )}
                                    <h3 className="text-xl font-serif text-stone-800 dark:text-stone-100 leading-snug line-clamp-4">
                                        {latestDevotion
                                            ? latestDevotion.content.replace(
                                                  /<[^>]*>?/gm,
                                                  "",
                                              )
                                            : "Start your first devotion today."}
                                    </h3>
                                </div>
                                <div className="flex items-center justify-between mt-8">
                                    <span className="text-xs font-sans text-stone-400 dark:text-stone-500 truncate">
                                        {latestDevotion?.scripture_ref ||
                                            "Open Journal"}
                                    </span>
                                    <span className="flex items-center gap-1.5 text-sm font-sans text-stone-400 group-hover:text-stone-800 dark:group-hover:text-stone-200 transition-colors shrink-0 ml-2">
                                        Open
                                        <MoveRight
                                            size={14}
                                            strokeWidth={1.5}
                                            className="group-hover:translate-x-0.5 transition-transform"
                                        />
                                    </span>
                                </div>
                            </div>
                        </Link>

                        {/* Right — Chat / Selah */}
                        <Link
                            to="/chat"
                            className="group bg-stone-900 dark:bg-stone-800 rounded-2xl hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 overflow-hidden flex flex-col min-h-65"
                        >
                            <div className="p-8 flex flex-col flex-1">
                                <div className="flex-1 space-y-3">
                                    <h3 className="text-4xl font-serif text-white dark:text-stone-100 leading-none">
                                        Selah.
                                    </h3>
                                    <p className="text-stone-400 dark:text-stone-500 font-sans text-sm leading-relaxed max-w-xs">
                                        Find clarity and peace through
                                        reflection.
                                    </p>
                                </div>
                                <div className="flex items-center gap-1.5 mt-8 text-sm font-sans text-stone-500 group-hover:text-white dark:group-hover:text-stone-100 transition-colors">
                                    Start Chat
                                    <MoveRight
                                        size={14}
                                        strokeWidth={1.5}
                                        className="group-hover:translate-x-0.5 transition-transform"
                                    />
                                </div>
                            </div>
                        </Link>
                    </main>

                    {/* Active plan strip */}
                    {activePlan && (
                        <Link
                            to={`/plans/${activePlan.id}`}
                            className="group block bg-white dark:bg-stone-900 rounded-xl border border-stone-100 dark:border-stone-800 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 px-6 py-5 animate-[fadeInUp_0.5s_ease-out]"
                        >
                            <div className="flex items-center gap-6">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-2">
                                        <p className="text-sm font-serif text-stone-800 dark:text-stone-100 truncate">
                                            {activePlan.title}
                                        </p>
                                        <span className="text-xs font-sans text-stone-400 dark:text-stone-500 shrink-0">
                                            Day{" "}
                                            {activePlan.days_completed ?? 0} of{" "}
                                            {activePlan.duration}
                                        </span>
                                    </div>
                                    <div className="h-1 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-[#A3B18A] rounded-full transition-all duration-700"
                                            style={{
                                                width: `${activePlanProgress}%`,
                                            }}
                                        />
                                    </div>
                                </div>
                                <span className="flex items-center gap-1 text-xs font-sans text-stone-400 group-hover:text-stone-700 dark:group-hover:text-stone-200 transition-colors shrink-0">
                                    Continue
                                    <MoveRight
                                        size={12}
                                        strokeWidth={1.5}
                                        className="group-hover:translate-x-0.5 transition-transform"
                                    />
                                </span>
                            </div>
                        </Link>
                    )}
                </div>
            </div>
        </>
    );
}
