import { logger } from "./logger";

// ============================================
// Interfaces
// ============================================
export interface RateLimitStore {
    increment(key: string): Promise<{ count: number; resetAt: number }>;
    reset(key: string): Promise<void>;
    cleanup(): void;
}

export interface RateLimitConfig {
    maxRequests: number;
    windowMs: number;
    keyGenerator?: (c: any) => string;
}

// ============================================
// In-Memory Implementation (Default)
// ============================================
class InMemoryRateLimitStore implements RateLimitStore {
    private store: Map<string, { count: number; resetAt: number }> = new Map();
    private cleanupInterval: Timer;
    private windowMs: number;

    constructor(windowMs: number) {
        this.windowMs = windowMs;

        // Cleanup expired entries every 10 minutes
        this.cleanupInterval = setInterval(() => {
            this.cleanup();
        }, 600000); // 10 minutes

        logger.debug("InMemoryRateLimitStore initialized", {
            windowMs,
            cleanupIntervalMs: 600000,
        });
    }

    async increment(key: string): Promise<{ count: number; resetAt: number }> {
        const now = Date.now();
        const entry = this.store.get(key);

        if (!entry || now > entry.resetAt) {
            // New window or expired
            const newEntry = { count: 1, resetAt: now + this.windowMs };
            this.store.set(key, newEntry);

            logger.debug("Rate limit: New window started", {
                key,
                resetAt: new Date(newEntry.resetAt).toISOString(),
            });

            return newEntry;
        }

        // Within window - increment
        entry.count++;
        this.store.set(key, entry);

        logger.debug("Rate limit: Request counted", {
            key,
            count: entry.count,
            resetAt: new Date(entry.resetAt).toISOString(),
        });

        return entry;
    }

    async reset(key: string): Promise<void> {
        this.store.delete(key);
        logger.debug("Rate limit: Key reset", { key });
    }

    cleanup(): void {
        const now = Date.now();
        let cleanedCount = 0;

        for (const [key, entry] of this.store.entries()) {
            if (now > entry.resetAt) {
                this.store.delete(key);
                cleanedCount++;
            }
        }

        if (cleanedCount > 0) {
            logger.debug("Rate limit: Cleanup completed", {
                cleanedEntries: cleanedCount,
                remainingEntries: this.store.size,
            });
        }
    }

    destroy(): void {
        clearInterval(this.cleanupInterval);
        this.store.clear();
        logger.info("InMemoryRateLimitStore destroyed");
    }
}

// ============================================
// Redis Implementation (Future)
// ============================================
class RedisRateLimitStore implements RateLimitStore {
    constructor(_windowMs: number) {
        throw new Error(
            "Redis rate limiting not yet implemented. Use 'memory' type for now."
        );
    }

    async increment(_key: string): Promise<{ count: number; resetAt: number }> {
        throw new Error("Not implemented");
    }

    async reset(_key: string): Promise<void> {
        throw new Error("Not implemented");
    }

    cleanup(): void {
        // No-op for Redis (TTL handles cleanup)
    }
}

// ============================================
// Factory Function
// ============================================
export function createRateLimitStore(
    type: "memory" | "redis",
    windowMs: number
): RateLimitStore {
    logger.info("Creating rate limit store", { type, windowMs });

    if (type === "redis") {
        return new RedisRateLimitStore(windowMs);
    }

    return new InMemoryRateLimitStore(windowMs);
}
