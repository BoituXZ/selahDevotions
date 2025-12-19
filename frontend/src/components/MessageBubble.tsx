import { User, Bot } from "lucide-react";
import { useTypingEffect } from "../hooks/useTypingEffect";

interface Message {
    id: string;
    role: "user" | "assistant";
    text: string;
    isNew?: boolean;
}

interface MessageBubbleProps {
    message: Message;
    shouldType?: boolean;
}

export default function MessageBubble({
    message,
    shouldType = false,
}: MessageBubbleProps) {
    const { displayedText, isTyping } = useTypingEffect({
        text: message.text,
        speed: 30,
        enabled: shouldType,
    });

    return (
        <div
            className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : ""}`}
        >
            {/* Avatar */}
            <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0
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

            {/* Bubble */}
            <div
                className={`max-w-[80%] rounded-2xl px-5 py-3 text-sm leading-relaxed shadow-sm
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
    );
}
