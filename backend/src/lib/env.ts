import { z } from "zod";
import dotenv from "dotenv";

// Load .env file (if local)
dotenv.config();

const envSchema = z.object({
    NODE_ENV: z
        .enum(["development", "production", "test"])
        .default("development"),
    PORT: z.string().default("8080"),

    // App Secrets (Required)
    SUPABASE_URL: z.string().min(1, "Supabase URL is required"),
    SUPABASE_KEY: z.string().min(1, "Supabase Key is required"),
    SUPABASE_SERVICE_ROLE_KEY: z
        .string()
        .min(1, "Supabase Service Role Key is required"),

    // Google AI Studio (Required)
    GEMINI_API_KEY: z
        .string()
        .min(
            1,
            "Gemini API key is required. Get it from https://aistudio.google.com/app/apikey"
        ),

    // Optional / Defaults
    FRONTEND_URL: z.string().default("*"),
    LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),

    // Encryption Configuration (Required for production)
    ENCRYPTION_MASTER_KEY: z
        .string()
        .min(32, "Master key must be at least 32 characters"),
    ENCRYPTION_SALT: z.string().optional(),
});

// Validate
const _env = envSchema.safeParse(process.env);

if (!_env.success) {
    console.error("❌ INVALID ENVIRONMENT VARIABLES:");
    console.error(JSON.stringify(_env.error.format(), null, 2));
    throw new Error(
        "Environment validation failed. Check logs for missing keys."
    );
}

export const env = _env.data;
