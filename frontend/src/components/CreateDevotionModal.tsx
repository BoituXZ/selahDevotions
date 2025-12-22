import { useState, useEffect } from "react";
import { X, Save, BookOpen, Smile } from "lucide-react";
import { api } from "../api";
import type { Devotion } from "../types/types";

interface CreateDevotionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void; // To refresh the list after saving
    devotion?: Devotion; // Optional: if provided, we're editing
}

export default function CreateDevotionModal({
    isOpen,
    onClose,
    onSuccess,
    devotion,
}: CreateDevotionModalProps) {
    const [loading, setLoading] = useState(false);
    const [content, setContent] = useState("");
    const [scripture, setScripture] = useState("");
    const [mood, setMood] = useState("");

    const isEditMode = !!devotion;

    // Populate form when editing
    useEffect(() => {
        if (devotion) {
            setContent(devotion.content || "");
            setScripture(devotion.scripture_ref || "");
            setMood(devotion.mood || "");
        } else {
            // Reset form when creating new
            setContent("");
            setScripture("");
            setMood("");
        }
    }, [devotion]);

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
                // Create new devotion
                await api.post("/api/devotions", {
                    content,
                    scripture_ref: scripture,
                    mood,
                });
            }

            // Clear form
            setContent("");
            setScripture("");
            setMood("");

            onSuccess(); // Refresh parent
            onClose(); // Close modal
        } catch (err) {
            alert(
                `Failed to ${
                    isEditMode ? "update" : "save"
                } devotion. Please try again.`
            );
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        // Backdrop
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 backdrop-blur-sm p-4">
            {/* Modal Content */}
            <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-stone-100">
                    <h2 className="text-xl font-serif text-stone-800">
                        {isEditMode ? "Edit Entry" : "New Entry"}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-stone-400 hover:text-stone-600 transition"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Form */}
                <form
                    onSubmit={handleSubmit}
                    className="flex-1 overflow-y-auto p-6 flex flex-col gap-6"
                >
                    {/* Metadata Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative">
                            <div className="absolute left-3 top-3 text-stone-400 pointer-events-none">
                                <BookOpen size={18} />
                            </div>
                            <input
                                type="text"
                                placeholder="Scripture (e.g. Psalm 23)"
                                className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-lg focus:ring-2 focus:ring-stone-200 outline-none transition text-sm"
                                value={scripture}
                                onChange={(e) => setScripture(e.target.value)}
                            />
                        </div>

                        <div className="relative">
                            <div className="absolute left-3 top-3 text-stone-400 pointer-events-none">
                                <Smile size={18} />
                            </div>
                            <select
                                className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-lg focus:ring-2 focus:ring-stone-200 outline-none transition text-sm appearance-none"
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
                        className="flex-1 w-full p-4 text-lg font-serif leading-relaxed text-stone-800 placeholder:text-stone-300 resize-none outline-none min-h-[300px]"
                        placeholder="Write your thoughts here..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        required
                    />
                </form>

                {/* Footer */}
                <div className="p-6 border-t border-stone-100 flex justify-end gap-3 bg-stone-50/50 rounded-b-2xl">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2.5 text-stone-600 font-medium hover:bg-stone-200 rounded-lg transition"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading || !content}
                        className="flex items-center gap-2 px-6 py-2.5 bg-stone-900 text-white font-medium rounded-lg hover:bg-stone-800 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg shadow-stone-900/10"
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
