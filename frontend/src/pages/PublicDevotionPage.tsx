import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
    BookOpen,
    Calendar,
    Smile,
    Lock,
    Home,
    AlertCircle,
} from "lucide-react";

import type { SharedDevotion } from "../types/types";
import {
    decryptSharedContent,
    extractShareKeyFromUrl,
} from "../lib/clientEncryption";
import SelahLogo from "../components/SelahLogo";

export default function PublicDevotionPage() {
    const { token } = useParams<{ token: string }>();
    const [devotion, setDevotion] = useState<SharedDevotion | null>(null);
    const [decryptedContent, setDecryptedContent] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [decrypting, setDecrypting] = useState(false);

    useEffect(() => {
        const fetchAndDecrypt = async () => {
            if (!token) {
                setError("Invalid share link");
                setLoading(false);
                return;
            }

            try {
                // Fetch encrypted devotion from public API
                const response = await fetch(
                    `${import.meta.env.VITE_API_URL}/public/devotions/${token}`,
                );

                if (!response.ok) {
                    if (response.status === 404) {
                        setError(
                            "This devotion is no longer shared or doesn't exist",
                        );
                    } else {
                        setError("Failed to load devotion");
                    }
                    setLoading(false);
                    return;
                }

                const data: SharedDevotion = await response.json();
                setDevotion(data);
                setLoading(false);

                // Extract decryption key from URL hash
                setDecrypting(true);
                const shareKey = extractShareKeyFromUrl();

                if (!shareKey) {
                    setError(
                        "Decryption key not found in URL. Make sure you're using the complete share link.",
                    );
                    setDecrypting(false);
                    return;
                }

                // Decrypt content client-side
                try {
                    const plainContent = await decryptSharedContent(
                        data.encrypted_shared_content,
                        shareKey,
                    );
                    setDecryptedContent(plainContent);
                } catch (decryptError) {
                    console.error("Decryption failed:", decryptError);
                    setError(
                        "Failed to decrypt content. The share link may be invalid or corrupted.",
                    );
                } finally {
                    setDecrypting(false);
                }
            } catch (err) {
                console.error("Error fetching devotion:", err);
                setError("An error occurred while loading the devotion");
                setLoading(false);
                setDecrypting(false);
            }
        };

        fetchAndDecrypt();
    }, [token]);

    if (loading) {
        return (
            <div className="min-h-screen bg-stone-50 dark:bg-stone-950 flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="w-12 h-12 border-4 border-stone-300 dark:border-stone-700 border-t-stone-700 dark:border-t-stone-300 rounded-full animate-spin mx-auto" />
                    <p className="text-stone-600 dark:text-stone-400">
                        Loading devotion...
                    </p>
                </div>
            </div>
        );
    }

    if (error || !devotion) {
        return (
            <div className="min-h-screen bg-stone-50 dark:bg-stone-950 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white dark:bg-stone-900 rounded-2xl shadow-xl p-8 text-center space-y-6">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-950/30 rounded-full flex items-center justify-center mx-auto">
                        <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-2xl font-semibold text-stone-900 dark:text-stone-50">
                            Unable to Load Devotion
                        </h1>
                        <p className="text-stone-600 dark:text-stone-400">
                            {error}
                        </p>
                    </div>
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-stone-900 dark:bg-stone-50 text-white dark:text-stone-900 rounded-lg hover:bg-stone-800 dark:hover:bg-stone-200 transition-colors"
                    >
                        <Home className="w-4 h-4" />
                        Go to Homepage
                    </Link>
                </div>
            </div>
        );
    }

    if (decrypting) {
        return (
            <div className="min-h-screen bg-stone-50 dark:bg-stone-950 flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="w-12 h-12 border-4 border-stone-300 dark:border-stone-700 border-t-stone-700 dark:border-t-stone-300 rounded-full animate-spin mx-auto" />
                    <div className="flex items-center gap-2 text-stone-600 dark:text-stone-400">
                        <Lock className="w-4 h-4" />
                        <p>Decrypting content...</p>
                    </div>
                </div>
            </div>
        );
    }

    // Deterministic color based on ID (same as DevotionCard)
    const colors = ["#A3B18A", "#D4C5A9", "#9CA3AF", "#B5C0D0"];
    const colorIndex =
        parseInt(devotion.id.substring(0, 8), 16) % colors.length;
    const accentColor = colors[colorIndex];

    return (
        <div className="min-h-screen bg-stone-50 dark:bg-stone-950">
            {/* Header */}
            <header className="bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800">
                <div className="max-w-4xl mx-auto px-4 py-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <SelahLogo />
                        <span className="text-xl font-semibold text-stone-900 dark:text-stone-50">
                            Selah
                        </span>
                    </div>
                    <Link
                        to="/"
                        className="text-sm text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
                    >
                        Create your own
                    </Link>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-4xl mx-auto px-4 py-8 md:py-12">
                <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-xl overflow-hidden">
                    {/* Color accent */}
                    <div
                        className="h-2 w-full"
                        style={{ backgroundColor: accentColor }}
                    />

                    <div className="p-6 md:p-10 space-y-8">
                        {/* Metadata */}
                        <div className="flex flex-wrap items-center gap-4 pb-6 border-b border-stone-100 dark:border-stone-800">
                            <div className="flex items-center gap-2 text-stone-600 dark:text-stone-400">
                                <Calendar className="w-4 h-4" />
                                <span className="text-sm">
                                    {new Date(
                                        devotion.created_at,
                                    ).toLocaleDateString("en-US", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                    })}
                                </span>
                            </div>

                            {devotion.mood && (
                                <div className="flex items-center gap-2 text-stone-600 dark:text-stone-400">
                                    <Smile className="w-4 h-4" />
                                    <span className="text-sm capitalize">
                                        {devotion.mood}
                                    </span>
                                </div>
                            )}

                            {devotion.scripture_ref && (
                                <div className="flex items-center gap-2 text-stone-600 dark:text-stone-400">
                                    <BookOpen className="w-4 h-4" />
                                    <span className="text-sm">
                                        {devotion.scripture_ref}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Content */}
                        <div className="prose prose-stone dark:prose-invert max-w-none">
                            <div
                                className="text-lg leading-relaxed font-serif text-stone-800 dark:text-stone-200"
                                dangerouslySetInnerHTML={{
                                    __html: decryptedContent,
                                }}
                            />
                        </div>

                        {/* Author */}
                        <div className="pt-6 border-t border-stone-100 dark:border-stone-800">
                            <p className="text-sm text-stone-500 dark:text-stone-400">
                                Shared by{" "}
                                <span className="font-medium text-stone-700 dark:text-stone-300">
                                    {devotion.author.full_name}
                                </span>
                            </p>
                        </div>

                        {/* Encrypted badge */}
                        <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                            <div className="flex items-center gap-3">
                                <Lock className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
                                <p className="text-sm text-blue-900 dark:text-blue-100">
                                    This devotion was securely shared using
                                    end-to-end encryption. The content was
                                    decrypted in your browser using the key
                                    provided in the share link.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* CTA Section */}
                <div className="mt-8 bg-gradient-to-br from-stone-100 to-stone-200 dark:from-stone-800 dark:to-stone-900 rounded-2xl p-8 md:p-12 text-center space-y-6">
                    <div className="space-y-3">
                        <h2 className="text-2xl md:text-3xl font-semibold text-stone-900 dark:text-stone-50">
                            Create Your Own Spiritual Journey
                        </h2>
                        <p className="text-stone-600 dark:text-stone-400 max-w-2xl mx-auto">
                            Join thousands using Selah to deepen their faith
                            through AI-guided devotional conversations, daily
                            reflections, and meaningful scripture exploration.
                        </p>
                    </div>
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-stone-900 dark:bg-stone-50 text-white dark:text-stone-900 rounded-xl hover:bg-stone-800 dark:hover:bg-stone-200 transition-all hover:scale-105 font-medium text-lg shadow-lg"
                    >
                        <Home className="w-5 h-5" />
                        Get Started Free
                    </Link>
                </div>
            </main>

            {/* Footer */}
            <footer className="max-w-4xl mx-auto px-4 py-8 text-center">
                <p className="text-sm text-stone-500 dark:text-stone-500">
                    © {new Date().getFullYear()} Selah. Deepening faith through
                    reflection.
                </p>
            </footer>
        </div>
    );
}
