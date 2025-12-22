import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface SelahLoaderProps {
    timeout?: number;
    onTimeout?: () => void;
}

export default function SelahLoader({ timeout = 15000, onTimeout }: SelahLoaderProps) {
    const [showSlowWarning, setShowSlowWarning] = useState(false);
    const [hasTimedOut, setHasTimedOut] = useState(false);

    useEffect(() => {
        // Show "taking longer..." message after 5 seconds
        const warningTimer = setTimeout(() => {
            setShowSlowWarning(true);
        }, 5000);

        // Show reload button after timeout (default 8s)
        const timeoutTimer = setTimeout(() => {
            setHasTimedOut(true);
            onTimeout?.();
        }, timeout);

        return () => {
            clearTimeout(warningTimer);
            clearTimeout(timeoutTimer);
        };
    }, [timeout, onTimeout]);

    if (hasTimedOut) {
        return (
            <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#FDFBF7] p-8">
                <div className="text-center">
                    <svg
                        className="w-12 h-12 text-stone-400 mx-auto mb-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                    </svg>
                    <p className="text-stone-600 text-center mb-6 font-serif">
                        This is taking longer than expected...
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-6 py-3 bg-stone-900 text-white rounded-lg hover:bg-stone-700 transition-colors font-medium"
                    >
                        Reload App
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#FDFBF7]">
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

            {showSlowWarning && (
                <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 text-stone-500 text-sm font-serif"
                >
                    Loading your spiritual companion...
                </motion.p>
            )}
        </div>
    );
}
