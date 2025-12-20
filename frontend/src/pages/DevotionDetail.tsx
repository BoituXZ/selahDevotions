import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, BookOpen, Smile } from "lucide-react";
import { api } from "../api";
import type { Devotion } from "../types/types";

export default function DevotionDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [devotion, setDevotion] = useState<Devotion | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;

        api.get<Devotion>(`/api/devotions/${id}`)
            .then(setDevotion)
            .catch((err) => {
                console.error(err);
                navigate("/devotions"); // Kick back to list if not found
            })
            .finally(() => setLoading(false));
    }, [id, navigate]);

    if (loading) return <div className="p-8">Loading...</div>;
    if (!devotion) return null;

    return (
        <div className="flex-1 overflow-y-auto bg-stone-50 pb-28 md:pb-12 p-6 md:p-12">
            <div className="max-w-2xl mx-auto">
                <button
                    onClick={() => navigate("/devotions")}
                    className="flex items-center gap-2 text-stone-500 hover:text-stone-800 transition mb-8 text-sm font-medium"
                >
                    <ArrowLeft size={16} />
                    Back to Sanctuary
                </button>

                <article className="bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-stone-200">
                    <header className="mb-8 border-b border-stone-100 pb-6">
                        <div className="flex flex-wrap gap-4 text-sm text-stone-500 mb-4">
                            <span className="flex items-center gap-1.5 bg-stone-50 px-3 py-1 rounded-full">
                                <Calendar size={14} />
                                {new Date(devotion.created_at).toLocaleDateString(
                                    undefined,
                                    {
                                        weekday: "long",
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                    }
                                )}
                            </span>
                            {devotion.mood && (
                                <span className="flex items-center gap-1.5 bg-stone-50 px-3 py-1 rounded-full">
                                    <Smile size={14} />
                                    {devotion.mood}
                                </span>
                            )}
                        </div>

                        {devotion.scripture_ref && (
                            <div className="flex items-start gap-3 text-stone-700 bg-orange-50/50 p-4 rounded-lg border border-orange-100">
                                <BookOpen
                                    size={20}
                                    className="mt-1 text-orange-400 shrink-0"
                                />
                                <span className="font-serif italic text-lg">
                                    {devotion.scripture_ref}
                                </span>
                            </div>
                        )}
                    </header>

                    {/* Content Rendering 
            Since we sanitized on the backend, we can use dangerouslySetInnerHTML.
            We add 'prose' (Tailwind Typography) to make the HTML look nice.
            */}
                    <div
                        className="prose prose-stone prose-lg max-w-none font-serif leading-loose"
                        dangerouslySetInnerHTML={{ __html: devotion.content }}
                    />
                </article>
            </div>
        </div>
    );
}
