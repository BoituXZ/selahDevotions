import { useEffect, useState, useCallback, useRef } from "react";
import { ArrowLeft, CheckCircle2, Lock, BookOpen, MoreVertical, Trash2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { api } from "../api";
import type { Plan, PlanTimeline } from "../types/types";
import CreateDevotionModal from "../components/CreateDevotionModal";
import DeleteConfirmationModal from "../components/DeleteConfirmationModal";

const PlanDetail = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [plan, setPlan] = useState<Plan | null>(null);
    const [loading, setLoading] = useState(true);

    // Modal state
    const [isDevotionModalOpen, setIsDevotionModalOpen] = useState(false);
    const [activeTimeline, setActiveTimeline] = useState<PlanTimeline | null>(
        null,
    );

    // Closing sentiment state
    const [closingText, setClosingText] = useState("");
    const [closingLoading, setClosingLoading] = useState(false);

    // Delete state
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleting, setDeleting] = useState(false);

    // Menu state
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close menu on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setMenuOpen(false);
            }
        };
        if (menuOpen) document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [menuOpen]);

    const fetchPlan = useCallback(async () => {
        if (!id) return;
        try {
            const response = await api.get<{ success: boolean; plan: Plan }>(
                `/api/plans/${id}`,
            );
            if (response?.plan) {
                setPlan(response.plan);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchPlan();
    }, [fetchPlan]);

    const handleOpenDevotionModal = (timeline: PlanTimeline) => {
        setActiveTimeline(timeline);
        setIsDevotionModalOpen(true);
    };

    const handleDevotionSuccess = () => {
        // Refetch so current_day advances
        fetchPlan();
    };

    const handleSubmitClosingSentiment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id || !closingText.trim() || closingLoading) return;
        setClosingLoading(true);
        try {
            const response = await api.patch<{ success: boolean; plan: Plan }>(
                `/api/plans/${id}`,
                { closing_sentiment: closingText.trim() },
            );
            if (response?.plan) {
                setPlan(response.plan);
                setClosingText("");
            }
        } catch (err) {
            console.error("Failed to save closing sentiment:", err);
            toast.error("Oops, that didn't work.");
        } finally {
            setClosingLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!id || deleting) return;
        setDeleting(true);
        try {
            await api.delete(`/api/plans/${id}`);
            toast.success("Plan deleted");
            navigate("/plans");
        } catch (err) {
            console.error("Failed to delete plan:", err);
            toast.error("Oops, that didn't work.");
            setDeleting(false);
            setShowDeleteModal(false);
        }
    };

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center bg-stone-50 dark:bg-stone-950">
                <p className="text-stone-400 dark:text-stone-500 font-serif italic">
                    Loading your plan...
                </p>
            </div>
        );
    }

    if (!plan) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center bg-stone-50 dark:bg-stone-950 gap-4">
                <p className="text-stone-500 dark:text-stone-400">
                    Plan not found.
                </p>
                <button
                    onClick={() => navigate("/plans")}
                    className="text-sm text-stone-600 dark:text-stone-300 underline underline-offset-2"
                >
                    Back to Plans
                </button>
            </div>
        );
    }

    const timelines = plan.timelines ?? [];
    const daysCompleted = timelines.filter((t) => t.read).length;

    return (
        <div className="flex-1 overflow-y-auto bg-stone-50 dark:bg-stone-950 pb-28 md:pb-12 p-6 md:p-14">
            <div className="max-w-2xl mx-auto space-y-8">
                {/* Top nav row */}
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => navigate("/plans")}
                        className="flex items-center gap-2 text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-100 transition text-sm font-medium"
                    >
                        <ArrowLeft size={16} strokeWidth={1.5} />
                        Back to Plans
                    </button>
                    <div className="relative" ref={menuRef}>
                        <button
                            onClick={() => setMenuOpen((o) => !o)}
                            className="p-2 text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition"
                            aria-label="More options"
                        >
                            <MoreVertical size={20} />
                        </button>
                        {menuOpen && (
                            <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-stone-900 rounded-lg shadow-lg border border-stone-200 dark:border-stone-800 py-1 z-10">
                                <button
                                    onClick={() => {
                                        setMenuOpen(false);
                                        setShowDeleteModal(true);
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition"
                                >
                                    <Trash2 size={16} />
                                    <span className="font-medium">Delete plan</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Header */}
                <div className="border-b border-stone-200 dark:border-stone-800 pb-8">
                    <div className="flex items-start justify-between gap-4">
                        <h1 className="text-3xl md:text-4xl font-serif text-stone-800 dark:text-stone-100 leading-snug">
                            {plan.title}
                        </h1>
                        {plan.is_complete && (
                            <span className="shrink-0 inline-flex items-center gap-1 text-[10px] tracking-wider uppercase border border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-1 rounded-full mt-1">
                                <CheckCircle2 className="w-3 h-3" />
                                Complete
                            </span>
                        )}
                    </div>
                    <p className="text-stone-500 dark:text-stone-400 mt-2 text-sm">
                        {plan.is_complete
                            ? `Completed all ${plan.duration} days`
                            : `Day ${plan.current_day ?? daysCompleted + 1} of ${plan.duration}`}
                    </p>

                    {/* Progress bar */}
                    <div className="mt-4 space-y-1">
                        <div className="flex justify-between text-xs text-stone-400 dark:text-stone-500">
                            <span>
                                {daysCompleted} of {plan.duration} days
                            </span>
                            <span>
                                {Math.round(
                                    (daysCompleted / plan.duration) * 100,
                                )}
                                %
                            </span>
                        </div>
                        <div className="h-1.5 w-full bg-stone-200 dark:bg-stone-800 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-stone-700 dark:bg-stone-300 rounded-full transition-all duration-500"
                                style={{
                                    width: `${Math.min((daysCompleted / plan.duration) * 100, 100)}%`,
                                }}
                            />
                        </div>
                    </div>
                </div>

                {/* Closing sentiment — auto-prompt when done but not yet written */}
                {plan.is_complete && !plan.closing_sentiment && (
                    <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-6 space-y-4">
                        <div>
                            <h2 className="text-lg font-serif text-amber-900 dark:text-amber-200">
                                You've completed your plan 🙏
                            </h2>
                            <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
                                Take a moment to reflect on your journey. How
                                has God met you through these days?
                            </p>
                        </div>
                        <form
                            onSubmit={handleSubmitClosingSentiment}
                            className="space-y-3"
                        >
                            <textarea
                                placeholder="Write your closing reflection..."
                                rows={4}
                                value={closingText}
                                onChange={(e) => setClosingText(e.target.value)}
                                disabled={closingLoading}
                                className="w-full px-4 py-3 bg-white dark:bg-stone-900 border border-amber-200 dark:border-amber-800 text-stone-900 dark:text-stone-100 rounded-lg focus:ring-2 focus:ring-amber-300 dark:focus:ring-amber-700 outline-none transition text-sm placeholder:text-stone-400 dark:placeholder:text-stone-500 resize-none font-serif leading-relaxed disabled:opacity-50"
                            />
                            <button
                                type="submit"
                                disabled={
                                    !closingText.trim() || closingLoading
                                }
                                className="flex items-center gap-2 px-5 py-2.5 bg-amber-800 dark:bg-amber-300 text-white dark:text-amber-900 font-medium rounded-lg hover:bg-amber-700 dark:hover:bg-amber-200 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm"
                            >
                                {closingLoading
                                    ? "Saving..."
                                    : "Save Reflection"}
                            </button>
                        </form>
                    </div>
                )}

                {/* Closing sentiment — display when saved */}
                {plan.closing_sentiment && (
                    <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6">
                        <h2 className="text-xs font-sans font-bold tracking-widest uppercase text-stone-400 dark:text-stone-500 mb-3">
                            Your Closing Reflection
                        </h2>
                        <blockquote className="font-serif text-stone-700 dark:text-stone-300 leading-relaxed text-lg italic border-l-2 border-stone-300 dark:border-stone-600 pl-4">
                            {plan.closing_sentiment}
                        </blockquote>
                    </div>
                )}

                {/* Timeline */}
                <div className="space-y-3">
                    <h2 className="text-xs font-sans font-bold tracking-widest uppercase text-stone-400 dark:text-stone-500">
                        Your Journey
                    </h2>

                    {timelines.map((timeline) => {
                        const isPast =
                            timeline.read && timeline.day_number !== plan.current_day;
                        const isCurrent =
                            timeline.day_number === plan.current_day;
                        const isFuture =
                            !timeline.read && timeline.day_number !== plan.current_day;

                        return (
                            <TimelineCard
                                key={timeline.id}
                                timeline={timeline}
                                isPast={isPast}
                                isCurrent={isCurrent}
                                isFuture={isFuture}
                                onAddDevotion={() =>
                                    handleOpenDevotionModal(timeline)
                                }
                                onViewDevotion={() => {
                                    if (timeline.devotion_id) {
                                        navigate(
                                            `/devotions/${timeline.devotion_id}`,
                                            {
                                                state: {
                                                    fromPlanId: plan.id,
                                                    fromPlanTitle: plan.title,
                                                    dayNumber: timeline.day_number,
                                                    bible_verse: timeline.bible_verse,
                                                    verse_content: timeline.verse_content,
                                                    encouragement_from_verse: timeline.encouragement_from_verse,
                                                },
                                            },
                                        );
                                    }
                                }}
                            />
                        );
                    })}
                </div>
            </div>

            {/* Delete confirmation */}
            <DeleteConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDelete}
                loading={deleting}
                title="Delete Plan"
                message="Are you sure you want to delete this plan? All daily entries and your progress will be permanently removed."
                confirmLabel="Delete Plan"
            />

            {/* CreateDevotionModal wired to current plan day */}
            {activeTimeline && (
                <CreateDevotionModal
                    isOpen={isDevotionModalOpen}
                    onClose={() => {
                        setIsDevotionModalOpen(false);
                        setActiveTimeline(null);
                    }}
                    onSuccess={handleDevotionSuccess}
                    planTimelineId={activeTimeline.id}
                    timelineContext={
                        activeTimeline.bible_verse
                            ? {
                                  bible_verse:
                                      activeTimeline.bible_verse ?? "",
                                  verse_content:
                                      activeTimeline.verse_content ?? "",
                                  encouragement_from_verse:
                                      activeTimeline.encouragement_from_verse ??
                                      "",
                              }
                            : undefined
                    }
                />
            )}
        </div>
    );
};

