import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";
import { ErrorFallback } from "./ErrorFallback";

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
    retryCount: number;
}

/**
 * Error Boundary component to catch React component errors
 * Prevents white screen by showing fallback UI and recovery options
 */
export class ErrorBoundary extends Component<Props, State> {
    private static readonly MAX_RETRIES = 3;
    private static readonly RETRY_DELAYS = [1000, 2000, 4000]; // Exponential backoff

    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
            retryCount: 0,
        };
    }

    static getDerivedStateFromError(error: Error): Partial<State> {
        // Update state so the next render will show the fallback UI
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        // Log error details
        console.error("ErrorBoundary caught an error:", error, errorInfo);

        // Update state with error info
        this.setState({
            error,
            errorInfo,
        });

        // Log to PostHog if available
        if (window.posthog) {
            window.posthog.capture("error_boundary_triggered", {
                error: error.message,
                stack: error.stack,
                componentStack: errorInfo.componentStack,
                retryCount: this.state.retryCount,
            });
        }

        // Auto-retry with exponential backoff (max 3 attempts)
        if (this.state.retryCount < ErrorBoundary.MAX_RETRIES) {
            const delay = ErrorBoundary.RETRY_DELAYS[this.state.retryCount] || 4000;
            console.log(`Auto-retrying in ${delay}ms (attempt ${this.state.retryCount + 1}/${ErrorBoundary.MAX_RETRIES})`);

            setTimeout(() => {
                this.setState((prevState) => ({
                    hasError: false,
                    error: null,
                    errorInfo: null,
                    retryCount: prevState.retryCount + 1,
                }));
            }, delay);
        }
    }

    handleReset = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
            retryCount: 0,
        });
    };

    handleClearCacheAndReload = async () => {
        console.log("Clearing cache and reloading...");

        try {
            // Unregister all service workers
            const registrations = await navigator.serviceWorker?.getRegistrations();
            if (registrations) {
                await Promise.all(registrations.map((registration) => registration.unregister()));
            }

            // Clear all caches
            const cacheNames = await caches.keys();
            await Promise.all(cacheNames.map((name) => caches.delete(name)));

            // Reload the page
            window.location.reload();
        } catch (err) {
            console.error("Failed to clear cache:", err);
            // Just reload anyway
            window.location.reload();
        }
    };

    render() {
        if (this.state.hasError) {
            // If custom fallback provided, use it
            if (this.props.fallback) {
                return this.props.fallback;
            }

            // Otherwise use default ErrorFallback component
            return (
                <ErrorFallback
                    error={this.state.error}
                    errorInfo={this.state.errorInfo}
                    onReset={this.handleReset}
                    onClearCache={this.handleClearCacheAndReload}
                    retryCount={this.state.retryCount}
                    maxRetries={ErrorBoundary.MAX_RETRIES}
                />
            );
        }

        return this.props.children;
    }
}
