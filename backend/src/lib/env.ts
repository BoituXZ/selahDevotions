import { z } from "zod";

// ============================================
// Schema Definition
// ============================================
const envSchema = z.object({
    // Google Cloud
    GOOGLE_CLOUD_PROJECT: z.string().min(1, "Google Cloud project ID required"),
    GOOGLE_CLOUD_LOCATION: z.string().default("global"),

    // Supabase
    SUPABASE_URL: z.string().url("Invalid Supabase URL"),
    SUPABASE_KEY: z.string().min(1, "Supabase key required"),

    // Frontend
    FRONTEND_URL: z.string().url("Invalid frontend URL"),

    // Optional
    NODE_ENV: z
        .enum(["development", "production", "test"])
        .default("development"),
    LOG_LEVEL: z
        .enum(["debug", "info", "warn", "error"])
        .default("info"),
    PORT: z
        .string()
        .regex(/^\d+$/)
        .transform(Number)
        .default("3000"),
});

export type Env = z.infer<typeof envSchema>;

// ============================================
// Validation Function
// ============================================
export function validateEnv(): Env {
    try {
        return envSchema.parse(process.env);
    } catch (error) {
        if (error instanceof z.ZodError) {
            console.error("❌ Environment validation failed:\n");

            error.errors.forEach((err) => {
                console.error(`  • ${err.path.join(".")}: ${err.message}`);
            });

            console.error("\n💡 Required environment variables:");
            console.error("  - GOOGLE_CLOUD_PROJECT");
            console.error("  - SUPABASE_URL");
            console.error("  - SUPABASE_KEY");
            console.error("  - FRONTEND_URL");

            console.error(
                "\n📝 Create a .env file in /backend with these values.\n"
            );

            process.exit(1);
        }
        throw error;
    }
}

// ============================================
// Typed Environment Access
// ============================================
export const env = validateEnv();
