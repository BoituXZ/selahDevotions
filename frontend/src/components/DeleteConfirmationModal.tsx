import { X, AlertTriangle } from "lucide-react";

interface DeleteConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    loading?: boolean;
}

export default function DeleteConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    loading = false,
}: DeleteConfirmationModalProps) {
    if (!isOpen) return null;

    return (
        // Backdrop
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 backdrop-blur-sm p-4">
            {/* Modal Content */}
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-stone-100">
                    <div className="flex items-center gap-3">
                        <div className="bg-orange-100 p-2 rounded-full">
                            <AlertTriangle
                                size={20}
                                className="text-orange-600"
                            />
                        </div>
                        <h2 className="text-xl font-serif text-stone-800">
                            Delete Entry
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-stone-400 hover:text-stone-600 transition"
                        disabled={loading}
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    <p className="text-stone-600 leading-relaxed">
                        Are you sure you want to delete this devotion entry?
                        This action cannot be undone and your reflection will be
                        permanently removed.
                    </p>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-stone-100 flex justify-end gap-3 bg-stone-50/50 rounded-b-2xl">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="px-5 py-2.5 text-stone-600 font-medium hover:bg-stone-200 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className="px-6 py-2.5 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg shadow-red-600/20"
                    >
                        {loading ? "Deleting..." : "Delete Entry"}
                    </button>
                </div>
            </div>
        </div>
    );
}
