import { useEffect, useState, useCallback } from "react";
import { Plus } from "lucide-react";
import { api } from "../api";
import { useNavigate } from "react-router-dom";
import type { Devotion, UserPreferences } from "../types/types";
import DevotionCard from "../components/DevotionCard";
import CreateDevotionModal from "../components/CreateDevotionModal";
import IndieTips from "../components/IndieTips";
import EncryptionNotice from "../components/EncryptionNotice";

const Devotions = () => {
    const [devotions, setDevotions] = useState<Devotion[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showEncryptionNotice, setShowEncryptionNotice] = useState(false);
    const navigate = useNavigate();

    const fetchDevotions = useCallback(async () => {
        try {
            const response = await api.get<Devotion[]>("/api/devotions");
            if (response) {
                // Sort by date desc
                const sorted = response.sort((a, b) => 
                    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
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
                const prefs = await api.get<UserPreferences>(
                    "/api/preferences"
                );
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
        <div className="flex-1 overflow-y-auto bg-stone-50 pb-28 md:pb-12 p-6 md:p-12">
            <div className="max-w-5xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex justify-between items-end border-b border-stone-200 pb-6">
                    <div>
                        <h1 className="text-4xl font-serif text-stone-800">
                            The Journal
                        </h1>
                        <p className="text-stone-500 mt-2">
                            Reflect on your walk with Him.
                        </p>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 bg-stone-900 text-white px-4 py-2 text-sm md:px-5 md:py-3 md:text-base rounded-lg hover:bg-stone-700 transition shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                    >
                        <Plus size={16} strokeWidth={1.5} />
                        <span className="font-medium">New Entry</span>
                    </button>
                </div>

                {/* Encryption Notice */}
                {showEncryptionNotice && (
                    <EncryptionNotice
                        onDismiss={() => setShowEncryptionNotice(false)}
                    />
                )}

                {/* Grid List */}
                <div className="min-h-[200px]">
                    {loading ? (
                        <div className="text-stone-400 text-center py-12">Loading sanctuary...</div>
                    ) : devotions.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-2xl border border-stone-200 border-dashed">
                            <p className="text-stone-400 italic mb-4 font-serif text-xl">
                                "Be still, and know that I am God."
                            </p>
                            <p className="text-sm text-stone-500">
                                No entries yet. Start your first devotion above.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {devotions.map((devotion) => (
                                <DevotionCard
                                    key={devotion.id}
                                    devotion={devotion}
                                    onClick={() =>
                                        navigate(`/devotions/${devotion.id}`)
                                    }
                                />
                            ))}
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
