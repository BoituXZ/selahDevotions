import { useState, useEffect } from "react";
import { api } from "../api";

interface StreakData {
    current_streak: number;
    longest_streak: number;
}

export default function Dashboard() {
    const [streak, setStreak] = useState<StreakData | null>(null);

    useEffect(() => {
        api.get<StreakData>("/api/streaks")
            .then(setStreak)
            .catch((err) => console.error("Streak fetch failed:", err));
    }, []);

    return (
        <div className="min-h-screen bg-stone-50">
            <div className="max-w-2xl mx-auto p-8">
                <header className="mb-12 flex justify-between items-end border-b border-stone-200 pb-4">
                    <div>
                        <h1 className="text-4xl font-serif text-stone-800">
                            Selah.
                        </h1>
                        <p className="text-stone-500 mt-2">Welcome back.</p>
                    </div>

                    <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-stone-200">
                        <span className="text-orange-500">🔥</span>
                        <span className="font-bold text-stone-700">
                            {streak?.current_streak || 0}
                        </span>
                    </div>
                </header>

                <main className="grid gap-6">
                    {/* We will put the editor here later */}
                    <div className="bg-white p-8 rounded-xl shadow-sm border border-stone-200 text-center py-12">
                        <h2 className="text-2xl font-serif mb-4 text-stone-700">
                            Pause & Reflect
                        </h2>
                        <button className="bg-stone-800 text-white px-8 py-3 rounded-lg hover:bg-stone-700 transition shadow-lg hover:shadow-xl translate-y-0 hover:-translate-y-1 duration-200">
                            Start Today's Devotion
                        </button>
                    </div>
                </main>
            </div>
        </div>
    );
}
