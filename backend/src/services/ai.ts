import { GoogleGenAI } from "@google/genai";
import { env } from "../lib/env";
import { logger } from "../lib/logger";

// ============================================
// Constants
// ============================================
export const AI_CONFIG = {
    LOCATION: "global",
    MODEL: "gemini-2.0-flash-lite-001",
    MAX_TOKENS: 2048,
    TEMPERATURE: 0.7,
} as const;

export const SYSTEM_PROMPT = `
You are a warm, wise, and bible-literate companion named "Selah AI".
Your goal is to help the user process their thoughts through the lens of scripture.
- Use the NIV or NLT translation.
- Keep responses pastoral, gentle, and concise (under 150 words).
- If the user is anxious, provide comforting Psalms.
- If the user is happy, provide verses of praise.
- Always end with a short, one-sentence prayer.
`.trim();

// ============================================
// Custom Errors
// ============================================
export class AIServiceError extends Error {
    constructor(message: string, public cause?: Error) {
        super(message);
        this.name = "AIServiceError";
    }
}

export class AIQuotaExceededError extends Error {
    constructor() {
        super("AI service quota exceeded");
        this.name = "AIQuotaExceededError";
    }
}

// ============================================
// Service Class
// ============================================
class AIService {
    private client: GoogleGenAI | null = null;

    /**
     * Get or initialize the AI client (singleton pattern)
     */
    private getClient(): GoogleGenAI {
        if (!this.client) {
            logger.info("Initializing Google Vertex AI client", {
                project: env.GOOGLE_CLOUD_PROJECT,
                location: AI_CONFIG.LOCATION,
                model: AI_CONFIG.MODEL,
            });

            this.client = new GoogleGenAI({
                vertexai: true,
                project: env.GOOGLE_CLOUD_PROJECT,
                location: AI_CONFIG.LOCATION,
            });
        }

        return this.client;
    }

    /**
     * Generate a pastoral response to user message
     */
    async generateResponse(userMessage: string): Promise<string> {
        const client = this.getClient();

        try {
            logger.debug("Generating AI response", {
                messageLength: userMessage.length,
                model: AI_CONFIG.MODEL,
            });

            const response = await client.models.generateContent({
                model: AI_CONFIG.MODEL,
                contents: [
                    {
                        role: "user",
                        parts: [
                            { text: SYSTEM_PROMPT },
                            { text: `User's message: ${userMessage}` },
                        ],
                    },
                ],
                config: {
                    maxOutputTokens: AI_CONFIG.MAX_TOKENS,
                    temperature: AI_CONFIG.TEMPERATURE,
                },
            });

            const text = response.candidates?.[0]?.content?.parts?.[0]?.text;

            if (!text) {
                throw new Error("No response text from AI model");
            }

            logger.info("AI response generated successfully", {
                responseLength: text.length,
            });

            return text;
        } catch (error: any) {
            // Log error details for debugging
            logger.error("Vertex AI request failed", error, {
                model: AI_CONFIG.MODEL,
                messageLength: userMessage.length,
                errorCode: error.code,
                errorMessage: error.message,
            });

            // Check for quota errors
            if (
                error.code === 429 ||
                error.code === "429" ||
                error.message?.toLowerCase().includes("quota") ||
                error.message?.toLowerCase().includes("rate limit")
            ) {
                throw new AIQuotaExceededError();
            }

            // Re-throw with generic message
            throw new AIServiceError("Failed to generate response", error);
        }
    }

    /**
     * Health check - verify AI service is reachable
     */
    async healthCheck(): Promise<boolean> {
        try {
            const response = await this.generateResponse("Hello");
            return response.length > 0;
        } catch (error) {
            logger.warn("AI service health check failed", { error });
            return false;
        }
    }

    /**
     * Reset client (useful for testing)
     */
    resetClient(): void {
        this.client = null;
    }
}

// ============================================
// Singleton Export
// ============================================
export const aiService = new AIService();
