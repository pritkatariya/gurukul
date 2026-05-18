import { useState, useRef, useEffect } from "react";
import { FaEllipsisV, FaEye, FaPen, FaTrashAlt } from "react-icons/fa";

interface ActionDropdownProps {
    onView: () => void;
    onEdit: () => void;
    onDelete: () => void;
}

export default function ActionDropdown({ onView, onEdit, onDelete }: ActionDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className={`relative inline-block text-left ${isOpen ? "z-40" : ""}`} ref={dropdownRef}>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(!isOpen);
                }}
                className="w-8 h-8 rounded-full bg-gray-50 text-red-800 hover:bg-red-100 flex justify-center items-center cursor-pointer transition-all active:scale-90 focus:outline-none shadow-sm border border-gray-200/60"
            >
                <FaEllipsisV size={13} />
            </button>

            {isOpen && (
                <div className="absolute right-0 top-full mt-1 w-36 bg-white border border-gray-100 rounded-xl shadow-2xl z-50 p-1 flex flex-col gap-0.5 transform origin-top-right transition-all duration-150">
                    
                    <button
                        onClick={(e) => { e.stopPropagation(); onView(); setIsOpen(false); }}
                        className="w-full text-left px-3 py-2 text-xs font-black text-gray-700 hover:bg-red-50 hover:text-red-800 rounded-lg flex items-center gap-2 transition-colors cursor-pointer focus:outline-none uppercase tracking-wider"
                    >
                        <FaEye size={12} className="text-gray-400" />
                        View Info
                    </button>

                    <button
                        onClick={(e) => { e.stopPropagation(); onEdit(); setIsOpen(false); }}
                        className="w-full text-left px-3 py-2 text-xs font-black text-gray-700 hover:bg-red-50 hover:text-red-800 rounded-lg flex items-center gap-2 transition-colors cursor-pointer focus:outline-none uppercase tracking-wider"
                    >
                        <FaPen size={10} className="text-gray-400" />
                        Edit Data
                    </button>

                    <div className="h-px bg-gray-100 my-0.5" />

                    <button
                        onClick={(e) => { e.stopPropagation(); onDelete(); setIsOpen(false); }}
                        className="w-full text-left px-3 py-2 text-xs font-black text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2 transition-colors cursor-pointer focus:outline-none uppercase tracking-wider"
                    >
                        <FaTrashAlt size={11} />
                        Delete
                    </button>

                </div>
            )}
        </div>
    );
}