import type { ErrorInfo } from "react";
import { supabase } from "../auth/supabase";

interface ErrorFallbackProps {
    error: Error | null;
    errorInfo: ErrorInfo | null;
    onReset: () => void;
    onClearCache: () => void;
    retryCount: number;
    maxRetries: number;
}

/**
 * User-friendly error UI component shown when ErrorBoundary catches an error
 * Provides recovery options instead of showing blank white screen
 */
export function ErrorFallback({
    error,
    errorInfo,
    onReset,
    onClearCache,
    retryCount,
    maxRetries,
}: ErrorFallbackProps) {
    const isDevelopment = import.meta.env.DEV;
    const timestamp = new Date().toISOString();

    const handleReturnToLogin = async () => {
        await supabase.auth.signOut();
        window.location.href = "/auth?mode=login";
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-[#FDFBF7] p-6">
            <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8 border border-stone-200">
                {/* Icon */}
                <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center">
                        <svg
                            className="w-8 h-8 text-stone-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                            />
                        </svg>
                    </div>
                </div>

                {/* Message */}
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-serif text-stone-800 mb-3">
                        We're experiencing technical difficulties
                    </h1>
                    <p className="text-stone-600 leading-relaxed">
                        Be still, and know that help is on the way. We've encountered an unexpected issue,
                        but you have several recovery options below.
                    </p>

                    {retryCount > 0 && retryCount < maxRetries && (
                        <p className="text-stone-500 text-sm mt-3">
                            Auto-retry attempt {retryCount} of {maxRetries}...
                        </p>
                    )}

                    {retryCount >= maxRetries && (
                        <p className="text-amber-600 text-sm mt-3 font-medium">
                            Auto-retry limit reached. Please try manual recovery options below.
                        </p>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                    <button
                        onClick={onReset}
                        className="flex-1 px-6 py-3 bg-stone-900 text-white rounded-lg hover:bg-stone-700 transition-colors font-medium"
                    >
                        Try Again
                    </button>
                    <button
                        onClick={onClearCache}
                        className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                        Clear Cache & Reload
                    </button>
                    <button
                        onClick={handleReturnToLogin}
                        className="flex-1 px-6 py-3 bg-stone-200 text-stone-800 rounded-lg hover:bg-stone-300 transition-colors font-medium"
                    >
                        Return to Login
                    </button>
                </div>

                {/* Development-only error details */}
                {isDevelopment && error && (
                    <details className="mt-6 p-4 bg-stone-50 rounded border border-stone-200">
                        <summary className="cursor-pointer text-stone-700 font-medium mb-2">
                            Error Details (Development Only)
                        </summary>
                        <div className="space-y-3 text-sm">
                            <div>
                                <p className="text-stone-600 font-medium">Error Message:</p>
                                <p className="text-red-600 font-mono break-all">{error.message}</p>
                            </div>
                            {error.stack && (
                                <div>
                                    <p className="text-stone-600 font-medium">Stack Trace:</p>
                                    <pre className="text-xs text-stone-700 overflow-auto p-2 bg-white rounded border border-stone-200 font-mono">
                                        {error.stack}
                                    </pre>
                                </div>
                            )}
                            {errorInfo?.componentStack && (
                                <div>
                                    <p className="text-stone-600 font-medium">Component Stack:</p>
                                    <pre className="text-xs text-stone-700 overflow-auto p-2 bg-white rounded border border-stone-200 font-mono">
                                        {errorInfo.componentStack}
                                    </pre>
                                </div>
                            )}
                            <div>
                                <p className="text-stone-600 font-medium">Timestamp:</p>
                                <p className="text-stone-700 font-mono">{timestamp}</p>
                            </div>
                        </div>
                    </details>
                )}

                {/* Help text */}
                <p className="text-center text-sm text-stone-500 mt-6">
                    If the problem persists, please contact support with the timestamp above.
                </p>
            </div>
        </div>
    );
}
