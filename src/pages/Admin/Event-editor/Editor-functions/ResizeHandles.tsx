import type { ResizeDirection } from "./EditorTypes";

const directionClasses: Record<ResizeDirection, string> = {
  "top": "absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 cursor-n-resize",
  "right": "absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 cursor-e-resize",
  "bottom": "absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 cursor-s-resize",
  "left": "absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 cursor-w-resize",
  "top-left": "absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 cursor-nw-resize",
  "top-right": "absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 cursor-ne-resize",
  "bottom-left": "absolute bottom-0 left-0 -translate-x-1/2 translate-y-1/2 cursor-sw-resize",
  "bottom-right": "absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 cursor-se-resize",
};

const RESIZE_DIRECTIONS: ResizeDirection[] = [
  "top", "right", "bottom", "left",
  "top-left", "top-right", "bottom-left", "bottom-right",
];

interface ResizeHandlesProps {
  onPointerDown: (e: React.PointerEvent<HTMLButtonElement>, direction: ResizeDirection) => void;
}

export default function ResizeHandles({ onPointerDown }: ResizeHandlesProps) {
  return (
    <>
      {RESIZE_DIRECTIONS.map((dir) => (
        <button
          key={dir}
          className={`${directionClasses[dir]} z-20 h-2.5 w-2.5 rounded-full border-2 border-blue-500 bg-white shadow-sm transition-transform hover:scale-150`}
          onPointerDown={(e) => onPointerDown(e, dir)}
        />
      ))}
    </>
  );
}

export { RESIZE_DIRECTIONS };
