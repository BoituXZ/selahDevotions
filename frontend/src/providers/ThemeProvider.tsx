import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "../AuthProvider";
import { api } from "../api";

type ThemeMode = "light" | "dark" | "system";
type EffectiveTheme = "light" | "dark";

interface ThemeContextType {
    themeMode: ThemeMode;
    effectiveTheme: EffectiveTheme;
    setTheme: (mode: ThemeMode) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType>({
    themeMode: "system",
    effectiveTheme: "light",
    setTheme: async () => {},
});

export const useTheme = () => useContext(ThemeContext);

const THEME_STORAGE_KEY = "selah-theme-preference";

// Helper to get system preference
function getSystemTheme(): EffectiveTheme {
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        return "dark";
    }
    return "light";
}

// Helper to resolve effective theme from mode
function resolveEffectiveTheme(mode: ThemeMode): EffectiveTheme {
    if (mode === "system") {
        return getSystemTheme();
    }
    return mode;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();

    // Initialize from localStorage for instant feedback
    // This prevents flash of wrong theme on page load
    const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
        const stored = localStorage.getItem(THEME_STORAGE_KEY);
        if (stored === "light" || stored === "dark" || stored === "system") {
            return stored;
        }
        return "system";
    });

    const [effectiveTheme, setEffectiveTheme] = useState<EffectiveTheme>(() =>
        resolveEffectiveTheme("system")
    );

    // Update effectiveTheme when themeMode changes
    useEffect(() => {
        const resolved = resolveEffectiveTheme(themeMode);
        setEffectiveTheme(resolved);
    }, [themeMode]);

    // Apply theme to DOM
    useEffect(() => {
        const root = document.documentElement;

        if (effectiveTheme === "dark") {
            root.classList.add("dark");
        } else {
            root.classList.remove("dark");
        }
    }, [effectiveTheme]);

    // Listen to system preference changes (only when mode is 'system')
    useEffect(() => {
        if (themeMode !== "system") return;

        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

        const handleChange = (e: MediaQueryListEvent) => {
            setEffectiveTheme(e.matches ? "dark" : "light");
        };

        mediaQuery.addEventListener("change", handleChange);

        return () => {
            mediaQuery.removeEventListener("change", handleChange);
        };
    }, [themeMode]);

    // Load theme preference from Supabase on mount (authenticated users only)
    // Supabase is the source of truth
    useEffect(() => {
        if (!user) return;

        const loadUserPreference = async () => {
            try {
                // Add timestamp to prevent caching
                const response = await api.get<{
                    theme_preference?: ThemeMode;
                }>(`/api/preferences?t=${Date.now()}`);

                if (response.theme_preference) {
                    // Only update if different from current (prevents unnecessary re-renders)
                    if (response.theme_preference !== themeMode) {
                        setThemeMode(response.theme_preference);
                        // Sync with localStorage
                        localStorage.setItem(THEME_STORAGE_KEY, response.theme_preference);
                    }
                    // effectiveTheme will be automatically derived by useEffect (lines 52-61)
                }
            } catch (error) {
                // Silently fail - fallback to system default
                console.error(
                    "Failed to load theme preference from server:",
                    error
                );
            }
        };

        loadUserPreference();
    }, [user]);

    // Public API for changing theme
    // Saves to both localStorage and Supabase
    const setTheme = async (mode: ThemeMode) => {
        // Update local state immediately for UI responsiveness
        setThemeMode(mode);

        // Save to localStorage for instant feedback on next load
        localStorage.setItem(THEME_STORAGE_KEY, mode);
        // effectiveTheme will be automatically derived by useEffect (lines 52-61)

        // Save to Supabase if user is authenticated (for cross-device sync)
        if (user) {
            try {
                await api.post("/api/preferences/update-theme", {
                    theme_preference: mode,
                });
            } catch (error) {
                console.error(
                    "Failed to save theme preference to server:",
                    error
                );
                throw error; // Re-throw so Profile.tsx can handle it
            }
        }
    };

    return (
        <ThemeContext.Provider
            value={{ themeMode, effectiveTheme, setTheme }}
        >
            {children}
        </ThemeContext.Provider>
    );
}