/* ─── Timeline Card sub-component ─── */

interface TimelineCardProps {
    timeline: PlanTimeline;
    isPast: boolean;
    isCurrent: boolean;
    isFuture: boolean;
    onAddDevotion: () => void;
    onViewDevotion: () => void;
}

function TimelineCard({
    timeline,
    isPast,
    isCurrent: _isCurrent,
    isFuture,
    onAddDevotion,
    onViewDevotion,
}: TimelineCardProps) {
    // Future / locked days
    if (isFuture) {
        return (
            <div className="flex items-center gap-4 p-4 bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 rounded-xl opacity-40">
                <div className="shrink-0 w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center">
                    <Lock
                        size={14}
                        strokeWidth={1.5}
                        className="text-stone-400 dark:text-stone-500"
                    />
                </div>
                <p className="text-sm font-medium text-stone-400 dark:text-stone-500">
                    Day {timeline.day_number}
                </p>
            </div>
        );
    }

    // Past (completed) days
    if (isPast) {
        return (
            <button
                onClick={onViewDevotion}
                className="w-full text-left flex items-start gap-4 p-4 bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 rounded-xl hover:border-stone-300 dark:hover:border-stone-600 hover:shadow-md transition-all duration-200 group"
            >
                <div className="shrink-0 w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center mt-0.5">
                    <CheckCircle2
                        size={16}
                        strokeWidth={1.5}
                        className="text-emerald-600 dark:text-emerald-400"
                    />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold tracking-widest uppercase text-stone-400 dark:text-stone-500 mb-0.5">
                        Day {timeline.day_number}
                    </p>
                    {timeline.bible_verse && (
                        <p className="text-sm text-stone-600 dark:text-stone-300 group-hover:text-stone-800 dark:group-hover:text-stone-100 transition-colors font-serif truncate">
                            {timeline.bible_verse}
                        </p>
                    )}
                </div>
                <span className="shrink-0 text-xs text-stone-400 dark:text-stone-500 group-hover:text-stone-600 dark:group-hover:text-stone-300 transition-colors self-center">
                    View →
                </span>
            </button>
        );
    }

    // Current day — highlighted, full card
    return (
        <div className="bg-stone-900 dark:bg-stone-50 rounded-2xl p-6 space-y-4 shadow-lg shadow-stone-900/10 dark:shadow-stone-100/10">
            <div className="flex items-center justify-between">
                <span className="text-xs font-bold tracking-widest uppercase text-stone-400 dark:text-stone-500">
                    Day {timeline.day_number} · Today
                </span>
                <BookOpen
                    size={16}
                    strokeWidth={1.5}
                    className="text-stone-400 dark:text-stone-500"
                />
            </div>

            {/* Verse reference */}
            {timeline.bible_verse && (
                <p className="text-lg font-serif font-semibold text-white dark:text-stone-900 leading-snug">
                    {timeline.bible_verse}
                </p>
            )}

            {/* Verse content */}
            {timeline.verse_content && (
                <blockquote className="font-serif text-stone-300 dark:text-stone-600 leading-relaxed text-sm italic border-l-2 border-stone-600 dark:border-stone-300 pl-3">
                    {timeline.verse_content}
                </blockquote>
            )}

            {/* Encouragement */}
            {timeline.encouragement_from_verse && (
                <p className="text-sm text-stone-400 dark:text-stone-500 leading-relaxed">
                    {timeline.encouragement_from_verse}
                </p>
            )}

            {/* Action button */}
            <button
                onClick={onAddDevotion}
                className="w-full px-5 py-3 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 font-medium rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition text-sm mt-2"
            >
                Add Devotion
            </button>
        </div>
    );
}

export default PlanDetail;
