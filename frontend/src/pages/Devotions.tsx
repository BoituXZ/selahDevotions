import { useEffect, useState, useCallback, useMemo } from "react";
import { api } from "../api";
import { useNavigate } from "react-router-dom";
import type { Devotion, UserPreferences } from "../types/types";
import DevotionListItem from "../components/DevotionCard";
import CreateDevotionModal from "../components/CreateDevotionModal";
import IndieTips from "../components/IndieTips";
import EncryptionNotice from "../components/EncryptionNotice";

const Devotions = () => {
    const [devotions, setDevotions] = useState<Devotion[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showEncryptionNotice, setShowEncryptionNotice] = useState(false);
    const navigate = useNavigate();

    const groupedByMonth = useMemo(() => {
        const map = new Map<string, Devotion[]>();
        for (const devotion of devotions) {
            const key = new Date(devotion.created_at)
                .toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                })
                .toUpperCase();
            if (!map.has(key)) map.set(key, []);
            map.get(key)!.push(devotion);
        }
        return map;
    }, [devotions]);

    const fetchDevotions = useCallback(async () => {
        try {
            const response = await api.get<Devotion[]>("/api/devotions");
            if (response) {
                const sorted = response.sort(
                    (a, b) =>
                        new Date(b.created_at).getTime() -
                        new Date(a.created_at).getTime(),
                );
                setDevotions(sorted);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDevotions();
    }, [fetchDevotions]);

    useEffect(() => {
        const checkEncryptionNotice = async () => {
            try {
                const prefs =
                    await api.get<UserPreferences>("/api/preferences");
                if (!prefs.has_seen_encryption_notice) {
                    setShowEncryptionNotice(true);
                }
            } catch (error) {
                console.error("Failed to fetch preferences:", error);
            }
        };
        checkEncryptionNotice();
    }, []);

    return (
        <div className="flex-1 overflow-y-auto bg-stone-50 dark:bg-stone-950 pb-28 md:pb-12 p-6 md:p-12">
            <div className="max-w-2xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex justify-between items-end border-b border-stone-200 dark:border-stone-800 pb-8">
                    <div>
                        <h1 className="text-4xl font-serif text-stone-800 dark:text-stone-100">
                            The Journal
                        </h1>
                        <p className="text-stone-500 dark:text-stone-400 mt-2 font-sans text-sm">
                            Reflect on your walk with Him.
                        </p>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-[#3B4737] dark:bg-[#E6E0D4] text-white dark:text-[#3B4737] px-5 py-2.5 text-sm md:px-6 md:py-3 md:text-base rounded-lg hover:bg-[#2E3A2B] dark:hover:bg-[#D4CBBA] transition-colors font-sans font-medium whitespace-nowrap"
                    >
                        New Entry
                    </button>
                </div>

                {/* Encryption Notice */}
                {showEncryptionNotice && (
                    <EncryptionNotice
                        onDismiss={() => setShowEncryptionNotice(false)}
                    />
                )}

                {/* Card list */}
                <div className="min-h-50">
                    {loading ? (
                        <div className="text-stone-400 dark:text-stone-500 text-center py-12 font-sans text-sm">
                            Loading sanctuary...
                        </div>
                    ) : devotions.length === 0 ? (
                        <div className="text-center py-20">
                            <p className="text-stone-400 dark:text-stone-500 italic mb-3 font-serif text-xl">
                                "Be still, and know that I am God."
                            </p>
                            <p className="text-sm text-stone-500 dark:text-stone-400 font-sans">
                                No entries yet. Start your first devotion above.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {Array.from(groupedByMonth.entries()).map(
                                ([monthLabel, entries]) => (
                                    <section key={monthLabel}>
                                        {/* Month divider */}
                                        <div className="flex items-center gap-3 mb-3">
                                            <span className="text-[11px] font-semibold tracking-[0.18em] text-stone-400 dark:text-stone-500 uppercase font-sans shrink-0">
                                                {monthLabel}
                                            </span>
                                            <div className="flex-1 h-px bg-stone-200 dark:bg-stone-800 opacity-60" />
                                        </div>
                                        {/* Cards */}
                                        <div className="space-y-3">
                                            {entries.map((devotion) => (
                                                <DevotionListItem
                                                    key={devotion.id}
                                                    devotion={devotion}
                                                    onClick={() =>
                                                        navigate(
                                                            `/devotions/${devotion.id}`,
                                                        )
                                                    }
                                                />
                                            ))}
                                        </div>
                                    </section>
                                ),
                            )}
                        </div>
                    )}
                </div>

                <CreateDevotionModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={() => {
                        fetchDevotions();
                    }}
                />

                {/* Indie Vibe Tip */}
                <IndieTips />
            </div>
        </div>
    );
};

export default Devotions;
