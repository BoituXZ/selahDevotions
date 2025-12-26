import { motion, useInView } from "framer-motion";
import { useRef } from "react";

interface FooterCTAProps {
    onCTAClick: () => void;
}

export default function FooterCTA({ onCTAClick }: FooterCTAProps) {
    const ref = useRef<HTMLElement>(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    return (
        <motion.section
            ref={ref}
            className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 px-4"
        >
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="text-center"
            >
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif text-white mb-8 leading-tight">
                    Ready to deepen your walk?
                </h2>

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onCTAClick}
                    className="bg-white text-stone-900 px-12 py-5 rounded-lg text-xl font-medium shadow-2xl hover:shadow-white/20 transition duration-200"
                >
                    Get Started
                </motion.button>
            </motion.div>
        </motion.section>
    );
}
