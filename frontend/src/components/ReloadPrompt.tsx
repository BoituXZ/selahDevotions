import { useRegisterSW } from "virtual:pwa-register/react";
import { useEffect, useState } from "react";

const MAX_DISMISSALS = 3;
const AUTO_RELOAD_DELAY = 10; // seconds

export function ReloadPrompt() {
    const {
        offlineReady: [offlineReady, setOfflineReady],
        needRefresh: [needRefresh, setNeedRefresh],
        updateServiceWorker,
    } = useRegisterSW({
        onRegistered(r: ServiceWorkerRegistration | undefined) {
            console.log("SW Registered: " + r);
        },
        onRegisterError(error: unknown) {
            console.log("SW registration error", error);
        },
    });

    const [countdown, setCountdown] = useState(AUTO_RELOAD_DELAY);
    const [dismissalCount, setDismissalCount] = useState(() => {
        const stored = localStorage.getItem("sw_dismissal_count");
        return stored ? parseInt(stored, 10) : 0;
    });

    // Auto-reload countdown when update is needed
    useEffect(() => {
        if (!needRefresh) return;

        // If max dismissals reached, force reload immediately
        if (dismissalCount >= MAX_DISMISSALS) {
            console.log("Max dismissals reached, forcing reload...");
            updateServiceWorker(true);
            return;
        }

        // Start countdown
        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    console.log("Auto-reload countdown reached zero");
                    updateServiceWorker(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [needRefresh, dismissalCount, updateServiceWorker]);

    const handleUpdateNow = () => {
        // Reset dismissal count on manual update
        localStorage.setItem("sw_dismissal_count", "0");
        updateServiceWorker(true);
    };

    const handleNotNow = () => {
        const newCount = dismissalCount + 1;
        setDismissalCount(newCount);
        localStorage.setItem("sw_dismissal_count", newCount.toString());

        setOfflineReady(false);
        setNeedRefresh(false);

        console.log(`Update dismissed (${newCount}/${MAX_DISMISSALS})`);
    };

    const handleCloseOfflineReady = () => {
        setOfflineReady(false);
    };

    return (
        <div>
            {/* Offline Ready Notification - can be dismissed */}
            {offlineReady && !needRefresh && (
                <div
                    className="fixed bottom-4 right-4 z-50 max-w-md rounded-lg border border-green-200 bg-green-50 p-4 shadow-lg"
                    role="alert"
                >
                    <div className="flex items-start gap-3">
                        <div className="flex-1">
                            <p className="text-sm font-medium text-green-900">
                                App ready to work offline
                            </p>
                        </div>
                        <button
                            onClick={handleCloseOfflineReady}
                            className="text-green-400 hover:text-green-600"
                            aria-label="Close"
                        >
                            <svg
                                className="h-5 w-5"
                                fill="none"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>
                </div>
            )}

            {/* Update Required Notification - with countdown */}
            {needRefresh && (
                <div
                    className="fixed bottom-4 right-4 z-50 max-w-md rounded-lg border-2 border-blue-500 bg-white p-4 shadow-xl"
                    role="alert"
                >
                    <div className="mb-3">
                        <p className="text-sm font-semibold text-gray-900 mb-1">
                            New version available!
                        </p>
                        <p className="text-sm text-gray-600">
                            {dismissalCount >= MAX_DISMISSALS ? (
                                <span className="text-amber-600 font-medium">
                                    Update required - reloading now...
                                </span>
                            ) : (
                                <>
                                    Click "Update Now" to get the latest features.
                                    {dismissalCount > 0 && (
                                        <span className="text-amber-600 font-medium ml-1">
                                            ({MAX_DISMISSALS - dismissalCount} dismissals remaining)
                                        </span>
                                    )}
                                </>
                            )}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                            Auto-updating in {countdown} seconds...
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={handleUpdateNow}
                            className="flex-1 rounded-md bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                        >
                            Update Now
                        </button>
                        {dismissalCount < MAX_DISMISSALS && (
                            <button
                                onClick={handleNotNow}
                                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                            >
                                Not Now
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
