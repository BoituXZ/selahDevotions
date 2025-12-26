import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

interface HeroSectionProps {
    onCTAClick: () => void;
}

export default function HeroSection({ onCTAClick }: HeroSectionProps) {
    return (
        <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="relative min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-stone-50 via-amber-50/30 to-stone-50 dark:from-stone-950 dark:via-stone-900 dark:to-stone-950"
        >
            <div className="max-w-4xl mx-auto text-center space-y-8">
                {/* Logo */}
                <motion.h1
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.8 }}
                    className="text-6xl md:text-7xl font-serif text-stone-800 dark:text-stone-100 tracking-tight"
                >
                    Selah.
                </motion.h1>

                {/* Main Heading */}
                <motion.h2
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.8 }}
                    className="text-4xl md:text-5xl font-serif text-stone-800 dark:text-stone-100 leading-tight"
                >
                    Find Peace in His Word
                </motion.h2>

                {/* Subtitle */}
                <motion.p
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.6, duration: 0.8 }}
                    className="text-lg md:text-xl text-stone-600 dark:text-stone-400 max-w-2xl mx-auto leading-relaxed"
                >
                    A sacred space for your spiritual journey. Track your
                    devotions, reflect on scripture, and find comfort in
                    Biblical wisdom.
                </motion.p>

                {/* CTA Button */}
                <motion.button
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.8, duration: 0.8 }}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onCTAClick}
                    className="bg-stone-900 dark:bg-stone-50 text-white dark:text-stone-900 px-10 py-4 rounded-lg text-lg font-medium hover:bg-stone-800 dark:hover:bg-stone-200 transition shadow-xl hover:shadow-2xl duration-200"
                >
                    Begin Journey
                </motion.button>
            </div>

            {/* Scroll Indicator */}
            <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                className="absolute bottom-8 left-1/2 -translate-x-1/2"
            >
                <ChevronDown size={32} className="text-stone-400 dark:text-stone-500" />
            </motion.div>
        </motion.section>
    );
}
