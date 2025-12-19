import { env } from "./env";

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogContext {
    [key: string]: any;
}

class Logger {
    private serviceName: string;
    private minLevel: LogLevel;

    constructor(serviceName: string = "selah-backend") {
        this.serviceName = serviceName;
        this.minLevel = (env.LOG_LEVEL as LogLevel) || "info";
    }

    private shouldLog(level: LogLevel): boolean {
        const levels: LogLevel[] = ["debug", "info", "warn", "error"];
        return levels.indexOf(level) >= levels.indexOf(this.minLevel);
    }

    private log(level: LogLevel, message: string, context?: LogContext) {
        if (!this.shouldLog(level)) return;

        const logEntry = {
            timestamp: new Date().toISOString(),
            level,
            service: this.serviceName,
            message,
            ...context,
        };

        // In development, pretty-print for better readability
        // In production, output JSON for log aggregation tools
        if (env.NODE_ENV === "development") {
            const emoji = {
                debug: "🔍",
                info: "ℹ️",
                warn: "⚠️",
                error: "❌",
            }[level];
            console.log(
                `${emoji} [${level.toUpperCase()}] ${message}`,
                context ? context : ""
            );
        } else {
            // Production: JSON logs for parsing by monitoring tools
            console.log(JSON.stringify(logEntry));
        }
    }

    debug(message: string, context?: LogContext) {
        this.log("debug", message, context);
    }

    info(message: string, context?: LogContext) {
        this.log("info", message, context);
    }

    warn(message: string, context?: LogContext) {
        this.log("warn", message, context);
    }

    error(message: string, error?: Error, context?: LogContext) {
        this.log("error", message, {
            ...context,
            error: error
                ? {
                      name: error.name,
                      message: error.message,
                      stack: error.stack,
                  }
                : undefined,
        });
    }

    // Request logging helper
    request(method: string, path: string, context?: LogContext) {
        this.info(`${method} ${path}`, context);
    }
}

export const logger = new Logger();
