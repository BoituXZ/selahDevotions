import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, User, Bot } from "lucide-react";
import { api } from "../api";

interface Message {
    id: string;
    role: "user" | "assistant";
    text: string;
}

export default function Chat() {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "welcome",
            role: "assistant",
            text: "Peace be with you. What is on your heart today?",
        },
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

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
        };
        setMessages((prev) => [...prev, userMsg]);
        setLoading(true);

        try {
            // 2. Call API
            const data = await api.post<{ reply: string }>("/api/chat", {
                message: userText,
            });

            // 3. Add AI Response
            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                text: data.reply,
            };
            setMessages((prev) => [...prev, aiMsg]);
        } catch (err) {
            console.error(err);
            // Error handling UI could go here
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-64px)] md:h-screen max-w-4xl mx-auto bg-white border-x border-stone-100 shadow-sm">
            {/* Header */}
            <div className="p-4 border-b border-stone-100 flex items-center gap-3 bg-white/80 backdrop-blur sticky top-0 z-10">
                <div className="bg-orange-100 p-2 rounded-full text-orange-600">
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
                    <div
                        key={msg.id}
                        className={`flex gap-3 ${
                            msg.role === "user" ? "flex-row-reverse" : ""
                        }`}
                    >
                        {/* Avatar */}
                        <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 
              ${
                  msg.role === "user"
                      ? "bg-stone-800 text-white"
                      : "bg-white border border-stone-200 text-orange-500"
              }`}
                        >
                            {msg.role === "user" ? (
                                <User size={14} />
                            ) : (
                                <Bot size={16} />
                            )}
                        </div>

                        {/* Bubble */}
                        <div
                            className={`max-w-[80%] rounded-2xl px-5 py-3 text-sm leading-relaxed shadow-sm
              ${
                  msg.role === "user"
                      ? "bg-stone-800 text-white rounded-tr-sm"
                      : "bg-white text-stone-700 border border-stone-100 rounded-tl-sm"
              }`}
                        >
                            {msg.text}
                        </div>
                    </div>
                ))}

                {loading && (
                    <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-white border border-stone-200 flex items-center justify-center text-orange-500">
                            <Bot size={16} />
                        </div>
                        <div className="bg-white border border-stone-100 rounded-2xl rounded-tl-sm px-5 py-3 flex items-center gap-1">
                            <div className="w-2 h-2 bg-stone-300 rounded-full animate-bounce" />
                            <div className="w-2 h-2 bg-stone-300 rounded-full animate-bounce delay-75" />
                            <div className="w-2 h-2 bg-stone-300 rounded-full animate-bounce delay-150" />
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-stone-100">
                <form onSubmit={handleSend} className="flex gap-2 relative">
                    <input
                        type="text"
                        placeholder="Ask a question or share a burden..."
                        className="flex-1 bg-stone-50 border border-stone-200 rounded-full px-6 py-3 focus:outline-none focus:ring-2 focus:ring-stone-200 transition placeholder:text-stone-400"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        disabled={loading}
                    />
                    <button
                        disabled={loading || !input.trim()}
                        className="absolute right-2 top-1.5 p-1.5 bg-stone-900 text-white rounded-full hover:bg-stone-700 disabled:opacity-50 disabled:hover:bg-stone-900 transition"
                    >
                        <Send size={18} />
                    </button>
                </form>
            </div>
        </div>
    );
}
