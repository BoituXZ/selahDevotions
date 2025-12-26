import { useRef } from "react";
import { useInView } from "framer-motion";

interface UseScrollAnimationOptions {
    once?: boolean;
    amount?: number | "some" | "all";
}

export function useScrollAnimation(
    options: UseScrollAnimationOptions = {}
) {
    const ref = useRef<HTMLElement>(null);
    const isInView = useInView(ref, {
        once: options.once ?? true,
        margin: "-100px",
        amount: options.amount ?? 0.3,
    });

    return { ref, isInView };
}
