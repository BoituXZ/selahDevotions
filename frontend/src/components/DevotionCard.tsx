import type { Devotion } from "../types/types";

interface DevotionListItemProps {
    devotion: Devotion;
    onClick: () => void;
}

const COLOR_HEX = ["#A3B18A", "#D4C5A9", "#9CA3AF", "#B5C0D0"];

export default function DevotionListItem({
    devotion,
    onClick,
}: DevotionListItemProps) {
    const plainText = devotion.content.replace(/<[^>]*>?/gm, "");
    const accentColor =
        COLOR_HEX[parseInt(devotion.id.substring(0, 8), 16) % COLOR_HEX.length];
    const date = new Date(devotion.created_at);
    const day = date.getDate();
    const weekday = date.toLocaleDateString("en-US", { weekday: "short" });
    const month = date.toLocaleDateString("en-US", { month: "short" });

    return (
        <div
            onClick={onClick}
            className="group relative cursor-pointer bg-white dark:bg-stone-900 rounded-xl border border-stone-100 dark:border-stone-800 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden"
        >
            {/* Left accent border */}
            <div
                className="absolute left-0 top-0 bottom-0 w-0.75 rounded-l-xl"
                style={{ backgroundColor: accentColor }}
            />

            <div className="pl-5 pr-4 pt-4 pb-4">
                {/* Top row: date label + mood badge */}
                <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-sans text-stone-400 dark:text-stone-500 tracking-wide">
                        {weekday} {day} {month}
                    </span>
                    {devotion.mood && (
                        <span className="text-[10px] tracking-wider uppercase border border-stone-200 dark:border-stone-700 text-stone-400 dark:text-stone-500 px-2 py-0.5 rounded-full font-sans">
                            {devotion.mood}
                        </span>
                    )}
                </div>

                {/* Preview — 3 lines */}
                <p className="text-[15px] font-serif text-stone-800 dark:text-stone-100 leading-snug line-clamp-3 mb-3">
                    {plainText || (
                        <span className="text-stone-400 dark:text-stone-500 italic font-sans text-xs">
                            Empty entry...
                        </span>
                    )}
                </p>

                {/* Footer row */}
                <div className="flex items-center justify-between">
                    <span className="text-xs text-stone-400 dark:text-stone-500 font-sans truncate">
                        {devotion.scripture_ref || "Reflection"}
                    </span>
                    {devotion.is_shared && (
                        <span className="text-[10px] tracking-wider uppercase text-green-600 dark:text-green-400 font-sans shrink-0 ml-2">
                            Public ↗
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
