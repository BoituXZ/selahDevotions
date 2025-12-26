import { useState } from "react";
import { Sparkles } from "lucide-react";
import { useTypingEffect } from "../hooks/useTypingEffect";

interface Message {
    id: string;
    role: "user" | "assistant";
    text: string;
    isNew?: boolean;
    timestamp: Date;
}

interface MessageBubbleProps {
    message: Message;
    shouldType?: boolean;
}

export default function MessageBubble({
    message,
    shouldType = false,
}: MessageBubbleProps) {
    const [showTimestamp, setShowTimestamp] = useState(false);
    const { displayedText, isTyping } = useTypingEffect({
        text: message.text,
        speed: 30,
        enabled: shouldType,
    });

    // Format timestamp
    const formatTime = (date: Date) => {
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const minutes = Math.floor(diff / 60000);

        if (minutes < 1) return "Just now";
        if (minutes < 60) return `${minutes}m ago`;

        return date.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
        });
    };

    return (
        <div
            className={`flex gap-4 ${message.role === "user" ? "flex-row-reverse" : ""} animate-[slideUp_0.3s_ease-out] group`}
            onMouseEnter={() => setShowTimestamp(true)}
            onMouseLeave={() => setShowTimestamp(false)}
        >
            {/* Avatar */}
            {message.role === "assistant" ? (
                <div className="w-8 h-8 rounded-full bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 flex items-center justify-center shrink-0 text-stone-400 dark:text-stone-500">
                    <Sparkles size={14} strokeWidth={1.5} />
                </div>
            ) : null}

            {/* Bubble with Timestamp */}
            <div className={`relative flex-1 max-w-[80%] ${message.role === "user" ? "flex justify-end" : ""}`}>
                {/* Timestamp (shows on hover) */}
                {showTimestamp && (
                    <div
                        className={`absolute -top-5 text-[10px] text-stone-400 dark:text-stone-500 animate-[fadeIn_0.2s_ease-out] ${
                            message.role === "user" ? "right-0" : "left-0"
                        }`}
                    >
                        {formatTime(message.timestamp)}
                    </div>
                )}

                {/* Message Bubble */}
                <div
                    className={`px-6 py-4 text-sm leading-relaxed shadow-sm transition-all duration-200
          ${
              message.role === "user"
                  ? "bg-stone-800 dark:bg-stone-200 text-white dark:text-stone-900 rounded-2xl rounded-tr-sm"
                  : "bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100 border border-stone-100 dark:border-stone-700 rounded-2xl rounded-tl-sm shadow-stone-100 dark:shadow-stone-900"
          }`}
                >
                    <p className="font-sans">
                        {shouldType ? displayedText : message.text}
                        {isTyping && (
                            <span className="inline-block w-1 h-4 bg-stone-400 dark:bg-stone-500 ml-1 animate-pulse">
                                |
                            </span>
                        )}
                    </p>
                </div>
            </div>
        </div>
    );
}
