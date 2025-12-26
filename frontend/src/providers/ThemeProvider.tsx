import { createContext, useContext, useEffect, useState } from "react";

type EffectiveTheme = "light" | "dark";

interface ThemeContextType {
    theme: EffectiveTheme;
}

const ThemeContext = createContext<ThemeContextType>({
    theme: "light",
});

export const useTheme = () => useContext(ThemeContext);

// Helper to get system preference
function getSystemTheme(): EffectiveTheme {
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        return "dark";
    }
    return "light";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    // Always follow system preference
    const [theme, setTheme] = useState<EffectiveTheme>(() => getSystemTheme());

    // Apply theme to DOM
    useEffect(() => {
        const root = document.documentElement;

        if (theme === "dark") {
            root.classList.add("dark");
        } else {
            root.classList.remove("dark");
        }
    }, [theme]);

    // Listen to system preference changes
    useEffect(() => {
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

        const handleChange = (e: MediaQueryListEvent) => {
            setTheme(e.matches ? "dark" : "light");
        };

        mediaQuery.addEventListener("change", handleChange);

        return () => {
            mediaQuery.removeEventListener("change", handleChange);
        };
    }, []);

    return (
        <ThemeContext.Provider value={{ theme }}>
            {children}
        </ThemeContext.Provider>
    );
}
