import { test, expect, describe, beforeEach } from "bun:test";
import { Hono } from "hono";
import { rateLimitMiddleware } from "../../src/middleware/rate-limit";

describe("Rate Limiting Middleware", () => {
    let app: Hono;

    beforeEach(() => {
        app = new Hono();
        // Use very short window for testing
        app.use(
            "/*",
            rateLimitMiddleware({
                maxRequests: 3,
                windowMs: 1000, // 1 second
            })
        );
        app.get("/test", (c) => c.json({ ok: true }));
    });

    test("allows requests under limit", async () => {
        const req1 = new Request("http://localhost/test");
        const res1 = await app.request(req1);
        expect(res1.status).toBe(200);

        const req2 = new Request("http://localhost/test");
        const res2 = await app.request(req2);
        expect(res2.status).toBe(200);
    });

    test("blocks requests over limit", async () => {
        // Exhaust limit
        for (let i = 0; i < 3; i++) {
            await app.request(new Request("http://localhost/test"));
        }

        // This should fail with 429
        const blocked = await app.request(new Request("http://localhost/test"));
        expect(blocked.status).toBe(429);

        const body = await blocked.json();
        expect(body.error).toContain("fish and bread");
    });

    test("resets after window expires", async () => {
        // Exhaust limit
        for (let i = 0; i < 3; i++) {
            await app.request(new Request("http://localhost/test"));
        }

        // Wait for window to expire
        await Bun.sleep(1100);

        const res = await app.request(new Request("http://localhost/test"));
        expect(res.status).toBe(200);
    });

    test("sets correct rate limit headers", async () => {
        const res = await app.request(new Request("http://localhost/test"));

        expect(res.headers.get("X-RateLimit-Limit")).toBe("3");
        expect(res.headers.get("X-RateLimit-Remaining")).toBe("2");
        expect(res.headers.get("X-RateLimit-Reset")).toBeTruthy();
    });

    test("includes retryAfter in error response", async () => {
        // Exhaust limit
        for (let i = 0; i < 3; i++) {
            await app.request(new Request("http://localhost/test"));
        }

        const blocked = await app.request(new Request("http://localhost/test"));
        const body = await blocked.json();

        expect(body).toHaveProperty("retryAfter");
        expect(typeof body.retryAfter).toBe("number");
        expect(body.retryAfter).toBeGreaterThan(0);
    });

    test("sets Retry-After header when rate limited", async () => {
        // Exhaust limit
        for (let i = 0; i < 3; i++) {
            await app.request(new Request("http://localhost/test"));
        }

        const blocked = await app.request(new Request("http://localhost/test"));
        expect(blocked.headers.get("Retry-After")).toBeTruthy();
    });
});
