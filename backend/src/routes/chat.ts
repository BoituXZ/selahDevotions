import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { GoogleGenAI } from "@google/genai"; // The new SDK
import type { Variables } from "../index";

const chat = new Hono<{ Variables: Variables }>();

const chatSchema = z.object({
    message: z.string().min(1).max(1000),
});

chat.post("/", zValidator("json", chatSchema), async (c) => {
    const body = c.req.valid("json");

    // 1. Initialize Client with GLOBAL location
    const ai = new GoogleGenAI({
        vertexai: true,
        project: process.env.GOOGLE_CLOUD_PROJECT,
        location: "global", // Explicitly set to global as per your doc
    });

    const systemPrompt = `
    You are a warm, wise, and bible-literate companion named "Selah AI". 
    Your goal is to help the user process their thoughts through the lens of scripture.
    - Use the NIV or ESV translation.
    - Keep responses pastoral, gentle, and concise (under 150 words).
    - If the user is anxious, provide comforting Psalms.
    - If the user is happy, provide verses of praise.
    - Always end with a short, one-sentence prayer.
  `;

    try {
        // 2. Use the NEW Gemini 3 Preview Model
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview", // The new model you found
            contents: [
                {
                    role: "user",
                    parts: [
                        { text: systemPrompt },
                        { text: `User's message: ${body.message}` },
                    ],
                },
            ],
        });

        const replyText =
            response.candidates?.[0]?.content?.parts?.[0]?.text ||
            "I am silent.";
        return c.json({ reply: replyText });
    } catch (error: any) {
        console.error("Vertex AI Error:", JSON.stringify(error, null, 2));
        return c.json(
            { error: "Selah is having trouble connecting to the cloud." },
            500
        );
    }
});

export default chat;
