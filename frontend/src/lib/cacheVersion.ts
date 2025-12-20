/**
 * Cache versioning utility to detect and clear incompatible cached data
 * Prevents white screens caused by old cached data incompatible with new code
 */

// Build-time version constant (injected by Vite)
export const APP_VERSION = import.meta.env.VITE_APP_VERSION || "dev";

/**
 * Check if the stored app version matches the current version
 * @returns true if there's a version mismatch (old cache exists)
 */
export const isVersionMismatch = (): boolean => {
    const storedVersion = localStorage.getItem("app_version");
    return storedVersion !== null && storedVersion !== APP_VERSION;
};

/**
 * Clear all caches and localStorage except important user preferences
 * Called when version mismatch is detected
 */
export const clearStaleData = async (): Promise<void> => {
    console.log(`Clearing stale data. Old version: ${localStorage.getItem("app_version")}, New version: ${APP_VERSION}`);

    // Preserve important localStorage keys
    const preserve = ["hasSeenWelcome", "theme", "preferences"];
    const toRestore: Record<string, string> = {};

    preserve.forEach(key => {
        const val = localStorage.getItem(key);
        if (val) toRestore[key] = val;
    });

    // Clear all localStorage
    localStorage.clear();

    // Restore preserved keys
    Object.entries(toRestore).forEach(([key, val]) =>
        localStorage.setItem(key, val)
    );

    // Clear all Cache API caches
    try {
        const cacheNames = await caches.keys();
        await Promise.all(
            cacheNames.map(name => caches.delete(name))
        );
        console.log(`Cleared ${cacheNames.length} cache(s):`, cacheNames);
    } catch (err) {
        console.error("Failed to clear caches:", err);
    }

    // Update stored version
    localStorage.setItem("app_version", APP_VERSION);
    console.log(`Updated app version to: ${APP_VERSION}`);
};

/**
 * Initialize version check on app startup
 * Automatically clears stale data if version mismatch detected
 */
export const initVersionCheck = async (): Promise<void> => {
    const storedVersion = localStorage.getItem("app_version");

    if (!storedVersion) {
        // First time user - just set version
        console.log(`First launch or no version stored. Setting version: ${APP_VERSION}`);
        localStorage.setItem("app_version", APP_VERSION);
        return;
    }

    if (isVersionMismatch()) {
        console.warn(`Version mismatch detected! Stored: ${storedVersion}, Current: ${APP_VERSION}`);
        await clearStaleData();

        // Log to PostHog if available
        if (window.posthog) {
            window.posthog.capture("cache_version_mismatch", {
                old_version: storedVersion,
                new_version: APP_VERSION,
            });
        }
    } else {
        console.log(`App version verified: ${APP_VERSION}`);
    }
};

/**
 * Get a cache key with version prefix
 * Use this for any manual cache operations to ensure version isolation
 */
export const getCacheKey = (key: string): string => {
    return `selah_v${APP_VERSION}_${key}`;
};
