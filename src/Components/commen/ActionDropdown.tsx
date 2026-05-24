import { useState, useRef, useEffect } from "react";
import ReactDOM from "react-dom";
import { FaEllipsisV, FaEye, FaPen, FaTrashAlt } from "react-icons/fa";

interface ActionDropdownProps {
    onView: () => void;
    onEdit: () => void;
    onDelete: () => void;
}

export default function ActionDropdown({ onView, onEdit, onDelete }: ActionDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const [coords, setCoords] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            const target = event.target as Node;
            const clickedOutsideButton = dropdownRef.current && !dropdownRef.current.contains(target);
            const clickedOutsideMenu = menuRef.current && !menuRef.current.contains(target);
            if (isOpen && clickedOutsideButton && clickedOutsideMenu) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    function openMenu() {
        const btn = buttonRef.current;
        if (!btn) return setIsOpen(true);
        const rect = btn.getBoundingClientRect();
        const menuWidth = 144; // approx w-36 (9rem)
        let left = Math.round(rect.right - menuWidth);
        const minLeft = 8;
        const maxLeft = Math.round(window.innerWidth - menuWidth - 8);
        if (left < minLeft) left = Math.round(rect.left);
        if (left > maxLeft) left = maxLeft;
        const top = Math.round(rect.bottom + 6);
        setCoords({ top, left });
        setIsOpen(true);
    }

    function closeMenu() {
        setIsOpen(false);
    }

    return (
        <div className={`relative inline-block text-left`} ref={dropdownRef}>
            <button
                ref={buttonRef}
                onClick={(e) => {
                    e.stopPropagation();
                    if (isOpen) closeMenu(); else openMenu();
                }}
                className="w-8 h-8 rounded-full bg-gray-50 text-red-800 hover:bg-red-100 flex justify-center items-center cursor-pointer transition-all active:scale-90 focus:outline-none shadow-sm border border-gray-200/60"
            >
                <FaEllipsisV size={13} />
            </button>

            {isOpen && ReactDOM.createPortal(
                <>
                    <div
                        onClick={() => closeMenu()}
                        style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 99998 }}
                    />
                    <div
                        ref={menuRef}
                        style={{ position: "fixed", top: coords.top, left: coords.left, zIndex: 99999 }}
                        className="w-36 bg-white border border-gray-100 rounded-xl shadow-2xl p-1 flex flex-col gap-0.5 transform origin-top-right transition-all duration-150"
                        onClick={(e) => e.stopPropagation()}
                    >
                    <button
                        onClick={() => { onView(); closeMenu(); }}
                        className="w-full text-left px-3 py-2 text-xs font-black text-gray-700 hover:bg-red-50 hover:text-red-800 rounded-lg flex items-center gap-2 transition-colors cursor-pointer focus:outline-none uppercase tracking-wider"
                    >
                        <FaEye size={12} className="text-gray-400" />
                        View Info
                    </button>

                    <button
                        onClick={() => { onEdit(); closeMenu(); }}
                        className="w-full text-left px-3 py-2 text-xs font-black text-gray-700 hover:bg-red-50 hover:text-red-800 rounded-lg flex items-center gap-2 transition-colors cursor-pointer focus:outline-none uppercase tracking-wider"
                    >
                        <FaPen size={10} className="text-gray-400" />
                        Edit Data
                    </button>

                    <div className="h-px bg-gray-100 my-0.5" />

                    <button
                        onClick={() => { onDelete(); closeMenu(); }}
                        className="w-full text-left px-3 py-2 text-xs font-black text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2 transition-colors cursor-pointer focus:outline-none uppercase tracking-wider"
                    >
                        <FaTrashAlt size={11} />
                        Delete
                    </button>
                </div>
                </>,
                document.body
            )}
        </div>
    );
}