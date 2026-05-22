import { useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import type { DockItemData } from "./EditorTypes";

interface DockProps {
  items: DockItemData[];
  panelHeight?: number;
  baseItemSize?: number;
  magnification?: number;
}

function DockItem({
  item,
  mouseX,
  baseItemSize,
  magnification,
}: {
  item: DockItemData;
  mouseX: ReturnType<typeof useMotionValue<number>>;
  baseItemSize: number;
  magnification: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);

  const distance = useTransform(mouseX, (val) => {
    const bounds = ref.current?.getBoundingClientRect();
    if (!bounds) return Infinity;
    return val - (bounds.left + bounds.width / 2);
  });

  const sizeFactor = useTransform(distance, [-120, 0, 120], [1, magnification / baseItemSize, 1]);
  const size = useSpring(sizeFactor, { stiffness: 400, damping: 28 });
  const scaledSize = useTransform(size, (s) => `${s * baseItemSize}px`);

  return (
    <div className="relative flex flex-col items-center">
      {hovered && (
        <div className="absolute -top-9 left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded-lg bg-slate-800 px-2.5 py-1 text-[11px] font-semibold text-white shadow-lg">
          {item.label}
          <div className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-slate-800" />
        </div>
      )}
      <motion.div
        ref={ref}
        style={{ width: scaledSize, height: scaledSize }}
        className={`flex cursor-pointer items-center justify-center rounded-2xl bg-white shadow-[0_2px_12px_rgba(15,23,42,0.08)] transition-colors hover:bg-slate-50 ${item.className ?? ""}`}
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
        onClick={item.onClick}
        whileTap={{ scale: 0.9 }}
      >
        <span className={`flex items-center justify-center text-slate-600 ${item.className ?? ""}`}>
          {item.icon}
        </span>
      </motion.div>
    </div>
  );
}

export default function Dock({
  items,
  panelHeight = 68,
  baseItemSize = 48,
  magnification = 68,
}: DockProps) {
  const mouseX = useMotionValue(Infinity);

  return (
    <div
      className="fixed bottom-4 left-1/2 z-[9998] -translate-x-1/2"
      style={{ height: panelHeight }}
    >
      <motion.div
        onMouseMove={(e) => mouseX.set(e.clientX)}
        onMouseLeave={() => mouseX.set(Infinity)}
        className="flex h-full items-end gap-1.5 rounded-3xl bg-white/80 px-3 pb-2.5 shadow-[0_8px_40px_rgba(15,23,42,0.12)] backdrop-blur-xl ring-1 ring-slate-200/50"
      >
        {items.map((item, i) => (
          <DockItem
            key={i}
            item={item}
            mouseX={mouseX}
            baseItemSize={baseItemSize}
            magnification={magnification}
          />
        ))}
      </motion.div>
    </div>
  );
}
