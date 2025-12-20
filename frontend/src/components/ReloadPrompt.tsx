import { useRegisterSW } from "virtual:pwa-register/react";

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

    const close = () => {
        setOfflineReady(false);
        setNeedRefresh(false);
    };

    return (
        <div>
            {(offlineReady || needRefresh) && (
                <div
                    className="fixed bottom-4 right-4 z-50 max-w-md rounded-lg border border-gray-200 bg-white p-4 shadow-lg"
                    role="alert"
                >
                    <div className="flex items-start gap-3">
                        <div className="flex-1">
                            {offlineReady ? (
                                <p className="text-sm font-medium text-gray-900">
                                    App ready to work offline
                                </p>
                            ) : (
                                <p className="text-sm font-medium text-gray-900">
                                    New content available, click reload to update.
                                </p>
                            )}
                        </div>
                        <button
                            onClick={close}
                            className="text-gray-400 hover:text-gray-600"
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
                    <div className="mt-3 flex gap-2">
                        {needRefresh && (
                            <button
                                onClick={() => updateServiceWorker(true)}
                                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            >
                                Reload
                            </button>
                        )}
                        <button
                            onClick={close}
                            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
