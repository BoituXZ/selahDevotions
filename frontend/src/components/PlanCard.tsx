import { CheckCircle2 } from "lucide-react";
import type { Plan } from "../types/types";

interface PlanCardProps {
    plan: Plan;
    onClick: () => void;
}

export default function PlanCard({ plan, onClick }: PlanCardProps) {
    // Deterministic color based on ID (same palette as DevotionCard)
    const colors = [
        "bg-[#A3B18A]",
        "bg-[#D4C5A9]",
        "bg-[#9CA3AF]",
        "bg-[#B5C0D0]",
    ];
    const colorIndex = parseInt(plan.id.substring(0, 8), 16) % colors.length;
    const colorClass = colors[colorIndex];

    const daysCompleted = plan.days_completed ?? 0;
    const progress = Math.min((daysCompleted / plan.duration) * 100, 100);

    return (
        <div
            onClick={onClick}
            className="group cursor-pointer flex flex-col bg-white dark:bg-stone-900 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden border border-stone-100 dark:border-stone-800 h-full"
        >
            {/* Color accent bar */}
            <div className={`h-3 w-full ${colorClass}`} />

            <div className="p-6 flex flex-col flex-1 gap-4">
                {/* Title row */}
                <div className="flex justify-between items-start gap-2">
                    <h3 className="text-lg font-serif text-stone-800 dark:text-stone-100 leading-snug group-hover:text-stone-600 dark:group-hover:text-stone-300 transition-colors line-clamp-2">
                        {plan.title}
                    </h3>
                    {plan.is_complete && (
                        <span className="shrink-0 inline-flex items-center gap-1 text-[10px] tracking-wider uppercase border border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3 h-3" />
                            Done
                        </span>
                    )}
                </div>

                {/* Progress */}
                <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                        <span className="text-xs text-stone-500 dark:text-stone-400 font-sans">
                            {daysCompleted} of {plan.duration} days
                        </span>
                        <span className="text-xs text-stone-400 dark:text-stone-500 font-sans">
                            {Math.round(progress)}%
                        </span>
                    </div>
                    <div className="h-1.5 w-full bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-stone-700 dark:bg-stone-300 rounded-full transition-all duration-500"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-auto pt-3 border-t border-stone-50 dark:border-stone-800">
                    <p className="text-xs text-stone-400 dark:text-stone-500 font-sans">
                        Started{" "}
                        {new Date(plan.created_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                        })}
                    </p>
                </div>
            </div>
        </div>
    );
}
