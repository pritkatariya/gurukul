import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import type { CarouselCard } from "./EditorTypes";

interface CarouselProps {
  cards: CarouselCard[];
  baseWidth: number;
  baseHeight: number;
}

export default function Carousel({ cards, baseWidth, baseHeight }: CarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [hovered, setHovered] = useState(false);
  const autoplayRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const count = cards.length;

  const goTo = (index: number, dir: number) => {
    setDirection(dir);
    setActiveIndex((index + count) % count);
  };
  const next = () => goTo(activeIndex + 1, 1);
  const prev = () => goTo(activeIndex - 1, -1);

  useEffect(() => {
    if (hovered || count <= 1) {
      if (autoplayRef.current) clearInterval(autoplayRef.current);
      return;
    }
    autoplayRef.current = setInterval(next, 3500);
    return () => { if (autoplayRef.current) clearInterval(autoplayRef.current); };
  }, [hovered, activeIndex, count]);

  useEffect(() => {
    if (activeIndex >= count) setActiveIndex(Math.max(0, count - 1));
  }, [count]);

  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? "100%" : "-100%", opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? "-100%" : "100%", opacity: 0 }),
  };

  const card = cards[activeIndex] ?? cards[0];
  if (!card) return null;

  return (
    <div
      className="relative flex h-full w-full flex-col overflow-hidden rounded-2xl bg-slate-900 select-none"
      style={{ width: baseWidth, height: baseHeight }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="relative flex-1 overflow-hidden">
        <AnimatePresence custom={direction} initial={false}>
          <motion.div
            key={card.id}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "spring", stiffness: 340, damping: 32 }}
            className="absolute inset-0 flex flex-col"
          >
            {card.image ? (
              <img src={card.image} alt={card.title} className="h-full w-full object-cover" draggable={false} />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-700 to-slate-900">
                <span className="text-4xl text-slate-500">&#9654;</span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <p className="text-base font-bold leading-tight text-white">{card.title}</p>
              <p className="mt-1 text-xs text-slate-300 line-clamp-2">{card.description}</p>
            </div>
          </motion.div>
        </AnimatePresence>

        {count > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); prev(); }}
              className="absolute left-2 top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-colors hover:bg-black/60"
            >
              &#8249;
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); next(); }}
              className="absolute right-2 top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-colors hover:bg-black/60"
            >
              &#8250;
            </button>
          </>
        )}
      </div>

      {count > 1 && (
        <div className="flex items-center justify-center gap-1.5 py-2">
          {cards.map((_, i) => (
            <button
              key={i}
              onClick={(e) => { e.stopPropagation(); goTo(i, i > activeIndex ? 1 : -1); }}
              className={`h-1.5 rounded-full transition-all ${i === activeIndex ? "w-5 bg-white" : "w-1.5 bg-white/40"}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
