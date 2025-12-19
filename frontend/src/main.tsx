import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// 1. Import PostHog
import { PostHogProvider } from "posthog-js/react";

// 2. Import Vercel Analytics
import { Analytics } from "@vercel/analytics/react";

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

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        {/* PostHog tracks the USER */}
        <PostHogProvider
            apiKey={import.meta.env.VITE_PUBLIC_POSTHOG_KEY}
            options={posthogOptions}
        >
            <App />

            {/* Vercel tracks the PERFORMANCE */}
            <Analytics />
        </PostHogProvider>
    </React.StrictMode>
);
