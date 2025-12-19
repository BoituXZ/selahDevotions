import { useState, useEffect } from "react";

interface UseTypingEffectOptions {
    text: string;
    speed?: number;
    enabled?: boolean;
}

export function useTypingEffect({
    text,
    speed = 30,
    enabled = true,
}: UseTypingEffectOptions) {
    const [displayedText, setDisplayedText] = useState("");
    const [isTyping, setIsTyping] = useState(enabled);

    useEffect(() => {
        if (!enabled) {
            setDisplayedText(text);
            setIsTyping(false);
            return;
        }

        let currentIndex = 0;
        setDisplayedText("");
        setIsTyping(true);

        const interval = setInterval(() => {
            if (currentIndex < text.length) {
                setDisplayedText(text.slice(0, currentIndex + 1));
                currentIndex++;
            } else {
                setIsTyping(false);
                clearInterval(interval);
            }
        }, speed);

        return () => clearInterval(interval);
    }, [text, speed, enabled]);

    return { displayedText, isTyping };
}
