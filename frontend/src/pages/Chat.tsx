import { useState, useRef, useEffect } from "react";
import { Send, Sparkles } from "lucide-react";
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
        <div className="flex flex-col h-[calc(100vh-64px)] md:h-screen max-w-4xl mx-auto bg-white border-x border-stone-100 shadow-sm">
            {/* Header */}
            <div className="p-4 border-b border-stone-100 flex items-center gap-3 bg-white/80 backdrop-blur sticky top-0 z-10">
                <div className="bg-orange-100 p-2 rounded-full text-orange-600 animate-[pulse-subtle_3s_ease-in-out_infinite]">
                    <Sparkles size={20} />
                </div>
                <div>
                    <h1 className="font-serif font-medium text-stone-800">
                        Theologian
                    </h1>
                    <p className="text-xs text-stone-500">
                        Powered by Scripture & Gemini
                    </p>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-stone-50">
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
            <div className="p-4 bg-white border-t border-stone-100">
                <form onSubmit={handleSend} className="relative">
                    <div className="flex gap-2 relative">
                        <input
                            type="text"
                            placeholder="Ask a question or share a burden..."
                            className="flex-1 bg-stone-50 border border-stone-200 rounded-full px-6 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-stone-400 focus:border-stone-400 transition-all placeholder:text-stone-400 disabled:opacity-50 disabled:cursor-not-allowed"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            disabled={loading}
                            maxLength={maxChars}
                        />
                        <button
                            type="submit"
                            disabled={loading || !input.trim()}
                            className="absolute right-2 top-1.5 p-1.5 bg-stone-900 text-white rounded-full hover:bg-stone-700 hover:scale-110 disabled:opacity-50 disabled:hover:bg-stone-900 disabled:hover:scale-100 transition-all duration-200 active:scale-95 shadow-lg hover:shadow-xl"
                        >
                            <Send size={18} />
                        </button>
                    </div>
                    {/* Character Counter */}
                    {showCounter && (
                        <div className="text-xs text-stone-400 mt-1.5 text-right animate-[fadeIn_0.2s_ease-out]">
                            {charCount} / {maxChars}
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}
