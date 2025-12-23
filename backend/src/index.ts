import { Hono } from "hono";
import { cors } from "hono/cors";
import { secureHeaders } from "hono/secure-headers";

const app = new Hono();

// ============================================
// 1. Stealth Mode (Public endpoints hidden)
// ============================================
// We return 404 on root so random visitors think the server is empty.
app.get("/", (c) => c.notFound());

// We keep /health for Cloud Run, but you can obfuscate it if you really want.
// Cloud Run needs this 200 OK to know the container is alive.
app.get("/health", (c) => c.json({ status: "ok" }));

// ============================================
// 2. Safe Loading of the "Real" App
// ============================================
try {
    console.log("🔄 Attempting to load environment and routes...");

    const { env } = require("./lib/env");
    const { logger } = require("./lib/logger");
    const { authMiddleware } = require("./middleware/auth");

    // Load Routes
    const devotions = require("./routes/devotions").default;
    const streaks = require("./routes/streaks").default;
    const chat = require("./routes/chat").default;
    const preferences = require("./routes/preferences").default;

    console.log("✅ Environment valid. Mounting full application...");

    // --- Security Middleware ---
    app.use(
        "/*",
        secureHeaders({
            contentSecurityPolicy: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'", "'unsafe-inline'"],
                connectSrc: ["'self'", env.FRONTEND_URL],
            },
            crossOriginEmbedderPolicy: false,
            crossOriginResourcePolicy: "cross-origin",
        })
    );

    // --- STRICT CORS (The Doorman) ---
    app.use(
        "/*",
        cors({
            origin: (origin) => {
                // 1. Allow configured frontend URL
                if (origin === env.FRONTEND_URL) return origin;

                // 2. Allow Localhost ONLY in Development
                if (
                    env.NODE_ENV === "development" &&
                    (origin === "http://localhost:3000" ||
                        origin === "http://localhost:5173")
                ) {
                    return origin;
                }

                // 3. Block everyone else (Postman, curl, other websites)
                // Returning undefined/null causes the browser to reject the response.
                return undefined;
            },
            allowHeaders: ["Content-Type", "Authorization"],
            allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            credentials: true,
        })
    );

    // --- Protected Routes ---
    app.use("/api/*", authMiddleware);
    app.route("/api/devotions", devotions);
    app.route("/api/streaks", streaks);
    app.route("/api/chat", chat);
    app.route("/api/preferences", preferences);

    logger.info("Selah API fully initialized");
} catch (error) {
    console.error("❌ CRITICAL STARTUP ERROR:", error);
    // If we crash, we still return JSON so you know why,
    // but only on /api routes to keep the root stealthy.
    app.all("/api/*", (c) => {
        return c.json({ error: "Server Initialization Failed" }, 500);
    });
}

// ============================================
// 3. Export for Bun
// ============================================
const port = parseInt(process.env.PORT || "8080");
console.log(`🚀 Server listening on port ${port}`);

export default {
    port: port,
    fetch: app.fetch,
};
