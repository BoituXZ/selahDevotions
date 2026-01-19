import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// 1. Import PostHog with non-blocking error boundary
import { PostHogErrorBoundary } from "./components/PostHogErrorBoundary";

// 2. Import Vercel Analytics
import { Analytics } from "@vercel/analytics/react";

// 3. Import global error handlers
import { initGlobalErrorHandlers } from "./lib/globalErrorHandler";

// 4. Import ErrorBoundary
import { ErrorBoundary } from "./components/ErrorBoundary";

// 5. Import cache version checker
import { initVersionCheck } from "./lib/cacheVersion";
import { AuthProvider } from "./AuthProvider";
import { ThemeProvider } from "./providers/ThemeProvider";

// Configuration for PostHog
const posthogOptions = {
    api_host:
        import.meta.env.VITE_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
    // Good for AppSec: Masks user input in session replays so you don't record sensitive text
    session_recording: {
        maskAllInputs: true,
        maskTextSelector: "*",
    },
};

// Initialize global error handlers before rendering
initGlobalErrorHandlers();

// Render function
const renderApp = () => {
    ReactDOM.createRoot(document.getElementById("root")!).render(
        <React.StrictMode>
            <ErrorBoundary>
                {/* PostHog tracks the USER - wrapped in error boundary to prevent blocking */}
                <PostHogErrorBoundary
                    apiKey={import.meta.env.VITE_PUBLIC_POSTHOG_KEY}
                    options={posthogOptions}
                >
                    <AuthProvider>
                        <ThemeProvider>
                            <App />

                            {/* Vercel tracks the PERFORMANCE */}
                            <Analytics
                                beforeSend={(event) => {
                                    // Normalize dynamic routes for cleaner analytics grouping
                                    const url = event.url
                                        .replace(
                                            /\/devotions\/[a-f0-9-]+/gi,
                                            "/devotions/[id]",
                                        )
                                        .replace(
                                            /\/share\/[a-f0-9-]+/gi,
                                            "/share/[token]",
                                        );
                                    return { ...event, url };
                                }}
                            />
                        </ThemeProvider>
                    </AuthProvider>
                </PostHogErrorBoundary>
            </ErrorBoundary>
        </React.StrictMode>,
    );
};

// Initialize version check with safety timeout to prevent hanging
let hasRendered = false;

const safeRender = () => {
    if (!hasRendered) {
        hasRendered = true;
        renderApp();
    }
};

// Set a fallback timeout - render app after 2 seconds no matter what
const fallbackTimer = setTimeout(() => {
    console.warn("⚠️ Version check timeout - rendering app anyway");
    safeRender();
}, 2000);

// Try to run version check, but don't block rendering
initVersionCheck()
    .then(() => {
        clearTimeout(fallbackTimer);
        safeRender();
    })
    .catch((err) => {
        console.error("❌ Version check failed:", err);
        clearTimeout(fallbackTimer);
        safeRender();
    });
