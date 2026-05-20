import { useEffect, useRef, type CSSProperties, type MouseEventHandler, type PointerEvent } from "react";
import { gsap } from "gsap";

export interface ChromaItem {
    image: string;
    title: string;
    subtitle: string;
    handle?: string;
    location?: string;
    borderColor?: string;
    gradient?: string;
    url?: string;
}

export interface ChromaGridProps {
    items?: ChromaItem[];
    className?: string;
    radius?: number;
    damping?: number;
    fadeOut?: number;
    ease?: string;
}

type SetterFn = (value: number | string) => void;

export default function ChromaGrid({
    items,
    className = "",
    radius = 300,
    damping = 0.45,
    fadeOut = 0.6,
    ease = "power3.out",
}: ChromaGridProps) {
    const rootRef = useRef<HTMLDivElement>(null);
    const fadeRef = useRef<HTMLDivElement>(null);
    const setX = useRef<SetterFn | null>(null);
    const setY = useRef<SetterFn | null>(null);
    const pos = useRef({ x: 0, y: 0 });

    const demo: ChromaItem[] = [
        {
            image: "https://i.pravatar.cc/300?img=8",
            title: "Alex Rivera",
            subtitle: "Full Stack Developer",
            handle: "@alexrivera",
            borderColor: "#4F46E5",
            gradient: "linear-gradient(145deg,#4F46E5,#000)",
            url: "https://github.com/",
        },
        {
            image: "https://i.pravatar.cc/300?img=11",
            title: "Jordan Chen",
            subtitle: "DevOps Engineer",
            handle: "@jordanchen",
            borderColor: "#10B981",
            gradient: "linear-gradient(210deg,#10B981,#000)",
            url: "https://linkedin.com/in/",
        },
    ];

    const data = items?.length ? items : demo;

    useEffect(() => {
        const element = rootRef.current;
        if (!element) return;

        setX.current = gsap.quickSetter(element, "--x", "px") as SetterFn;
        setY.current = gsap.quickSetter(element, "--y", "px") as SetterFn;

        const { width, height } = element.getBoundingClientRect();
        pos.current = { x: width / 2, y: height / 2 };

        setX.current(pos.current.x);
        setY.current(pos.current.y);
    }, []);

    const moveTo = (x: number, y: number) => {
        gsap.to(pos.current, {
            x,
            y,
            duration: damping,
            ease,
            onUpdate: () => {
                setX.current?.(pos.current.x);
                setY.current?.(pos.current.y);
            },
            overwrite: true,
        });
    };

    const handleMove = (event: PointerEvent<HTMLDivElement>) => {
        const element = rootRef.current;
        if (!element) return;

        const rect = element.getBoundingClientRect();
        moveTo(event.clientX - rect.left, event.clientY - rect.top);

        gsap.to(fadeRef.current, {
            opacity: 0,
            duration: 0.25,
            overwrite: true,
        });
    };

    const handleLeave = () => {
        gsap.to(fadeRef.current, {
            opacity: 1,
            duration: fadeOut,
            overwrite: true,
        });
    };

    const handleCardClick = (url?: string) => {
        if (!url) return;
        window.open(url, "_blank", "noopener,noreferrer");
    };

    const handleCardMove: MouseEventHandler<HTMLElement> = (event) => {
        const card = event.currentTarget;
        const rect = card.getBoundingClientRect();

        card.style.setProperty("--mouse-x", `${event.clientX - rect.left}px`);
        card.style.setProperty("--mouse-y", `${event.clientY - rect.top}px`);
    };

    return (
        <div
            ref={rootRef}
            onPointerMove={handleMove}
            onPointerLeave={handleLeave}
            className={`relative flex h-full w-full flex-wrap items-start justify-center gap-4 overflow-hidden ${className}`}
            style={
                {
                    "--r": `${radius}px`,
                    "--x": "50%",
                    "--y": "50%",
                } as CSSProperties
            }
        >
            {data.map((card, index) => (
                <article
                    key={`${card.title}-${index}`}
                    onMouseMove={handleCardMove}
                    onClick={() => handleCardClick(card.url)}
                    className="group relative flex h-95 w-75 cursor-pointer flex-col overflow-hidden rounded-[20px] border-2 border-transparent transition-colors duration-300"
                    style={
                        {
                            "--card-border": card.borderColor || "transparent",
                            background: card.gradient || "linear-gradient(145deg,#991B1B,#000)",
                            "--spotlight-color": "rgba(255,255,255,0)",
                        } as CSSProperties
                    }
                >
                    <div
                        className="pointer-events-none absolute inset-0 z-20 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                        style={{
                            background:
                                "radial-gradient(circle at var(--mouse-x) var(--mouse-y), var(--spotlight-color), transparent 70%)",
                        }}
                    />

                    <div className="relative z-10 flex-1 p-2.5">
                        <img
                            src={card.image}
                            alt={card.title}
                            loading="lazy"
                            className="h-full w-full rounded-[10px] object-cover"
                        />
                    </div>

                    <footer className="relative z-10 grid grid-cols-[1fr_auto] gap-x-3 gap-y-1 p-3 font-sans text-white">
                        <h3 className="m-0 text-[1.05rem] font-semibold">
                            {card.title}
                        </h3>

                        {card.handle && (
                            <span className="text-right text-[0.95rem] opacity-80">
                                {card.handle}
                            </span>
                        )}

                        <p className="m-0 text-[0.85rem] opacity-85">
                            {card.subtitle}
                        </p>

                        {card.location && (
                            <span className="text-right text-[0.85rem] opacity-85">
                                {card.location}
                            </span>
                        )}
                    </footer>
                </article>
            ))}

            <div
                className="pointer-events-none absolute inset-0 z-30"
                style={{
                    backdropFilter: "grayscale(1) brightness(0.78)",
                    WebkitBackdropFilter: "grayscale(1) brightness(0.78)",
                    background: "rgba(0,0,0,0.001)",
                    maskImage:
                        "radial-gradient(circle var(--r) at var(--x) var(--y),transparent 0%,transparent 15%,rgba(0,0,0,0.10) 30%,rgba(0,0,0,0.22) 45%,rgba(0,0,0,0.35) 60%,rgba(0,0,0,0.50) 75%,rgba(0,0,0,0.68) 88%,white 100%)",
                    WebkitMaskImage:
                        "radial-gradient(circle var(--r) at var(--x) var(--y),transparent 0%,transparent 15%,rgba(0,0,0,0.10) 30%,rgba(0,0,0,0.22) 45%,rgba(0,0,0,0.35) 60%,rgba(0,0,0,0.50) 75%,rgba(0,0,0,0.68) 88%,white 100%)",
                }}
            />

            <div
                ref={fadeRef}
                className="pointer-events-none absolute inset-0 z-40 transition-opacity duration-250"
                style={{
                    backdropFilter: "grayscale(1) brightness(0.78)",
                    WebkitBackdropFilter: "grayscale(1) brightness(0.78)",
                    background: "rgba(0,0,0,0.001)",
                    maskImage:
                        "radial-gradient(circle var(--r) at var(--x) var(--y),white 0%,white 15%,rgba(255,255,255,0.90) 30%,rgba(255,255,255,0.78) 45%,rgba(255,255,255,0.65) 60%,rgba(255,255,255,0.50) 75%,rgba(255,255,255,0.32) 88%,transparent 100%)",
                    WebkitMaskImage:
                        "radial-gradient(circle var(--r) at var(--x) var(--y),white 0%,white 15%,rgba(255,255,255,0.90) 30%,rgba(255,255,255,0.78) 45%,rgba(255,255,255,0.65) 60%,rgba(255,255,255,0.50) 75%,rgba(255,255,255,0.32) 88%,transparent 100%)",
                    opacity: 1,
                }}
            />
        </div>
    );
}