import { Bot } from "lucide-react";
import { useState, useEffect } from "react";

const SPIRITUAL_MESSAGES = [
    "Searching the scriptures...",
    "Seeking wisdom...",
    "Pondering your question...",
    "Reflecting on His word...",
    "Consulting the scriptures...",
];

export default function TypingIndicator() {
    const [message, setMessage] = useState(SPIRITUAL_MESSAGES[0]);

    useEffect(() => {
        // Randomly select a spiritual message
        const randomMessage =
            SPIRITUAL_MESSAGES[
                Math.floor(Math.random() * SPIRITUAL_MESSAGES.length)
            ];
        setMessage(randomMessage);
    }, []);

    return (
        <div className="flex gap-3 animate-[slideUp_0.3s_ease-out]">
            {/* Pulsing Avatar */}
            <div className="w-8 h-8 rounded-full bg-white border border-stone-200 flex items-center justify-center text-orange-500 animate-[pulse-subtle_2s_ease-in-out_infinite]">
                <Bot size={16} />
            </div>

            {/* Message with animated dots */}
            <div className="bg-white border border-stone-100 rounded-2xl rounded-tl-sm px-5 py-3">
                <div className="flex items-center gap-2 text-stone-600 text-sm">
                    <span>{message}</span>
                    <div className="flex gap-1">
                        <div className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce" />
                        <div
                            className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce"
                            style={{ animationDelay: "0.1s" }}
                        />
                        <div
                            className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce"
                            style={{ animationDelay: "0.2s" }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
