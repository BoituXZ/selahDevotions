import { createMiddleware } from "hono/factory";
import type { Context } from "hono";
import {
    createRateLimitStore,
    type RateLimitConfig,
    type RateLimitStore,
} from "../lib/rate-limit-store";
import { logger } from "../lib/logger";

const LOAVES_AND_FISHES_MESSAGE = {
    error: "We have run out of fish and bread. Please return later for more sustenance.",
    retryAfter: 0, // Will be set dynamically
};

/**
 * Rate limiting middleware with "Loaves & Fishes" theme
 * Implements sliding window rate limiting to protect Vertex AI quota
 */
export function rateLimitMiddleware(config?: Partial<RateLimitConfig>) {
    const finalConfig: RateLimitConfig = {
        maxRequests: config?.maxRequests ?? 10,
        windowMs: config?.windowMs ?? 3 * 60 * 60 * 1000, // 3 hours default
        keyGenerator: config?.keyGenerator ?? defaultKeyGenerator,
    };

    const store: RateLimitStore = createRateLimitStore(
        "memory",
        finalConfig.windowMs
    );

    logger.info("Rate limiting middleware initialized", {
        maxRequests: finalConfig.maxRequests,
        windowHours: finalConfig.windowMs / (60 * 60 * 1000),
    });

    return createMiddleware(async (c, next) => {
        const key = finalConfig.keyGenerator!(c);
        const { count, resetAt } = await store.increment(key);

        // Set rate limit headers (informational)
        c.header("X-RateLimit-Limit", String(finalConfig.maxRequests));
        c.header(
            "X-RateLimit-Remaining",
            String(Math.max(0, finalConfig.maxRequests - count))
        );
        c.header("X-RateLimit-Reset", String(Math.floor(resetAt / 1000)));

        if (count > finalConfig.maxRequests) {
            const retryAfterSeconds = Math.ceil((resetAt - Date.now()) / 1000);
            c.header("Retry-After", String(retryAfterSeconds));

            logger.warn("Rate limit exceeded", {
                key,
                count,
                limit: finalConfig.maxRequests,
                retryAfterSeconds,
            });

            return c.json(
                {
                    ...LOAVES_AND_FISHES_MESSAGE,
                    retryAfter: retryAfterSeconds,
                },
                429
            );
        }

        logger.debug("Rate limit check passed", {
            key,
            count,
            remaining: finalConfig.maxRequests - count,
        });

        await next();
    });
}

/**
 * Default key generator - prioritizes user ID over IP address
 */
function defaultKeyGenerator(c: Context): string {
    // Priority: User ID > IP address
    const user = c.get("user");
    if (user?.id) {
        return `user:${user.id}`;
    }

    // Extract IP from various headers (Cloudflare, proxy-aware)
    const cfConnecting = c.req.header("cf-connecting-ip");
    const realIp = c.req.header("x-real-ip");
    const forwarded = c.req.header("x-forwarded-for");

    const ip =
        cfConnecting || realIp || forwarded?.split(",")[0].trim() || "unknown";

    return `ip:${ip}`;
}
