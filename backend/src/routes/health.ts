import { Hono } from "hono";
import { aiService } from "../services/ai";
import { supabase } from "../lib/supabase";
import { logger } from "../lib/logger";

const health = new Hono();

interface HealthStatus {
    status: "ok" | "degraded" | "down";
    version: string;
    timestamp: string;
    checks: {
        database: "ok" | "error";
        ai: "ok" | "error";
    };
}

health.get("/", async (c) => {
    const startTime = Date.now();
    const checks = {
        database: "ok" as "ok" | "error",
        ai: "ok" as "ok" | "error",
    };

    // Check Supabase connection
    try {
        const { error } = await supabase
            .from("devotions")
            .select("id")
            .limit(1);
        if (error) throw error;
        logger.debug("Health check: Database OK");
    } catch (error) {
        checks.database = "error";
        logger.warn("Health check: Database failed", { error });
    }

    // Check AI service (with timeout)
    try {
        const aiHealthPromise = aiService.healthCheck();
        const timeoutPromise = new Promise<boolean>((_, reject) =>
            setTimeout(() => reject(new Error("timeout")), 3000)
        );

        const isHealthy = await Promise.race([
            aiHealthPromise,
            timeoutPromise,
        ]);
        if (!isHealthy) {
            checks.ai = "error";
            logger.warn("Health check: AI service returned false");
        } else {
            logger.debug("Health check: AI OK");
        }
    } catch (error) {
        checks.ai = "error";
        logger.warn("Health check: AI service failed", { error });
    }

    const status: HealthStatus["status"] =
        checks.database === "error" || checks.ai === "error"
            ? "degraded"
            : "ok";

    const response: HealthStatus = {
        status,
        version: "1.0.0",
        timestamp: new Date().toISOString(),
        checks,
    };

    const responseTime = Date.now() - startTime;
    c.header("X-Response-Time", `${responseTime}ms`);

    logger.info("Health check completed", {
        status,
        responseTime,
        checks,
    });

    // Return 200 for "ok", 503 for degraded/down
    return c.json(response, status === "ok" ? 200 : 503);
});

export default health;
