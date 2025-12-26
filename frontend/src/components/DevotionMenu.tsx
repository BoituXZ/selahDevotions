import { useState, useRef, useEffect } from "react";
import { MoreVertical, Edit2, Trash2 } from "lucide-react";

interface DevotionMenuProps {
    onEdit: () => void;
    onDelete: () => void;
}

export default function DevotionMenu({ onEdit, onDelete }: DevotionMenuProps) {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                menuRef.current &&
                !menuRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

    const handleEdit = () => {
        setIsOpen(false);
        onEdit();
    };

    const handleDelete = () => {
        setIsOpen(false);
        onDelete();
    };

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition"
                aria-label="More options"
            >
                <MoreVertical size={20} />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-stone-900 rounded-lg shadow-lg border border-stone-200 dark:border-stone-800 py-1 z-10">
                    <button
                        onClick={handleEdit}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 transition"
                    >
                        <Edit2 size={16} className="text-stone-500 dark:text-stone-400" />
                        <span className="font-medium">Edit</span>
                    </button>
                    <button
                        onClick={handleDelete}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition"
                    >
                        <Trash2 size={16} />
                        <span className="font-medium">Delete</span>
                    </button>
                </div>
            )}
        </div>
    );
}
