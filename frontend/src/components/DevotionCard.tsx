import type { Devotion } from "../types/types";

interface DevotionCardProps {
    devotion: Devotion;
    onClick: () => void;
}

export default function DevotionCard({ devotion, onClick }: DevotionCardProps) {
    const plainText = devotion.content.replace(/<[^>]*>?/gm, "");
    
    // Deterministic color based on ID
    const colors = ["bg-[#A3B18A]", "bg-[#D4C5A9]", "bg-[#9CA3AF]", "bg-[#B5C0D0]"]; // Sage, Sand, Slate, Blue-ish
    // Use first 8 chars of UUID (hex string) as seed for deterministic color
    const colorIndex = parseInt(devotion.id.substring(0, 8), 16) % colors.length;
    const colorClass = colors[colorIndex];

    return (
        <div
            onClick={onClick}
            className="group cursor-pointer flex flex-col bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden border border-stone-100 h-full"
        >
            {/* Color Block */}
            <div className={`h-3 w-full ${colorClass}`} />

            <div className="p-6 flex flex-col flex-1">
                {/* Header: Date & Mood */}
                <div className="flex justify-between items-start mb-4">
                    <span className="text-xs font-bold tracking-widest text-stone-400 uppercase font-sans">
                        {new Date(devotion.created_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                        })}
                    </span>
                    {devotion.mood && (
                        <span className="text-[10px] tracking-wider uppercase border border-stone-200 text-stone-500 px-2 py-0.5 rounded-full">
                            {devotion.mood}
                        </span>
                    )}
                </div>

                {/* Content Preview */}
                <p className="text-xl font-serif text-stone-800 leading-snug line-clamp-3 mb-4 group-hover:text-stone-600 transition-colors">
                    {plainText || (
                        <span className="text-stone-400 italic font-sans text-sm">
                            Empty entry...
                        </span>
                    )}
                </p>

                {/* Footer (Scripture ref if exists) */}
                <div className="mt-auto pt-4 border-t border-stone-50">
                     <p className="text-xs text-stone-400 font-sans truncate">
                        {devotion.scripture_ref || "Reflection"}
                     </p>
                </div>
            </div>
        </div>
    );
}
