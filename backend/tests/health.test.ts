import { test, expect, describe } from "bun:test";
import app from "../src/index";

describe("Health Endpoint", () => {
    test("returns health status", async () => {
        const res = await app.request(new Request("http://localhost/health"));

        expect(res.status).toBeOneOf([200, 503]);

        const body = await res.json();
        expect(body).toHaveProperty("status");
        expect(body).toHaveProperty("version");
        expect(body).toHaveProperty("timestamp");
        expect(body).toHaveProperty("checks");
        expect(body.checks).toHaveProperty("database");
        expect(body.checks).toHaveProperty("ai");
    });

    test("includes response time header", async () => {
        const res = await app.request(new Request("http://localhost/health"));

        expect(res.headers.get("X-Response-Time")).toMatch(/\d+ms/);
    });

    test("has correct status values", async () => {
        const res = await app.request(new Request("http://localhost/health"));
        const body = await res.json();

        expect(["ok", "degraded", "down"]).toContain(body.status);
        expect(["ok", "error"]).toContain(body.checks.database);
        expect(["ok", "error"]).toContain(body.checks.ai);
    });

    test("returns 503 if degraded", async () => {
        const res = await app.request(new Request("http://localhost/health"));
        const body = await res.json();

        if (body.status === "degraded") {
            expect(res.status).toBe(503);
        }
    });
});
