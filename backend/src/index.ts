import { Hono } from "hono";
import { cors } from "hono/cors";
import { secureHeaders } from "hono/secure-headers";

// NOTE: We do NOT import './lib/env' at the top level anymore.
// This prevents the app from crashing before it can even start.

const app = new Hono();

// ============================================
// 1. Critical "Alive" Endpoints (Always Load)
// ============================================
// Cloud Run needs these to pass immediately, or it kills the app.
app.get("/", (c) => c.text("Selah API is Running (Base Layer)"));
app.get("/health", (c) => c.json({ status: "ok", mode: process.env.NODE_ENV }));

// ============================================
// 2. Safe Loading of the "Real" App
// ============================================
try {
    console.log("🔄 Attempting to load environment and routes...");

    // We use 'require' here so we can catch the error if validation fails
    // (e.g. if SUPABASE_URL is missing)
    const { env } = require("./lib/env");
    const { logger } = require("./lib/logger");
    const { authMiddleware } = require("./middleware/auth");

    // Load Routes
    const devotions = require("./routes/devotions").default;
    const streaks = require("./routes/streaks").default;
    const chat = require("./routes/chat").default;

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

    // --- CORS ---
    app.use(
        "/*",
        cors({
            origin: (origin) => {
                if (!origin) return env.FRONTEND_URL;
                if (origin === env.FRONTEND_URL) return origin;
                if (env.NODE_ENV === "development") return origin; // Allow localhost in dev
                return env.FRONTEND_URL;
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

    logger.info("Selah API fully initialized");
} catch (error) {
    // THIS IS THE SAFETY NET
    // If env vars are missing, we log it but keep the server running
    // so you can see the error in Cloud Run logs.
    console.error("❌ CRITICAL STARTUP ERROR:", error);

    // Serve the error on /api routes so frontend developers know what's up
    app.all("/api/*", (c) => {
        return c.json(
            {
                error: "Server Initialization Failed",
                details: String(error),
            },
            500
        );
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
