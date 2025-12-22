import { Shield, X } from "lucide-react";
import { useState } from "react";
import { api } from "../api";

interface EncryptionNoticeProps {
    onDismiss: () => void;
}

export default function EncryptionNotice({ onDismiss }: EncryptionNoticeProps) {
    const [dismissing, setDismissing] = useState(false);

    const handleDismiss = async () => {
        setDismissing(true);
        try {
            await api.post("/api/preferences/mark-encryption-notice-seen", {});
            onDismiss();
        } catch (error) {
            console.error("Failed to mark notice as seen:", error);
            // Still dismiss on error - user shouldn't be blocked
            onDismiss();
        }
    };

    return (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 mb-6 shadow-sm">
            <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-1">
                    <Shield className="w-8 h-8 text-green-600" />
                </div>

                <div className="flex-1">
                    <h3 className="text-lg font-serif font-semibold text-stone-800 mb-2">
                        Your Devotions Are Protected
                    </h3>

                    <div className="text-sm text-stone-600 space-y-2">
                        <p>
                            All your journal entries are  secured with{" "}
                            <strong> AES-256-GCM encryption</strong>.
                        </p>

                        <ul className="list-disc list-inside space-y-1 ml-2">
                            <li>Your thoughts are encrypted before storage</li>
                            <li>Each user has a unique encryption key</li>
                            <li>Only you can read your devotions</li>
                            <li>
                                Even our servers cannot access your plain-text
                                entries
                            </li>
                        </ul>

                        <p className="text-xs text-stone-500 mt-3 italic">
                            Your privacy matters. Your faith journey is between
                            you and God.
                        </p>
                    </div>
                </div>

                <button
                    onClick={handleDismiss}
                    disabled={dismissing}
                    className="flex-shrink-0 text-stone-400 hover:text-stone-600 transition"
                    aria-label="Dismiss notice"
                >
                    <X size={20} />
                </button>
            </div>
        </div>
    );
}
