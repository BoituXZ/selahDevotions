import { useState } from "react";
import { User, Bot } from "lucide-react";
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
            className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : ""} animate-[slideUp_0.3s_ease-out] group`}
            onMouseEnter={() => setShowTimestamp(true)}
            onMouseLeave={() => setShowTimestamp(false)}
        >
            {/* Avatar */}
            <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110
          ${
              message.role === "user"
                  ? "bg-stone-800 text-white"
                  : "bg-white border border-stone-200 text-orange-500"
          }`}
            >
                {message.role === "user" ? (
                    <User size={14} />
                ) : (
                    <Bot size={16} />
                )}
            </div>

            {/* Bubble with Timestamp */}
            <div className="relative flex-1 max-w-[80%]">
                {/* Timestamp (shows on hover) */}
                {showTimestamp && (
                    <div
                        className={`absolute -top-5 text-[10px] text-stone-400 animate-[fadeIn_0.2s_ease-out] ${
                            message.role === "user" ? "right-0" : "left-0"
                        }`}
                    >
                        {formatTime(message.timestamp)}
                    </div>
                )}

                {/* Message Bubble */}
                <div
                    className={`rounded-2xl px-5 py-3 text-sm leading-relaxed shadow-sm transition-all duration-200 group-hover:shadow-md
          ${
              message.role === "user"
                  ? "bg-stone-800 text-white rounded-tr-sm"
                  : "bg-white text-stone-700 border border-stone-100 rounded-tl-sm"
          }`}
                >
                    {shouldType ? displayedText : message.text}
                    {isTyping && (
                        <span className="inline-block w-1 h-4 bg-stone-400 ml-1 animate-pulse">
                            |
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
