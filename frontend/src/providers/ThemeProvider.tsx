import { createContext, useContext, useEffect, useState, useRef } from "react";
import { useAuth } from "../AuthProvider";
import { api } from "../api";

type ThemeMode = "light" | "dark" | "system";
type EffectiveTheme = "light" | "dark";

interface ThemeContextType {
    themeMode: ThemeMode;
    effectiveTheme: EffectiveTheme;
    setTheme: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType>({
    themeMode: "system",
    effectiveTheme: "light",
    setTheme: () => {},
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

    // Initialize theme from localStorage or default to 'system'
    const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
        const stored = localStorage.getItem(THEME_STORAGE_KEY);
        if (stored === "light" || stored === "dark" || stored === "system") {
            return stored;
        }
        return "system";
    });

    const [effectiveTheme, setEffectiveTheme] = useState<EffectiveTheme>(() =>
        resolveEffectiveTheme(themeMode)
    );

    // Debounce timer for Supabase sync
    const syncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

    // Sync theme preference to Supabase (debounced)
    useEffect(() => {
        // Clear any pending sync
        if (syncTimeoutRef.current) {
            clearTimeout(syncTimeoutRef.current);
        }

        // Only sync if user is authenticated
        if (!user) return;

        // Debounce the API call by 1000ms
        syncTimeoutRef.current = setTimeout(async () => {
            try {
                await api.post("/api/preferences/update-theme", {
                    theme_preference: themeMode,
                });
            } catch (error) {
                // Silently fail - theme still works via localStorage
                console.error("Failed to sync theme preference to server:", error);
            }
        }, 1000);

        return () => {
            if (syncTimeoutRef.current) {
                clearTimeout(syncTimeoutRef.current);
            }
        };
    }, [themeMode, user]);

    // Load theme preference from Supabase on mount (authenticated users only)
    useEffect(() => {
        if (!user) return;

        const loadUserPreference = async () => {
            try {
                const response = await api.get<{ theme_preference?: ThemeMode }>("/api/preferences");

                if (response.theme_preference) {
                    // Only update if different from localStorage
                    const storedLocal = localStorage.getItem(THEME_STORAGE_KEY);
                    if (response.theme_preference !== storedLocal) {
                        setThemeMode(response.theme_preference);
                        localStorage.setItem(THEME_STORAGE_KEY, response.theme_preference);
                        setEffectiveTheme(resolveEffectiveTheme(response.theme_preference));
                    }
                }
            } catch (error) {
                // Silently fail - use localStorage value
                console.error("Failed to load theme preference from server:", error);
            }
        };

        loadUserPreference();
    }, [user]);

    // Public API for changing theme
    const setTheme = (mode: ThemeMode) => {
        setThemeMode(mode);
        localStorage.setItem(THEME_STORAGE_KEY, mode);
        setEffectiveTheme(resolveEffectiveTheme(mode));
    };

    return (
        <ThemeContext.Provider value={{ themeMode, effectiveTheme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}
