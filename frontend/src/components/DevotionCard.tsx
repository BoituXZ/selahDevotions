import type { Devotion } from "../types/types";

interface DevotionCardProps {
    devotion: Devotion;
    onClick: () => void;
}

export default function DevotionCard({ devotion, onClick }: DevotionCardProps) {
    const plainText = devotion.content.replace(/<[^>]*>?/gm, "");

    return (
        <div
            onClick={onClick}
            className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm hover:shadow-md hover:border-stone-300 transition cursor-pointer group"
        >
            <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-bold tracking-wider text-stone-400 uppercase">
                    {new Date(devotion.created_at).toLocaleDateString()}
                </span>
                {devotion.mood && (
                    <span className="text-xs bg-stone-100 text-stone-600 px-2 py-1 rounded-full">
                        {devotion.mood}
                    </span>
                )}
            </div>

            <p className="text-stone-800 font-serif leading-relaxed line-clamp-2">
                {plainText || (
                    <span className="text-stone-400 italic">
                        No text content...
                    </span>
                )}
            </p>
        </div>
    );
}
