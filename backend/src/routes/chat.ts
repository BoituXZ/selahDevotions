import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { aiService, AIQuotaExceededError } from "../services/ai";
import { logger } from "../lib/logger";
import { rateLimitMiddleware } from "../middleware/rate-limit";
import type { Variables } from "../index";

const chat = new Hono<{ Variables: Variables }>();

const chatSchema = z.object({
    message: z.string().min(1).max(1000),
});

// Apply rate limiting ONLY to chat endpoint
chat.use("/", rateLimitMiddleware());

chat.post("/", zValidator("json", chatSchema), async (c) => {
    const body = c.req.valid("json");
    const user = c.get("user");

    logger.request("POST", "/api/chat", {
        userId: user?.id,
        messageLength: body.message.length,
    });

    try {
        const reply = await aiService.generateResponse(body.message);

        logger.info("Chat response sent successfully", {
            userId: user?.id,
            replyLength: reply.length,
        });

        return c.json({ reply });
    } catch (error: any) {
        // Handle quota exhaustion with special message
        if (error instanceof AIQuotaExceededError) {
            logger.warn("AI quota exceeded", {
                userId: user?.id,
            });

            return c.json(
                {
                    error: "We have run out of fish and bread. Please return later for more sustenance.",
                },
                503
            );
        }

        // Generic error
        logger.error("Chat request failed", error, {
            userId: user?.id,
        });

        return c.json(
            {
                error: "Selah is having trouble connecting to the cloud.",
            },
            500
        );
    }
});

export default chat;
