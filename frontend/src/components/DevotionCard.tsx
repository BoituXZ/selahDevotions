import { useState } from "react";
import { Share2, Globe } from "lucide-react";
import { toast } from "sonner";
import type { Devotion } from "../types/types";
import { api } from "../api";
import ShareModal from "./ShareModal";

interface DevotionCardProps {
    devotion: Devotion;
    onClick: () => void;
    onShareStatusChange?: () => void;
}

export default function DevotionCard({
    devotion,
    onClick,
    onShareStatusChange,
}: DevotionCardProps) {
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [shareUrl, setShareUrl] = useState("");
    const [isSharing, setIsSharing] = useState(false);
    const [isRevoking, setIsRevoking] = useState(false);

    const plainText = devotion.content.replace(/<[^>]*>?/gm, "");

    // Deterministic color based on ID
    const colors = [
        "bg-[#A3B18A]",
        "bg-[#D4C5A9]",
        "bg-[#9CA3AF]",
        "bg-[#B5C0D0]",
    ]; // Sage, Sand, Slate, Blue-ish
    // Use first 8 chars of UUID (hex string) as seed for deterministic color
    const colorIndex =
        parseInt(devotion.id.substring(0, 8), 16) % colors.length;
    const colorClass = colors[colorIndex];

    const handleShare = async (e: React.MouseEvent) => {
        e.stopPropagation();

        if (devotion.is_shared && devotion.share_token) {
            // Already shared, just show the modal with existing link
            const url = `${window.location.origin}/share/${devotion.share_token}`;
            setShareUrl(url);
            setIsShareModalOpen(true);
            return;
        }

        // Generate new share link
        setIsSharing(true);
        try {
            const response = await api.post<{
                shareToken: string;
                shareKey: string;
                message: string;
            }>(`/api/devotions/${devotion.id}/share`, {});

            const url = `${window.location.origin}/share/${response.shareToken}#${response.shareKey}`;
            setShareUrl(url);
            setIsShareModalOpen(true);
            toast.success("Share link created!");
            onShareStatusChange?.();
        } catch (error) {
            console.error("Failed to create share link:", error);
            toast.error("Failed to create share link");
        } finally {
            setIsSharing(false);
        }
    };

    const handleRevoke = async () => {
        setIsRevoking(true);
        try {
            await api.delete(`/api/devotions/${devotion.id}/share`);
            toast.success("Share link revoked");
            setIsShareModalOpen(false);
            onShareStatusChange?.();
        } catch (error) {
            console.error("Failed to revoke share link:", error);
            toast.error("Failed to revoke share link");
        } finally {
            setIsRevoking(false);
        }
    };

    return (
        <div
            onClick={onClick}
            className="group cursor-pointer flex flex-col bg-white dark:bg-stone-900 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden border border-stone-100 dark:border-stone-800 h-full"
        >
            {/* Color Block */}
            <div className={`h-3 w-full ${colorClass}`} />

            <div className="p-6 flex flex-col flex-1">
                {/* Header: Date, Mood, & Share Status */}
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold tracking-widest text-stone-400 dark:text-stone-500 uppercase font-sans">
                            {new Date(devotion.created_at).toLocaleDateString(
                                "en-US",
                                {
                                    month: "short",
                                    day: "numeric",
                                },
                            )}
                        </span>
                        {devotion.is_shared && (
                            <span className="inline-flex items-center gap-1 text-[10px] tracking-wider uppercase border border-green-300 dark:border-green-700 text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950/30 px-2 py-0.5 rounded-full">
                                <Globe className="w-3 h-3" />
                                Public
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        {devotion.mood && (
                            <span className="text-[10px] tracking-wider uppercase border border-stone-200 dark:border-stone-700 text-stone-500 dark:text-stone-400 px-2 py-0.5 rounded-full">
                                {devotion.mood}
                            </span>
                        )}
                        <button
                            onClick={handleShare}
                            disabled={isSharing}
                            className="p-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-300"
                            title={
                                devotion.is_shared
                                    ? "View share link"
                                    : "Share this devotion"
                            }
                        >
                            {isSharing ? (
                                <div className="w-4 h-4 border-2 border-stone-300 border-t-stone-600 rounded-full animate-spin" />
                            ) : (
                                <Share2
                                    className={`w-4 h-4 ${devotion.is_shared ? "text-green-600 dark:text-green-400" : ""}`}
                                />
                            )}
                        </button>
                    </div>
                </div>

                {/* Content Preview */}
                <p className="text-xl font-serif text-stone-800 dark:text-stone-100 leading-snug line-clamp-3 mb-4 group-hover:text-stone-600 dark:group-hover:text-stone-300 transition-colors">
                    {plainText || (
                        <span className="text-stone-400 dark:text-stone-500 italic font-sans text-sm">
                            Empty entry...
                        </span>
                    )}
                </p>

                {/* Footer (Scripture ref if exists) */}
                <div className="mt-auto pt-4 border-t border-stone-50 dark:border-stone-800">
                    <p className="text-xs text-stone-400 dark:text-stone-500 font-sans truncate">
                        {devotion.scripture_ref || "Reflection"}
                    </p>
                </div>
            </div>

            {/* Share Modal */}
            {isShareModalOpen && shareUrl && (
                <ShareModal
                    isOpen={isShareModalOpen}
                    onClose={() => setIsShareModalOpen(false)}
                    shareUrl={shareUrl}
                    onRevoke={handleRevoke}
                    isRevoking={isRevoking}
                />
            )}
        </div>
    );
}
