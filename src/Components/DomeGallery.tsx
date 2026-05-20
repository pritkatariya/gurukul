import { useCallback, useEffect, useMemo, useRef, type CSSProperties } from "react";
import { useGesture } from "@use-gesture/react";

type ImageItem = string | { src: string; alt?: string };

type DomeGalleryProps = {
    images?: ImageItem[];
    fit?: number;
    fitBasis?: "auto" | "min" | "max" | "width" | "height";
    minRadius?: number;
    maxRadius?: number;
    padFactor?: number;
    overlayBlurColor?: string;
    dragSensitivity?: number;
    enlargeTransitionMs?: number;
    segments?: number;
    openedImageWidth?: string;
    openedImageHeight?: string;
    imageBorderRadius?: string;
    openedImageBorderRadius?: string;
    grayscale?: boolean;
    autoRotate?: boolean;
    autoRotateSpeed?: number;
};

type ItemDef = {
    src: string;
    alt: string;
    x: number;
    y: number;
    sizeX: number;
    sizeY: number;
};

const DEFAULT_IMAGES: ImageItem[] = [
    "https://images.unsplash.com/photo-1480074568708-e7b720bb3f09?q=80&w=500&auto=format",
    "https://images.unsplash.com/photo-1449844908441-8829872d2607?q=80&w=500&auto=format",
    "https://images.unsplash.com/photo-1452626212852-811d58933cae?q=80&w=500&auto=format",
    "https://images.unsplash.com/photo-1572120360610-d971b9d7767c?q=80&w=500&auto=format",
];

const clamp = (value: number, min: number, max: number) =>
    Math.min(Math.max(value, min), max);

function buildItems(pool: ImageItem[], segments: number): ItemDef[] {
    const xCols = Array.from({ length: segments }, (_, index) => -37 + index * 2);
    const evenYs = [-4, -2, 0, 2, 4];
    const oddYs = [-3, -1, 1, 3, 5];

    const coords = xCols.flatMap((x, column) => {
        const ys = column % 2 === 0 ? evenYs : oddYs;
        return ys.map((y) => ({ x, y, sizeX: 2, sizeY: 2 }));
    });

    const normalized = pool.map((image) =>
        typeof image === "string"
            ? { src: image, alt: "" }
            : { src: image.src, alt: image.alt || "" }
    );

    return coords.map((coord, index) => ({
        ...coord,
        src: normalized[index % normalized.length]?.src || "",
        alt: normalized[index % normalized.length]?.alt || "",
    }));
}

