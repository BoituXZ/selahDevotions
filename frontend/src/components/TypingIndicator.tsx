import { Sparkles } from "lucide-react";
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
        <div className="flex gap-4 animate-[slideUp_0.3s_ease-out]">
            {/* Pulsing Avatar */}
            <div className="w-8 h-8 rounded-full bg-white border border-stone-200 flex items-center justify-center text-stone-400 animate-[pulse-subtle_2s_ease-in-out_infinite]">
                <Sparkles size={14} strokeWidth={1.5} />
            </div>

            {/* Message with animated dots */}
            <div className="bg-white border border-stone-100 rounded-2xl rounded-tl-sm px-6 py-4 shadow-sm">
                <div className="flex items-center gap-2 text-stone-600 text-sm">
                    <span className="font-serif italic">{message}</span>
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
