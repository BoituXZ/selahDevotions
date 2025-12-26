import { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";
import { api } from "../api";
import MessageBubble from "../components/MessageBubble";
import TypingIndicator from "../components/TypingIndicator";

interface Message {
    id: string;
    role: "user" | "assistant";
    text: string;
    isNew?: boolean;
    timestamp: Date;
}

export default function Chat() {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "welcome",
            role: "assistant",
            text: "Peace be with you. What is on your heart today?",
            timestamp: new Date(),
        },
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom when messages change (smooth)
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Character count for input
    const charCount = input.length;
    const maxChars = 1000;
    const showCounter = charCount > 900;

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userText = input;
        setInput("");

        // 1. Add User Message immediately
        const userMsg: Message = {
            id: Date.now().toString(),
            role: "user",
            text: userText,
            timestamp: new Date(),
        };
        setMessages((prev) => [...prev, userMsg]);
        setLoading(true);

        try {
            // 2. Call API
            const data = await api.post<{ reply: string }>("/api/chat", {
                message: userText,
            });

            // 3. Add AI Response with typing effect
            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                text: data.reply,
                isNew: true,
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, aiMsg]);

            // Clear isNew flag after typing animation completes
            setTimeout(() => {
                setMessages((prev) =>
                    prev.map((msg) =>
                        msg.id === aiMsg.id ? { ...msg, isNew: false } : msg
                    )
                );
            }, data.reply.length * 30 + 100);
        } catch (err) {
            // Toast already shown by api.ts, add friendly error message to chat
            const errorMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                text: "I apologize, but I'm unable to respond right now. Please try again in a moment.",
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, errorMsg]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full max-w-4xl mx-auto bg-stone-50 dark:bg-stone-950 md:border-x border-stone-200 dark:border-stone-800 relative">
            {/* Header */}
            <div className="p-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-center bg-stone-50/80 dark:bg-stone-950/80 backdrop-blur sticky top-0 z-10 shrink-0">
                <h1 className="font-serif font-bold text-xl text-stone-800 dark:text-stone-100 tracking-tight">
                    Selah
                </h1>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 bg-stone-50 dark:bg-stone-950 scrollbar-hide pb-4">
                {messages.map((msg) => (
                    <MessageBubble
                        key={msg.id}
                        message={msg}
                        shouldType={msg.isNew && msg.role === "assistant"}
                    />
                ))}

                {/* Enhanced Loading State */}
                {loading && <TypingIndicator />}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 md:p-6 bg-stone-50 dark:bg-stone-950 border-t border-stone-200 dark:border-stone-800 pb-24 md:pb-6 shrink-0">
                <form onSubmit={handleSend} className="relative max-w-3xl mx-auto">
                    <div className="flex gap-2 relative bg-white dark:bg-stone-900 rounded-3xl shadow-sm border border-stone-200 dark:border-stone-800 focus-within:ring-2 focus-within:ring-stone-100 dark:focus-within:ring-stone-800 focus-within:border-stone-300 dark:focus-within:border-stone-700 transition-all duration-300">
                        <input
                            type="text"
                            placeholder="Ask a question or share a burden..."
                            className="flex-1 bg-transparent px-6 py-4 outline-none placeholder:text-stone-400 dark:placeholder:text-stone-500 disabled:opacity-50 disabled:cursor-not-allowed font-sans text-stone-800 dark:text-stone-100"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            disabled={loading}
                            maxLength={maxChars}
                        />
                        <button
                            type="submit"
                            disabled={loading || !input.trim()}
                            className="absolute right-2 top-2 p-2 bg-stone-900 dark:bg-stone-50 text-white dark:text-stone-900 rounded-full hover:bg-stone-700 dark:hover:bg-stone-200 disabled:opacity-0 disabled:scale-75 transition-all duration-200 shadow-md"
                        >
                            <Send size={18} strokeWidth={1.5} />
                        </button>
                    </div>
                    {/* Character Counter */}
                    {showCounter && (
                        <div className="text-xs text-stone-400 dark:text-stone-500 mt-2 text-right animate-[fadeIn_0.2s_ease-out]">
                            {charCount} / {maxChars}
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}
