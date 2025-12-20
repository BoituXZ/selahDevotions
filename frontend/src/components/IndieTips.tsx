import { useState, useEffect } from "react";
import { Coffee, Code, Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const TIPS = [
    {
        icon: Coffee,
        text: "This app runs on code and caffeine. Mostly caffeine.",
        color: "text-amber-600",
        bg: "bg-amber-50",
    },
    {
        icon: Coffee,
        text: "Fun fact: I made this so I'd actually read my Bible.",
        color: "text-purple-600",
        bg: "bg-purple-50",
    },
    {
        icon: Heart,
        text: "You are loved. Also, nice streak you got there.",
        color: "text-rose-600",
        bg: "bg-rose-50",
    },
    {
        icon: Code,
        text: "If you find a bug, let's just call it a 'surprise feature'.",
        color: "text-emerald-600",
        bg: "bg-emerald-50",
    },
    {
        icon: Coffee,
        text: "Scripture > Scrolling. You made the right choice today.",
        color: "text-blue-600",
        bg: "bg-blue-50",
    },
    {
        icon: Coffee,
        text: "Taking a moment to Selah is productivity in God's economy.",
        color: "text-stone-600",
        bg: "bg-stone-100",
    },
];

export default function IndieTips() {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        // Change tip every 10 seconds, but start random
        setIndex(Math.floor(Math.random() * TIPS.length));

        const interval = setInterval(() => {
            setIndex((prev) => (prev + 1) % TIPS.length);
        }, 10000);

        return () => clearInterval(interval);
    }, []);

    const tip = TIPS[index];
    const Icon = tip.icon;

    return (
        <div className="w-full flex justify-center py-6 opacity-80 hover:opacity-100 transition-opacity">
            <AnimatePresence mode="wait">
                <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className={`flex items-center gap-3 px-4 py-2 rounded-full border border-stone-100 shadow-sm ${tip.bg}`}
                >
                    <Icon size={14} className={tip.color} />
                    <span
                        className={`text-xs font-medium font-sans ${tip.color}`}
                    >
                        {tip.text}
                    </span>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
