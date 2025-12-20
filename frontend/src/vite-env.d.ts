/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/vanillajs" />
/// <reference types="vite-plugin-pwa/client" />

// PostHog global type declaration
interface Window {
    posthog?: {
        capture: (event: string, properties?: Record<string, any>) => void;
    };
}
