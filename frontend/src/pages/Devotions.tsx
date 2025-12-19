import { useEffect, useState, useCallback } from "react";
import { Plus } from "lucide-react";
import { api } from "../api";
import { useNavigate } from "react-router-dom";
import type { Devotion } from "../types/types";
import DevotionCard from "../components/DevotionCard";
import CreateDevotionModal from "../components/CreateDevotionModal"; // <-- Import

const Devotions = () => {
    const [devotions, setDevotions] = useState<Devotion[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false); // <-- Modal State
    const navigate = useNavigate();

    // Move fetch to a function so we can reuse it
    const fetchDevotions = useCallback(async () => {
        try {
            const response = await api.get<Devotion[]>("/api/devotions");
            if (response) setDevotions(response);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDevotions();
    }, [fetchDevotions]);

    return (
        <div className="max-w-3xl mx-auto p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-serif text-stone-800">
                    My Devotions
                </h1>
                <button
                    onClick={() => setIsModalOpen(true)} // <-- Open Modal
                    className="flex items-center gap-2 bg-stone-900 text-white px-4 py-2 rounded-lg hover:bg-stone-700 transition"
                >
                    <Plus size={18} />
                    <span>New Entry</span>
                </button>
            </div>

            {/* List */}
            <div className="grid gap-4">
                {loading ? (
                    <p>Loading...</p>
                ) : devotions.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl border border-stone-200 border-dashed">
                        <p className="text-stone-500 italic mb-2">
                            "Be still, and know that I am God."
                        </p>
                        <p className="text-sm text-stone-400">
                            No entries yet. Start your first devotion above.
                        </p>
                    </div>
                ) : (
                    devotions.map((devotion) => (
                        <DevotionCard
                            key={devotion.id}
                            devotion={devotion}
                            onClick={() =>
                                navigate(`/devotions/${devotion.id}`)
                            }
                        />
                    ))
                )}
            </div>

            {/* The Modal */}
            <CreateDevotionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={() => {
                    // When saved, re-fetch the list to show the new item immediately
                    fetchDevotions();
                }}
            />
        </div>
    );
};

export default Devotions;
