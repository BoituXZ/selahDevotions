import { useState } from "react";
import { X, Copy, Check, Globe, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

interface ShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    shareUrl: string;
    onRevoke: () => void;
    isRevoking: boolean;
    isNewShare?: boolean;
}

export default function ShareModal({
    isOpen,
    onClose,
    shareUrl,
    onRevoke,
    isRevoking,
    isNewShare = false,
}: ShareModalProps) {
    const [copied, setCopied] = useState(false);

    if (!isOpen) return null;

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            toast.success("Share link copied to clipboard!");
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            toast.error("Failed to copy link");
        }
    };

    const handleRevoke = () => {
        if (
            window.confirm(
                "Are you sure you want to revoke this share link? Anyone with the link will no longer be able to access this devotion.",
            )
        ) {
            onRevoke();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 dark:bg-stone-950/70 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-stone-900 w-full max-w-lg rounded-2xl shadow-2xl flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-stone-100 dark:border-stone-800">
                    <div className="flex items-center gap-2">
                        <Globe className="w-5 h-5 text-stone-600 dark:text-stone-400" />
                        <h2 className="text-xl font-semibold text-stone-900 dark:text-stone-50">
                            Share Devotion
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-4">
                    {isNewShare && (
                        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
                                <div className="text-sm text-amber-900 dark:text-amber-100">
                                    <p className="font-medium mb-1">
                                        Copy this link now
                                    </p>
                                    <p className="text-amber-800 dark:text-amber-200">
                                        This is your only chance to view the
                                        complete link with the encryption key.
                                        If you close this without copying,
                                        you'll need to revoke and create a new
                                        one.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                            Share Link
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                readOnly
                                value={shareUrl}
                                className="flex-1 px-4 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-sm text-stone-900 dark:text-stone-100 font-mono"
                                onClick={(e) => e.currentTarget.select()}
                            />
                            <button
                                onClick={handleCopy}
                                className="px-4 py-2 bg-stone-900 dark:bg-stone-50 text-white dark:text-stone-900 rounded-lg hover:bg-stone-800 dark:hover:bg-stone-200 transition-colors flex items-center gap-2"
                            >
                                {copied ? (
                                    <>
                                        <Check className="w-4 h-4" />
                                        <span className="hidden sm:inline">
                                            Copied
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <Copy className="w-4 h-4" />
                                        <span className="hidden sm:inline">
                                            Copy
                                        </span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="text-xs text-stone-500 dark:text-stone-400 space-y-1">
                        <p>• Anyone with this link can view this devotion</p>
                        <p>• The link will remain active until you revoke it</p>
                        <p>
                            • Viewers will see your name as the author, but
                            won't have access to your account
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between gap-3 p-6 border-t border-stone-100 dark:border-stone-800">
                    <button
                        onClick={handleRevoke}
                        disabled={isRevoking}
                        className="px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors disabled:opacity-50"
                    >
                        {isRevoking ? "Revoking..." : "Revoke Share Link"}
                    </button>
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-stone-900 dark:bg-stone-50 text-white dark:text-stone-900 rounded-lg hover:bg-stone-800 dark:hover:bg-stone-200 transition-colors"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
}