export default function DomeGallery({
    images = DEFAULT_IMAGES,
    fit = 0.55,
    fitBasis = "auto",
    minRadius = 420,
    maxRadius = 900,
    padFactor = 0.22,
    overlayBlurColor = "transfarant",
    dragSensitivity = 22,
    enlargeTransitionMs = 320,
    segments = 35,
    openedImageWidth = "430px",
    openedImageHeight = "430px",
    imageBorderRadius = "26px",
    openedImageBorderRadius = "30px",
    grayscale = false,
    autoRotate = true,
    autoRotateSpeed = 0.045,
}: DomeGalleryProps) {
    const rootRef = useRef<HTMLDivElement>(null);
    const mainRef = useRef<HTMLDivElement>(null);
    const sphereRef = useRef<HTMLDivElement>(null);
    const frameRef = useRef<HTMLDivElement>(null);
    const viewerRef = useRef<HTMLDivElement>(null);
    const scrimRef = useRef<HTMLDivElement>(null);

    const rotationYRef = useRef(0);
    const dragStartYRef = useRef(0);
    const pointerStartXRef = useRef(0);
    const rafRef = useRef<number | null>(null);
    const draggingRef = useRef(false);
    const openedTileRef = useRef<HTMLElement | null>(null);
    const openedOverlayRef = useRef<HTMLElement | null>(null);
    const openedOriginalRectRef = useRef<DOMRect | null>(null);

    const items = useMemo(() => buildItems(images, segments), [images, segments]);

    const applyTransform = useCallback(() => {
        if (!sphereRef.current) return;
        sphereRef.current.style.transform = `translateZ(calc(var(--radius) * -1)) rotateX(0deg) rotateY(${rotationYRef.current}deg)`;
    }, []);

    const lockScroll = () => {
        document.body.classList.add("dg-scroll-lock");
    };

    const unlockScroll = () => {
        document.body.classList.remove("dg-scroll-lock");
    };

    useEffect(() => {
        if (!autoRotate) return;

        const tick = () => {
            if (!draggingRef.current && !openedTileRef.current) {
                rotationYRef.current += autoRotateSpeed;
                applyTransform();
            }

            rafRef.current = requestAnimationFrame(tick);
        };

        rafRef.current = requestAnimationFrame(tick);

        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, [applyTransform, autoRotate, autoRotateSpeed]);

    useGesture(
        {
            onDragStart: ({ event }) => {
                if (openedTileRef.current) return;

                const pointerEvent = event as PointerEvent;
                draggingRef.current = true;
                pointerStartXRef.current = pointerEvent.clientX;
                dragStartYRef.current = rotationYRef.current;
            },
            onDrag: ({ event, last }) => {
                if (openedTileRef.current) return;

                const pointerEvent = event as PointerEvent;
                const deltaX = pointerEvent.clientX - pointerStartXRef.current;

                rotationYRef.current = dragStartYRef.current + deltaX / dragSensitivity;
                applyTransform();

                if (last) {
                    draggingRef.current = false;
                }
            },
        },
        { target: mainRef, eventOptions: { passive: false } }
    );

    useEffect(() => {
        const root = rootRef.current;
        if (!root) return;

        const resizeObserver = new ResizeObserver((entries) => {
            const rect = entries[0].contentRect;
            const width = Math.max(1, rect.width);
            const height = Math.max(1, rect.height);
            const minDim = Math.min(width, height);
            const maxDim = Math.max(width, height);
            const aspect = width / height;

            let basis: number;

            switch (fitBasis) {
                case "min":
                    basis = minDim;
                    break;
                case "max":
                    basis = maxDim;
                    break;
                case "width":
                    basis = width;
                    break;
                case "height":
                    basis = height;
                    break;
                default:
                    basis = aspect >= 1.3 ? width : minDim;
            }

            const radius = clamp(Math.min(basis * fit, height * 1.35), minRadius, maxRadius);

            root.style.setProperty("--radius", `${Math.round(radius)}px`);
            root.style.setProperty("--viewer-pad", `${Math.max(8, Math.round(minDim * padFactor))}px`);
            root.style.setProperty("--overlay-blur-color", overlayBlurColor);
            root.style.setProperty("--tile-radius", imageBorderRadius);
            root.style.setProperty("--enlarge-radius", openedImageBorderRadius);
            root.style.setProperty("--image-filter", grayscale ? "grayscale(1)" : "none");

            applyTransform();
        });

        resizeObserver.observe(root);
        return () => resizeObserver.disconnect();
    }, [
        applyTransform,
        fit,
        fitBasis,
        grayscale,
        imageBorderRadius,
        maxRadius,
        minRadius,
        openedImageBorderRadius,
        overlayBlurColor,
        padFactor,
    ]);

    const closeImage = useCallback(() => {
        const tile = openedTileRef.current;
        const overlay = openedOverlayRef.current;
        const originalRect = openedOriginalRectRef.current;
        const root = rootRef.current;

        if (!tile || !overlay || !originalRect || !root) return;

        const rootRect = root.getBoundingClientRect();

        overlay.style.left = `${originalRect.left - rootRect.left}px`;
        overlay.style.top = `${originalRect.top - rootRect.top}px`;
        overlay.style.width = `${originalRect.width}px`;
        overlay.style.height = `${originalRect.height}px`;
        overlay.style.opacity = "0";

        window.setTimeout(() => {
            overlay.remove();
            tile.style.visibility = "";
            openedTileRef.current = null;
            openedOverlayRef.current = null;
            openedOriginalRectRef.current = null;
            root.removeAttribute("data-enlarging");
            unlockScroll();
        }, enlargeTransitionMs);
    }, [enlargeTransitionMs]);

    const openImage = useCallback(
        (tile: HTMLElement) => {
            if (openedTileRef.current || !rootRef.current || !frameRef.current || !viewerRef.current) return;

            const rootRect = rootRef.current.getBoundingClientRect();
            const tileRect = tile.getBoundingClientRect();
            const frameRect = frameRef.current.getBoundingClientRect();
            const src = tile.dataset.src || "";
            const alt = tile.dataset.alt || "";

            openedTileRef.current = tile;
            openedOriginalRectRef.current = tileRect;
            lockScroll();

            tile.style.visibility = "hidden";
            rootRef.current.setAttribute("data-enlarging", "true");

            const overlay = document.createElement("div");
            overlay.className = "dg-enlarge";
            overlay.style.cssText = `
                position: absolute;
                left: ${tileRect.left - rootRect.left}px;
                top: ${tileRect.top - rootRect.top}px;
                width: ${tileRect.width}px;
                height: ${tileRect.height}px;
                z-index: 40;
                opacity: 1;
                overflow: hidden;
                border-radius: ${openedImageBorderRadius};
                box-shadow: 0 25px 80px rgba(0, 0, 0, 0.45);
                transition: left ${enlargeTransitionMs}ms ease, top ${enlargeTransitionMs}ms ease, width ${enlargeTransitionMs}ms ease, height ${enlargeTransitionMs}ms ease, opacity ${enlargeTransitionMs}ms ease;
                pointer-events: none;
            `;

            const image = document.createElement("img");
            image.src = src;
            image.alt = alt;
            image.style.cssText = `
                width: 100%;
                height: 100%;
                object-fit: cover;
                filter: ${grayscale ? "grayscale(1)" : "none"};
            `;

            overlay.appendChild(image);
            rootRef.current.appendChild(overlay);
            openedOverlayRef.current = overlay;

            const width = parseFloat(openedImageWidth) || frameRect.width;
            const height = parseFloat(openedImageHeight) || frameRect.height;

            requestAnimationFrame(() => {
                overlay.style.left = `${frameRect.left - rootRect.left + (frameRect.width - width) / 2}px`;
                overlay.style.top = `${frameRect.top - rootRect.top + (frameRect.height - height) / 2}px`;
                overlay.style.width = openedImageWidth;
                overlay.style.height = openedImageHeight;
            });
        },
        [
            enlargeTransitionMs,
            grayscale,
            openedImageBorderRadius,
            openedImageHeight,
            openedImageWidth,
        ]
    );

    useEffect(() => {
        const scrim = scrimRef.current;
        if (!scrim) return;

        scrim.addEventListener("click", closeImage);

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") closeImage();
        };

        window.addEventListener("keydown", onKeyDown);

        return () => {
            scrim.removeEventListener("click", closeImage);
            window.removeEventListener("keydown", onKeyDown);
        };
    }, [closeImage]);

    useEffect(() => {
        return () => {
            document.body.classList.remove("dg-scroll-lock");
        };
    }, []);

    const cssStyles = `
        .sphere-root {
            --radius: 520px;
            --viewer-pad: 72px;
            --circ: calc(var(--radius) * 3.14);
            --rot-y: calc((360deg / var(--segments-x)) / 2);
            --rot-x: calc((360deg / var(--segments-y)) / 2);
            --item-width: calc(var(--circ) / var(--segments-x));
            --item-height: calc(var(--circ) / var(--segments-y));
        }

        .sphere-root * {
            box-sizing: border-box;
        }

        .sphere,
        .sphere-item,
        .item__image {
            transform-style: preserve-3d;
        }

        .stage {
            width: 100%;
            height: 100%;
            display: grid;
            place-items: center;
            position: absolute;
            inset: 0;
            margin: auto;
            perspective: calc(var(--radius) * 2);
            perspective-origin: 50% 50%;
        }

        .sphere {
            position: absolute;
            transform: translateZ(calc(var(--radius) * -1)) rotateX(0deg) rotateY(0deg);
            will-change: transform;
        }

        .sphere-item {
            width: calc(var(--item-width) * var(--item-size-x));
            height: calc(var(--item-height) * var(--item-size-y));
            position: absolute;
            top: -999px;
            bottom: -999px;
            left: -999px;
            right: -999px;
            margin: auto;
            transform-origin: 50% 50%;
            backface-visibility: hidden;
            transform:
                rotateY(calc(var(--rot-y) * (var(--offset-x) + ((var(--item-size-x) - 1) / 2))))
                rotateX(calc(var(--rot-x) * (var(--offset-y) - ((var(--item-size-y) - 1) / 2))))
                translateZ(var(--radius));
        }

        .item__image {
            position: absolute;
            inset: 10px;
            overflow: hidden;
            cursor: pointer;
            border-radius: var(--tile-radius, 26px);
            backface-visibility: hidden;
            pointer-events: auto;
            transform: translateZ(0);
        }

        .sphere-root[data-enlarging="true"] .scrim {
            opacity: 1 !important;
            pointer-events: auto !important;
        }

        body.dg-scroll-lock {
            overflow: hidden !important;
            overscroll-behavior: contain !important;
        }
    `;

    return (
        <>
            <style dangerouslySetInnerHTML={{ __html: cssStyles }} />

            <div
                ref={rootRef}
                className="sphere-root relative h-full w-full"
                style={
                    {
                        "--segments-x": segments,
                        "--segments-y": segments,
                        "--overlay-blur-color": overlayBlurColor,
                        "--tile-radius": imageBorderRadius,
                        "--enlarge-radius": openedImageBorderRadius,
                        "--image-filter": grayscale ? "grayscale(1)" : "none",
                    } as CSSProperties
                }
            >
                <main
                    ref={mainRef}
                    className="absolute inset-0 grid select-none place-items-center overflow-hidden"
                    style={{ touchAction: "none", WebkitUserSelect: "none" }}
                >
                    <div className="stage">
                        <div ref={sphereRef} className="sphere">
                            {items.map((item, index) => (
                                <div
                                    key={`${item.x}-${item.y}-${index}`}
                                    className="sphere-item"
                                    data-src={item.src}
                                    data-alt={item.alt}
                                    style={
                                        {
                                            "--offset-x": item.x,
                                            "--offset-y": item.y,
                                            "--item-size-x": item.sizeX,
                                            "--item-size-y": item.sizeY,
                                        } as CSSProperties
                                    }
                                >
                                    <div
                                        className="item__image bg-gray-200"
                                        data-src={item.src}
                                        data-alt={item.alt}
                                        role="button"
                                        tabIndex={0}
                                        aria-label={item.alt || "Open image"}
                                        onClick={(event) => openImage(event.currentTarget)}
                                    >
                                        <img
                                            src={item.src}
                                            draggable={false}
                                            alt={item.alt}
                                            className="h-full w-full object-cover pointer-events-none"
                                            style={{
                                                backfaceVisibility: "hidden",
                                                filter: `var(--image-filter, ${grayscale ? "grayscale(1)" : "none"})`,
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="pointer-events-none absolute inset-0 z-3 bg-transparent" />

                    <div
                        ref={viewerRef}
                        className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center"
                        style={{ padding: "var(--viewer-pad)" }}
                    >
                        <div
                            ref={scrimRef}
                            className="scrim absolute inset-0 z-10 opacity-0 transition-opacity duration-300"
                            style={{
                                background: "rgba(0,0,0,0.45)",
                                backdropFilter: "blur(3px)",
                            }}
                        />

                        <div
                            ref={frameRef}
                            className="viewer-frame flex aspect-square h-full"
                            style={{
                                borderRadius: `var(--enlarge-radius, ${openedImageBorderRadius})`,
                            }}
                        />
                    </div>
                </main>
            </div>
        </>
    );
}