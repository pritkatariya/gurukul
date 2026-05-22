import { useEffect, useRef } from "react";
import { FaCopy, FaPlus, FaTrash, FaArrowUp, FaArrowDown } from "react-icons/fa6";

interface RightClickProps {
  visible: boolean;
  x: number;
  y: number;
  canAddCard: boolean;
  onAddCard: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onBringForward: () => void;
  onSendBackward: () => void;
  onClose: () => void;
}

export default function RightClick({
  visible,
  x,
  y,
  canAddCard,
  onAddCard,
  onDelete,
  onDuplicate,
  onBringForward,
  onSendBackward,
  onClose,
}: RightClickProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!visible) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [visible, onClose]);

  useEffect(() => {
    if (!visible) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [visible, onClose]);

  if (!visible) return null;

  const btn = "flex w-full items-center gap-3 px-4 py-2 text-[13px] font-semibold transition-colors";

  return (
    <div
      ref={ref}
      className="fixed z-[99999] min-w-[170px] overflow-hidden rounded-2xl bg-white/95 shadow-[0_8px_40px_rgba(15,23,42,0.18)] backdrop-blur-xl ring-1 ring-slate-200/60"
      style={{ left: x, top: y }}
    >
      {canAddCard && (
        <button onClick={onAddCard} className={`${btn} text-slate-700 hover:bg-slate-50`}>
          <FaPlus size={12} className="text-blue-500" /> Add Card
        </button>
      )}
      <button onClick={onDuplicate} className={`${btn} text-slate-700 hover:bg-slate-50`}>
        <FaCopy size={12} className="text-slate-500" /> Duplicate
      </button>
      <button onClick={onBringForward} className={`${btn} text-slate-700 hover:bg-slate-50`}>
        <FaArrowUp size={12} className="text-slate-500" /> Bring Forward
      </button>
      <button onClick={onSendBackward} className={`${btn} text-slate-700 hover:bg-slate-50`}>
        <FaArrowDown size={12} className="text-slate-500" /> Send Backward
      </button>
      <div className="mx-3 border-t border-slate-100" />
      <button onClick={onDelete} className={`${btn} text-red-600 hover:bg-red-50`}>
        <FaTrash size={12} /> Delete
      </button>
    </div>
  );
}
