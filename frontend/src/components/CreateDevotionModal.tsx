import { useState, useEffect } from "react";
import { X, Save, BookOpen, Smile } from "lucide-react";
import { api } from "../api";
import type { Devotion } from "../types/types";

interface TimelineContext {
    bible_verse: string;
    verse_content: string;
    encouragement_from_verse: string;
}

interface CreateDevotionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void; // To refresh the list after saving
    devotion?: Devotion; // Optional: if provided, we're editing
    planTimelineId?: string; // Optional: links devotion to a plan day
    timelineContext?: TimelineContext; // Optional: shows verse context in modal
}

export default function CreateDevotionModal({
    isOpen,
    onClose,
    onSuccess,
    devotion,
    planTimelineId,
    timelineContext,
}: CreateDevotionModalProps) {
    const [loading, setLoading] = useState(false);
    const [content, setContent] = useState("");
    const [scripture, setScripture] = useState("");
    const [mood, setMood] = useState("");

    const isEditMode = !!devotion;

    // Populate form when editing or pre-fill from plan context
    useEffect(() => {
        if (devotion) {
            setContent(devotion.content || "");
            setScripture(devotion.scripture_ref || "");
            setMood(devotion.mood || "");
        } else {
            setContent("");
            setScripture(timelineContext?.bible_verse ?? "");
            setMood("");
        }
    }, [devotion, timelineContext]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (isEditMode && devotion) {
                // Update existing devotion
                await api.put(`/api/devotions/${devotion.id}`, {
                    content,
                    scripture_ref: scripture,
                    mood,
                });
            } else {
                // Create new devotion (optionally linked to a plan day)
                await api.post("/api/devotions", {
                    content,
                    scripture_ref: scripture,
                    mood,
                    ...(planTimelineId
                        ? { plan_timeline_id: planTimelineId }
                        : {}),
                });
            }

            // Clear form
            setContent("");
            setScripture("");
            setMood("");

            onSuccess(); // Refresh parent
            onClose(); // Close modal
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        // Backdrop
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 dark:bg-stone-950/70 backdrop-blur-sm p-4">
            {/* Modal Content */}
            <div className="bg-white dark:bg-stone-900 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="flex justify-between items-center px-6 py-5 border-b border-stone-100 dark:border-stone-800">
                    <h2 className="text-xl font-serif text-stone-800 dark:text-stone-100">
                        {isEditMode ? "Edit Entry" : "New Entry"}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300 transition"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Form */}
                <form
                    onSubmit={handleSubmit}
                    className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-6"
                >
                    {/* Plan verse context (read-only) */}
                    {timelineContext && (
                        <div className="bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl p-4 space-y-2">
                            <p className="text-xs font-bold tracking-widest uppercase text-stone-400 dark:text-stone-500">
                                Today's Verse
                            </p>
                            <p className="font-serif text-stone-800 dark:text-stone-100 font-semibold">
                                {timelineContext.bible_verse}
                            </p>
                            {timelineContext.verse_content && (
                                <p className="font-serif text-stone-600 dark:text-stone-300 text-sm italic leading-relaxed border-l-2 border-stone-300 dark:border-stone-600 pl-3">
                                    {timelineContext.verse_content}
                                </p>
                            )}
                            {timelineContext.encouragement_from_verse && (
                                <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                                    {timelineContext.encouragement_from_verse}
                                </p>
                            )}
                        </div>
                    )}

                    {/* Metadata Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative">
                            <div className="absolute left-3 top-3 text-stone-400 dark:text-stone-500 pointer-events-none">
                                <BookOpen size={18} />
                            </div>
                            <input
                                type="text"
                                placeholder="Scripture (e.g. Psalm 23)"
                                className="w-full pl-10 pr-4 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 rounded-lg focus:ring-2 focus:ring-stone-200 dark:focus:ring-stone-600 outline-none transition text-sm placeholder:text-stone-400 dark:placeholder:text-stone-500"
                                value={scripture}
                                onChange={(e) => setScripture(e.target.value)}
                            />
                        </div>

                        <div className="relative">
                            <div className="absolute left-3 top-3 text-stone-400 dark:text-stone-500 pointer-events-none">
                                <Smile size={18} />
                            </div>
                            <select
                                className="w-full pl-10 pr-4 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 rounded-lg focus:ring-2 focus:ring-stone-200 dark:focus:ring-stone-600 outline-none transition text-sm appearance-none"
                                value={mood}
                                onChange={(e) => setMood(e.target.value)}
                            >
                                <option value="">How are you feeling?</option>
                                <option value="Grateful">Grateful</option>
                                <option value="Anxious">Anxious</option>
                                <option value="Peaceful">Peaceful</option>
                                <option value="Challenged">Challenged</option>
                                <option value="Hopeful">Hopeful</option>
                            </select>
                        </div>
                    </div>

                    {/* Main Editor */}
                    <textarea
                        className="flex-1 w-full p-4 text-lg font-serif leading-relaxed text-stone-800 dark:text-stone-100 bg-white dark:bg-stone-900 placeholder:text-stone-300 dark:placeholder:text-stone-600 resize-none outline-none min-h-75"
                        placeholder="Write your thoughts here..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        required
                    />
                </form>

                {/* Footer */}
                <div className="px-6 py-5 border-t border-stone-100 dark:border-stone-800 flex justify-end gap-3 bg-stone-50/50 dark:bg-stone-800/50 rounded-b-2xl">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-3 text-stone-600 dark:text-stone-300 font-medium hover:bg-stone-200 dark:hover:bg-stone-700 rounded-lg transition"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading || !content}
                        className="flex items-center gap-2 px-7 py-3 bg-[#3B4737] dark:bg-[#E6E0D4] text-white dark:text-[#3B4737] font-medium rounded-lg hover:bg-[#2E3A2B] dark:hover:bg-[#D4CBBA] disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg shadow-[#3B4737]/10 dark:shadow-stone-950/30"
                    >
                        {loading ? (
                            isEditMode ? (
                                "Updating..."
                            ) : (
                                "Saving..."
                            )
                        ) : (
                            <>
                                <Save size={18} />
                                <span>
                                    {isEditMode ? "Update Entry" : "Save Entry"}
                                </span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
