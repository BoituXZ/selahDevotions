import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, BookOpen, Smile } from "lucide-react";
import { toast } from "sonner";
import { api } from "../api";
import type { Devotion } from "../types/types";
import DeleteConfirmationModal from "../components/DeleteConfirmationModal";
import CreateDevotionModal from "../components/CreateDevotionModal";
import DevotionMenu from "../components/DevotionMenu";

export default function DevotionDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [devotion, setDevotion] = useState<Devotion | null>(null);
    const [loading, setLoading] = useState(true);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const fetchDevotion = () => {
        if (!id) return;

        api.get<Devotion>(`/api/devotions/${id}`)
            .then(setDevotion)
            .catch((err) => {
                console.error(err);
                navigate("/devotions"); // Kick back to list if not found
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchDevotion();
    }, [id, navigate]);

    const handleEdit = () => {
        setShowEditModal(true);
    };

    const handleEditSuccess = () => {
        // Refresh the devotion data after edit
        setLoading(true);
        fetchDevotion();
        toast.success("Devotion updated successfully");
    };

    const handleDelete = async () => {
        if (!id) return;

        setDeleting(true);
        try {
            await api.delete(`/api/devotions/${id}`);
            toast.success("Devotion deleted successfully");
            navigate("/devotions"); // Navigate back to list, which will refresh
        } catch (err) {
            console.error(err);
            toast.error("Failed to delete devotion");
            setDeleting(false);
            setShowDeleteModal(false);
        }
    };

    if (loading) return <div className="p-8 text-stone-800 dark:text-stone-100">Loading...</div>;
    if (!devotion) return null;

    return (
        <div className="flex-1 overflow-y-auto bg-stone-50 dark:bg-stone-950 pb-28 md:pb-12 p-6 md:p-12">
            <div className="max-w-2xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <button
                        onClick={() => navigate("/devotions")}
                        className="flex items-center gap-2 text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-100 transition text-sm font-medium"
                    >
                        <ArrowLeft size={16} />
                        Back to Sanctuary
                    </button>
                    <DevotionMenu
                        onEdit={handleEdit}
                        onDelete={() => setShowDeleteModal(true)}
                    />
                </div>

                <article className="bg-white dark:bg-stone-900 p-8 md:p-12 rounded-2xl shadow-sm border border-stone-200 dark:border-stone-800">
                    <header className="mb-8 border-b border-stone-100 dark:border-stone-800 pb-6">
                        <div className="flex flex-wrap gap-4 text-sm text-stone-500 dark:text-stone-400 mb-4">
                            <span className="flex items-center gap-1.5 bg-stone-50 dark:bg-stone-800 px-3 py-1 rounded-full">
                                <Calendar size={14} />
                                {new Date(
                                    devotion.created_at
                                ).toLocaleDateString(undefined, {
                                    weekday: "long",
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                })}
                            </span>
                            {devotion.mood && (
                                <span className="flex items-center gap-1.5 bg-stone-50 dark:bg-stone-800 px-3 py-1 rounded-full">
                                    <Smile size={14} />
                                    {devotion.mood}
                                </span>
                            )}
                        </div>

                        {devotion.scripture_ref && (
                            <div className="flex items-start gap-3 text-stone-700 dark:text-stone-300 bg-orange-50/50 dark:bg-orange-950/30 p-4 rounded-lg border border-orange-100 dark:border-orange-900/50">
                                <BookOpen
                                    size={20}
                                    className="mt-1 text-orange-400 dark:text-orange-500 shrink-0"
                                />
                                <span className="font-serif italic text-lg">
                                    {devotion.scripture_ref}
                                </span>
                            </div>
                        )}
                    </header>

                    {/* Content Rendering
            Since we sanitized on the backend, we can use dangerouslySetInnerHTML.
            We add 'prose' (Tailwind Typography) to make the HTML look nice.
            */}
                    <div
                        className="prose prose-stone dark:prose-invert prose-lg max-w-none font-serif leading-loose"
                        dangerouslySetInnerHTML={{ __html: devotion.content }}
                    />
                </article>

                {/* Edit Modal */}
                <CreateDevotionModal
                    isOpen={showEditModal}
                    onClose={() => setShowEditModal(false)}
                    onSuccess={handleEditSuccess}
                    devotion={devotion}
                />

                {/* Delete Confirmation Modal */}
                <DeleteConfirmationModal
                    isOpen={showDeleteModal}
                    onClose={() => setShowDeleteModal(false)}
                    onConfirm={handleDelete}
                    loading={deleting}
                />
            </div>
        </div>
    );
}
