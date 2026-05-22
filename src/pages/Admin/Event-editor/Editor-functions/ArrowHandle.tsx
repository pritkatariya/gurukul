import { FaArrowRight } from "react-icons/fa6";

export type ResizeDirection =
    | "top"
    | "right"
    | "bottom"
    | "left"
    | "top-left"
    | "top-right"
    | "bottom-left"
    | "bottom-right";

type Props = {
    direction: ResizeDirection;
    onPointerDown: (
        event: React.PointerEvent<HTMLButtonElement>,
        direction: ResizeDirection
    ) => void;
};

const positionMap: Record<ResizeDirection, string> = {
    top: "left-1/2 top-[-14px] -translate-x-1/2 -rotate-90",
    right: "right-[-14px] top-1/2 -translate-y-1/2",
    bottom: "bottom-[-14px] left-1/2 -translate-x-1/2 rotate-90",
    left: "left-[-14px] top-1/2 -translate-y-1/2 rotate-180",
    "top-left": "left-[-14px] top-[-14px] -rotate-[135deg]",
    "top-right": "right-[-14px] top-[-14px] -rotate-45",
    "bottom-left": "bottom-[-14px] left-[-14px] rotate-[135deg]",
    "bottom-right": "bottom-[-14px] right-[-14px] rotate-45",
};

export default function ArrowHandle({ direction, onPointerDown }: Props) {
    return (
        <button
            type="button"
            onPointerDown={(event) => onPointerDown(event, direction)}
            className={`absolute ${positionMap[direction]} z-30 flex h-7 w-7 items-center justify-center rounded-full bg-white text-blue-600 shadow-lg ring-1 ring-blue-100 transition hover:scale-110 active:scale-95`}
        >
            <FaArrowRight className="text-[10px]" />
        </button>
    );
}