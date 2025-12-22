import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";
import { readFileSync } from "fs";

// Read version from package.json
const packageJson = JSON.parse(readFileSync("./package.json", "utf-8"));
const appVersion = process.env.VITE_APP_VERSION || packageJson.version;

export default defineConfig({
    define: {
        // Inject build version for cache versioning (uses package.json version)
        "import.meta.env.VITE_APP_VERSION": JSON.stringify(appVersion),
    },
    plugins: [
        react(),
        tailwindcss(),
        VitePWA({
            registerType: "autoUpdate",
            includeAssets: [
                "favicon.ico",
                "apple-touch-icon.png",
                "pwa-192x192.png",
            ],
            manifest: {
                name: "Selah - Biblical Devotions & AI Companion",
                short_name: "Selah",
                description:
                    "Your daily companion for biblical devotions, reflection, and spiritual guidance",
                theme_color: "#1e40af",
                background_color: "#ffffff",
                display: "standalone",
                scope: "/",
                start_url: "/",
                icons: [
                    {
                        src: "pwa-192x192.png",
                        sizes: "192x192",
                        type: "image/png",
                        purpose: "any maskable",
                    },
                    {
                        src: "pwa-512x512.png",
                        sizes: "512x512",
                        type: "image/png",
                        purpose: "any maskable",
                    },
                ],
            },
            workbox: {
                // Add cache versioning with package.json version (only changes when you bump version)
                cacheId: `selah-v${appVersion}`,

                // Auto-cleanup old caches
                cleanupOutdatedCaches: true,

                globPatterns: ["**/*.{js,css,html,ico,png,svg,woff,woff2}"],
                runtimeCaching: [
                    {
                        urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
                        handler: "CacheFirst",
                        options: {
                            cacheName: "google-fonts-cache",
                            expiration: {
                                maxEntries: 10,
                                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
                            },
                            cacheableResponse: {
                                statuses: [0, 200],
                            },
                        },
                    },
                    {
                        urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
                        handler: "CacheFirst",
                        options: {
                            cacheName: "gstatic-fonts-cache",
                            expiration: {
                                maxEntries: 10,
                                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
                            },
                            cacheableResponse: {
                                statuses: [0, 200],
                            },
                        },
                    },
                    // Supabase Storage/Rest - Network First (Exclude Auth)
                    {
                        urlPattern: /^https:\/\/.*\.supabase\.co\/(?!auth\/v1\/).*$/i,
                        handler: "NetworkFirst",
                        options: {
                            cacheName: "supabase-api-cache",
                            networkTimeoutSeconds: 10,
                            expiration: {
                                maxEntries: 50,
                                maxAgeSeconds: 60,
                            },
                            cacheableResponse: {
                                statuses: [0, 200],
                            },
                        },
                    },
                    {
                        urlPattern: ({ url }) => {
                            return url.pathname.startsWith("/api/");
                        },
                        handler: "NetworkFirst",
                        options: {
                            cacheName: "api-cache",
                            networkTimeoutSeconds: 10,
                            expiration: {
                                maxEntries: 50,
                                maxAgeSeconds: 60,
                            },
                        },
                    },
                ],
            },
            devOptions: {
                enabled: true,
                type: "module",
            },
        }),
    ],
});
