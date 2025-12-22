import { Component, type ReactNode, type ErrorInfo } from "react";
import { PostHogProvider } from "posthog-js/react";

interface Props {
    children: ReactNode;
    apiKey: string;
    options?: object;
}

interface State {
    hasError: boolean;
}

/**
 * Non-blocking PostHog wrapper that catches initialization failures
 * and renders children without analytics if PostHog fails to load.
 * This prevents third-party failures from causing blank screens.
 */
export class PostHogErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(): State {
        // Update state to render without PostHog
        return { hasError: true };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        // Log but don't crash the app
        console.warn("PostHog failed to initialize - analytics disabled", {
            error: error.message,
            componentStack: errorInfo.componentStack,
        });
    }

    render() {
        const { children, apiKey, options } = this.props;

        // If PostHog failed, render children without analytics
        if (this.state.hasError || !apiKey) {
            return <>{children}</>;
        }

        // Wrap in PostHogProvider with error handling
        try {
            return (
                <PostHogProvider apiKey={apiKey} options={options}>
                    {children}
                </PostHogProvider>
            );
        } catch {
            // Synchronous initialization error
            console.warn("PostHog synchronous initialization failed");
            return <>{children}</>;
        }
    }
}
