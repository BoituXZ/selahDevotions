import { toast } from "sonner";

/**
 * Initialize global error handlers to catch errors outside React components
 * - Unhandled promise rejections
 * - JavaScript errors (including chunk loading failures)
 * - Service worker lifecycle events
 * - Network connectivity changes
 */
export const initGlobalErrorHandlers = (): void => {
    // Track if we've already shown a reload toast to prevent spam
    let reloadToastShown = false;

    // 1. Catch unhandled promise rejections
    window.addEventListener("unhandledrejection", (event) => {
        console.error("Unhandled Promise Rejection:", event.reason);

        // Check if it's a network error
        if (
            event.reason?.message?.includes("fetch") ||
            event.reason?.message?.includes("Failed to fetch")
        ) {
            toast.error(
                "Network connection lost. Please check your internet connection.",
                {
                    duration: 5000,
                }
            );
        } else if (
            event.reason?.message?.includes("Unauthorized") ||
            event.reason?.message?.includes("401")
        ) {
            // Auth errors are handled by api.ts, so we can skip them here
            return;
        } else {
            // Generic unhandled rejection — log silently, don't interrupt the user
            return;
        }

        // Log to PostHog if available
        if (window.posthog) {
            window.posthog.capture("unhandled_rejection", {
                error: event.reason?.message || String(event.reason),
                stack: event.reason?.stack,
            });
        }

        // Prevent default console error spam
        event.preventDefault();
    });

    // 2. Catch global JavaScript errors
    window.addEventListener("error", (event) => {
        console.error("Global Error:", event.error);

        // Check if it's a chunk loading error (lazy loading failure due to stale service worker)
        if (
            event.message?.includes("Loading chunk") ||
            event.message?.includes(
                "Failed to fetch dynamically imported module"
            ) ||
            event.message?.includes("Importing a module script failed")
        ) {
            if (!reloadToastShown) {
                toast.error(
                    "Failed to load app resources. Clearing cache and reloading...",
                    {
                        duration: 3000,
                    }
                );
                reloadToastShown = true;

                // Clear service worker and reload
                navigator.serviceWorker
                    ?.getRegistrations()
                    .then((registrations) => {
                        registrations.forEach((registration) =>
                            registration.unregister()
                        );
                    })
                    .finally(() => {
                        setTimeout(() => {
                            window.location.reload();
                        }, 3000);
                    });

                event.preventDefault();
                return;
            }
        }

        // Log to PostHog if available
        if (window.posthog) {
            window.posthog.capture("global_error", {
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                stack: event.error?.stack,
            });
        }
    });

    // 3. Detect when service worker updates and auto-reload
    if (navigator.serviceWorker) {
        navigator.serviceWorker.addEventListener("controllerchange", () => {
            // Only reload if we haven't already shown a reload toast
            if (!reloadToastShown) {
                toast.success("App updated! Reloading...", { duration: 2000 });
                reloadToastShown = true;

                // Reload page to use new service worker
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
            }
        });
    }

    // 4. Detect when user goes offline/online
    window.addEventListener("offline", () => {
        toast.warning("You are offline. Some features may not work.", {
            duration: Infinity,
            id: "offline-toast",
        });
    });

    window.addEventListener("online", () => {
        toast.dismiss("offline-toast");
        toast.success("Back online!", { duration: 3000 });
    });
};
