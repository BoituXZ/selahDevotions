import { test, expect, describe } from "bun:test";
import app from "../../src/index";
import { env } from "../../src/lib/env";

describe("Security Headers", () => {
    test("sets X-Frame-Options header", async () => {
        const res = await app.request(new Request("http://localhost/"));

        expect(res.headers.get("X-Frame-Options")).toBe("DENY");
    });

    test("sets X-Content-Type-Options header", async () => {
        const res = await app.request(new Request("http://localhost/"));

        expect(res.headers.get("X-Content-Type-Options")).toBe("nosniff");
    });

    test("sets X-XSS-Protection header", async () => {
        const res = await app.request(new Request("http://localhost/"));

        expect(res.headers.get("X-XSS-Protection")).toBe("1; mode=block");
    });

    test("sets Strict-Transport-Security header", async () => {
        const res = await app.request(new Request("http://localhost/"));
        const hsts = res.headers.get("Strict-Transport-Security");

        expect(hsts).toContain("max-age=31536000");
        expect(hsts).toContain("includeSubDomains");
        expect(hsts).toContain("preload");
    });

    test("sets Content-Security-Policy header", async () => {
        const res = await app.request(new Request("http://localhost/"));
        const csp = res.headers.get("Content-Security-Policy");

        expect(csp).toContain("default-src 'self'");
        expect(csp).toContain("object-src 'none'");
    });
});

describe("CORS", () => {
    test("allows requests from FRONTEND_URL", async () => {
        const req = new Request("http://localhost/", {
            method: "OPTIONS",
            headers: { Origin: env.FRONTEND_URL },
        });

        const res = await app.request(req);
        expect(res.headers.get("Access-Control-Allow-Origin")).toBe(
            env.FRONTEND_URL
        );
    });

    test("allows localhost origins in development", async () => {
        if (env.NODE_ENV === "development") {
            const req = new Request("http://localhost/", {
                method: "OPTIONS",
                headers: { Origin: "http://localhost:5173" },
            });

            const res = await app.request(req);
            const allowedOrigin = res.headers.get(
                "Access-Control-Allow-Origin"
            );

            expect(allowedOrigin).toBeTruthy();
        }
    });

    test("exposes rate limit headers", async () => {
        const req = new Request("http://localhost/", {
            method: "OPTIONS",
            headers: { Origin: env.FRONTEND_URL },
        });

        const res = await app.request(req);
        const exposedHeaders = res.headers.get(
            "Access-Control-Expose-Headers"
        );

        expect(exposedHeaders).toContain("X-RateLimit-Limit");
        expect(exposedHeaders).toContain("X-RateLimit-Remaining");
        expect(exposedHeaders).toContain("X-RateLimit-Reset");
    });
});
