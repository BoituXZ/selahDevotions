// ============================================
// CRITICAL: Environment Validation (MUST BE FIRST)
// ============================================
import { env } from "./lib/env";

// Now import everything else
import { Hono } from "hono";
import { cors } from "hono/cors";
import { secureHeaders } from "hono/secure-headers";
import { authMiddleware } from "./middleware/auth";
import { rateLimitMiddleware } from "./middleware/rate-limit";
import { logger } from "./lib/logger";
import devotions from "./routes/devotions";
import streaks from "./routes/streaks";
import chat from "./routes/chat";
import health from "./routes/health";

// Exporting types for other files to use
export type Variables = {
    user: any;
};

const app = new Hono<{ Variables: Variables }>();

// ============================================
// 1. Security Headers (FIRST MIDDLEWARE)
// ============================================
app.use(
    "/*",
    secureHeaders({
        contentSecurityPolicy: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"], // React needs inline scripts
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'", env.FRONTEND_URL],
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
            upgradeInsecureRequests: [],
        },
        crossOriginEmbedderPolicy: false, // Allow external resources
        crossOriginResourcePolicy: "cross-origin",
        crossOriginOpenerPolicy: "same-origin-allow-popups",
        referrerPolicy: "strict-origin-when-cross-origin",
        strictTransportSecurity: "max-age=31536000; includeSubDomains; preload",
        xContentTypeOptions: "nosniff",
        xDnsPrefetchControl: "off",
        xFrameOptions: "DENY",
        xPermittedCrossDomainPolicies: "none",
        xXssProtection: "1; mode=block",
    })
);

// ============================================
// 2. CORS (Strict - Fail Closed)
// ============================================
app.use(
    "/*",
    cors({
        origin: (origin) => {
            // Allow requests with no origin (mobile apps, Postman)
            if (!origin) return env.FRONTEND_URL;

            // Strict match - no wildcards
            if (origin === env.FRONTEND_URL) return origin;

            // Development: also allow localhost:3000 if in dev mode
            if (
                env.NODE_ENV === "development" &&
                (origin === "http://localhost:3000" ||
                    origin === "http://localhost:5173")
            ) {
                return origin;
            }

            // Reject all others (return the allowed origin, CORS will block)
            return env.FRONTEND_URL;
        },
        allowHeaders: ["Content-Type", "Authorization"],
        allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        exposeHeaders: [
            "Content-Length",
            "X-RateLimit-Limit",
            "X-RateLimit-Remaining",
            "X-RateLimit-Reset",
        ],
        maxAge: 600,
        credentials: true,
    })
);

// ============================================
// 3. Rate Limiting (BEFORE Auth to prevent abuse)
// ============================================
app.use("/api/*", rateLimitMiddleware());

// ============================================
// 4. Public Routes
// ============================================
app.get("/", (c) => {
    logger.info("Root endpoint accessed");
    return c.text("Selah API is running");
});

app.route("/health", health);

// ============================================
// 5. Protected Routes Middleware
// Any route starting with /api/* gets the Auth Guard
// ============================================
app.use("/api/*", authMiddleware);

// ============================================
// 6. Mount the Sub-Apps
// This keeps your URL structure clean: /api/devotions, /api/streaks, /api/chat
// ============================================
app.route("/api/devotions", devotions);
app.route("/api/streaks", streaks);
app.route("/api/chat", chat);

logger.info("Selah API initialized", {
    env: env.NODE_ENV,
    frontendUrl: env.FRONTEND_URL,
});

export default app;
