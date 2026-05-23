import { createContext, useContext, useEffect, useState } from "react";

export type ThemePreference = "light" | "dark" | "system";
type EffectiveTheme = "light" | "dark";

interface ThemeContextType {
    theme: EffectiveTheme;
    preference: ThemePreference;
    setPreference: (pref: ThemePreference) => void;
}

const ThemeContext = createContext<ThemeContextType>({
    theme: "light",
    preference: "system",
    setPreference: () => {},
});

export const useTheme = () => useContext(ThemeContext);

function getSystemTheme(): EffectiveTheme {
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        return "dark";
    }
    return "light";
}

function resolveTheme(preference: ThemePreference): EffectiveTheme {
    if (preference === "system") return getSystemTheme();
    return preference;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [preference, setPreferenceState] = useState<ThemePreference>(() => {
        const saved = localStorage.getItem(
            "theme-preference",
        ) as ThemePreference | null;
        return saved || "system";
    });

    const [theme, setTheme] = useState<EffectiveTheme>(() =>
        resolveTheme(
            (localStorage.getItem(
                "theme-preference",
            ) as ThemePreference | null) || "system",
        ),
    );

    const setPreference = (pref: ThemePreference) => {
        setPreferenceState(pref);
        localStorage.setItem("theme-preference", pref);
        setTheme(resolveTheme(pref));
    };

    // Apply theme class to DOM
    useEffect(() => {
        const root = document.documentElement;
        if (theme === "dark") {
            root.classList.add("dark");
        } else {
            root.classList.remove("dark");
        }
    }, [theme]);

    // Listen to system preference changes (only matters when preference is "system")
    useEffect(() => {
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        const handleChange = (e: MediaQueryListEvent) => {
            if (preference === "system") {
                setTheme(e.matches ? "dark" : "light");
            }
        };
        mediaQuery.addEventListener("change", handleChange);
        return () => mediaQuery.removeEventListener("change", handleChange);
    }, [preference]);

    return (
        <ThemeContext.Provider value={{ theme, preference, setPreference }}>
            {children}
        </ThemeContext.Provider>
    );
}
