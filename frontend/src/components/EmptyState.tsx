import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    message: string;
    actionLabel?: string;
    onAction?: () => void;
}

export default function EmptyState({
    icon: Icon,
    title,
    message,
    actionLabel,
    onAction,
}: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            {/* Floating Icon */}
            <div className="mb-6 text-stone-400 animate-[float_3s_ease-in-out_infinite]">
                <Icon size={64} strokeWidth={1.5} />
            </div>

            {/* Title */}
            <h3 className="text-2xl font-serif text-stone-800 mb-2">
                {title}
            </h3>

            {/* Message */}
            <p className="text-stone-600 max-w-md mb-8 leading-relaxed">
                {message}
            </p>

            {/* Action Button (optional) */}
            {actionLabel && onAction && (
                <button
                    onClick={onAction}
                    className="bg-stone-900 text-white px-8 py-3 rounded-lg font-medium hover:bg-stone-800 transition shadow-lg hover:shadow-xl hover:-translate-y-1 duration-200"
                >
                    {actionLabel}
                </button>
            )}
        </div>
    );
}
