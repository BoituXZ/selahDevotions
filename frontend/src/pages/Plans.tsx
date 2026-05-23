import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import type { Plan } from "../types/types";
import PlanCard from "../components/PlanCard";

const Plans = () => {
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchPlans = useCallback(async () => {
        try {
            const response = await api.get<{ success: boolean; plans: Plan[] }>(
                "/api/plans",
            );
            if (response?.plans) {
                const sorted = response.plans.sort(
                    (a, b) =>
                        new Date(b.created_at).getTime() -
                        new Date(a.created_at).getTime(),
                );
                setPlans(sorted);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPlans();
    }, [fetchPlans]);

    return (
        <div className="flex-1 overflow-y-auto bg-stone-50 dark:bg-stone-950 pb-28 md:pb-12 p-6 md:p-12">
            <div className="max-w-5xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex justify-between items-end border-b border-stone-200 dark:border-stone-800 pb-8">
                    <div>
                        <h1 className="text-4xl font-serif text-stone-800 dark:text-stone-100">
                            Plans
                        </h1>
                        <p className="text-stone-500 dark:text-stone-400 mt-2">
                            Walk with Him, one day at a time.
                        </p>
                    </div>
                    <button
                        onClick={() => navigate("/plans/new")}
                        className="bg-[#3B4737] dark:bg-[#E6E0D4] text-white dark:text-[#3B4737] px-5 py-2.5 text-sm md:px-6 md:py-3 md:text-base rounded-lg hover:bg-[#2E3A2B] dark:hover:bg-[#D4CBBA] transition shadow-lg hover:shadow-xl hover:-translate-y-0.5 font-medium whitespace-nowrap"
                    >
                        New Plan
                    </button>
                </div>

                {/* Grid */}
                <div className="min-h-50">
                    {loading ? (
                        <div className="text-stone-400 dark:text-stone-500 text-center py-12">
                            Loading your plans...
                        </div>
                    ) : plans.length === 0 ? (
                        <div className="text-center py-20 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 border-dashed">
                            <p className="text-stone-400 dark:text-stone-500 italic mb-4 font-serif text-xl">
                                "Commit your way to the Lord."
                            </p>
                            <p className="text-sm text-stone-500 dark:text-stone-400">
                                No plans yet. Create one to begin your journey.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {plans.map((plan) => (
                                <PlanCard
                                    key={plan.id}
                                    plan={plan}
                                    onClick={() =>
                                        navigate(`/plans/${plan.id}`)
                                    }
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Plans;
