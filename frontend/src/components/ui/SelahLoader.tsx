import { motion } from "framer-motion";

export default function SelahLoader() {
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-[#FDFBF7]">
            <motion.div
                animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.5, 1, 0.5],
                }}
                transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
                className="text-stone-800"
            >
                {/* Abstract Minimalist Cross */}
                <svg
                    width="48"
                    height="48"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M12 4v16" />
                    <path d="M7 9h10" />
                </svg>
            </motion.div>
        </div>
    );
}
