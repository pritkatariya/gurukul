import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  FaAlignLeft,
  FaCode,
  FaCompress,
  FaCrosshairs,
  FaExpand,
  FaHeading,
  FaImage,
  FaMinus,
  FaPlus,
  FaRegImages,
  FaRegSquare,
  FaShareNodes,
  FaSquare,
  FaTrash,
  FaXmark,
} from "react-icons/fa6";
import RightClick from "./Editor-functions/RightClick";
import ResizeHandles from "./Editor-functions/ResizeHandles";
import Dock from "./Editor-functions/Dock";
import Carousel from "./Editor-functions/Carousel";
import PropertiesPanel, { defaultStyles } from "./Editor-functions/PropertiesPanel";
import LogicPanel from "./Editor-functions/LogicPanel";
import ConnectionLines from "./Editor-functions/ConnectionLines";
import { openViewCodeWindow } from "./Editor-functions/ViewCodeWindow";
import type { CanvasElement, Connection, DockItemData, ElementEvent, PanState, ResizeDirection, ElementStyles } from "./Editor-functions/EditorTypes";
import { ARTBOARD_PRESETS } from "./Editor-functions/EditorTypes";
import {
  snapToGrid,
  screenToWorld,
  zoomAtPoint,
  zoomAtCenter,
  panByWheel,
  fitArtboardToViewport,
  centerArtboard,
} from "./utils/editorMath";

const STORAGE_KEY = "canvas-event-editor-v4";

const ZOOM_STEP = 0.05;
const ZOOM_WHEEL_FACTOR = 1.04;

const createDefaultCards = () => [
  { id: crypto.randomUUID(), title: "Card One", description: "Add image and details", image: "" },
  { id: crypto.randomUUID(), title: "Card Two", description: "Beautiful event card", image: "" },
];

const normalizeElement = (el: Partial<CanvasElement>): CanvasElement => {
  const type = el.type || "text";
  return {
    id: el.id || crypto.randomUUID(),
    type,
    x: typeof el.x === "number" ? el.x : 60,
    y: typeof el.y === "number" ? el.y : 60,
    width: typeof el.width === "number" ? el.width : type === "carousel" ? 360 : type === "card" ? 320 : 280,
    height: typeof el.height === "number" ? el.height : type === "carousel" ? 280 : type === "card" ? 200 : 80,
    text: el.text || (type === "carousel" ? "Carousel" : type === "image" ? "" : "Text"),
    imageUrl: el.imageUrl || "",
    zIndex: typeof el.zIndex === "number" ? el.zIndex : 0,
    styles: { ...defaultStyles, ...(el.styles || {}) },
    cards: type === "carousel" ? (el.cards ?? createDefaultCards()) : el.cards,
    events: el.events ?? [],
    customCode: el.customCode || "",
    codeLanguage: el.codeLanguage || "typescript",
  };
};

const defaultElements: CanvasElement[] = [
  normalizeElement({ id: crypto.randomUUID(), type: "heading", x: 60, y: 60, width: 400, height: 80, text: "Annual Event 2026" }),
];

const normalizeElements = (v: unknown): CanvasElement[] => {
  if (!Array.isArray(v)) return defaultElements;
  return v.map(normalizeElement);
};

const normalizeConnections = (v: unknown): Connection[] => {
  if (!Array.isArray(v)) return [];
  return v.filter((c: Record<string, unknown>) => c.id && c.sourceElementId && c.targetElementId) as Connection[];
};

type EventEditorProps = { onClose?: () => void };

export default function EventEditor({ onClose }: EventEditorProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const dragRef = useRef<{ id: string; offsetX: number; offsetY: number } | null>(null);
  const resizeRef = useRef<{
    id: string; direction: ResizeDirection;
    startClientX: number; startClientY: number;
    startX: number; startY: number; startWidth: number; startHeight: number;
  } | null>(null);
  const panRef = useRef<{ startX: number; startY: number; startPanX: number; startPanY: number } | null>(null);
  const spaceRef = useRef(false);
  const isPanningRef = useRef(false);

  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState<PanState>({ x: 0, y: 0 });
  const [cursorStyle, setCursorStyle] = useState("default");

  const [elements, setElements] = useState<CanvasElement[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return normalizeElements(JSON.parse(saved).elements);
    } catch { /* */ }
    return defaultElements;
  });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, elementId: null as string | null });
  const [toast, setToast] = useState<string | null>(null);
  const [worldCursor, setWorldCursor] = useState({ x: 0, y: 0 });

  const [artboardPreset, setArtboardPreset] = useState("Desktop");
  const [artboardWidth, setArtboardWidth] = useState(1440);
  const [artboardHeight, setArtboardHeight] = useState(900);
  const [customW, setCustomW] = useState(1440);
  const [customH, setCustomH] = useState(900);
  const [showPresetPanel, setShowPresetPanel] = useState(false);

  // Logic state
  const [logicPanelOpen, setLogicPanelOpen] = useState(false);
  const [connections, setConnections] = useState<Connection[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return normalizeConnections(JSON.parse(saved).connections);
    } catch { /* */ }
    return [];
  });
  const [selectedConnectionId, setSelectedConnectionId] = useState<string | null>(null);

  // Restore persisted state
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const p = JSON.parse(saved);
        if (typeof p.zoom === "number") setZoom(p.zoom);
        if (p.pan) setPan(p.pan);
        if (p.artboardPreset) setArtboardPreset(p.artboardPreset);
        if (typeof p.artboardWidth === "number") setArtboardWidth(p.artboardWidth);
        if (typeof p.artboardHeight === "number") setArtboardHeight(p.artboardHeight);
      }
    } catch { /* */ }
  }, []);

  const selectedElement = useMemo(() => elements.find((el) => el.id === selectedId) ?? null, [elements, selectedId]);

  // Persistence
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      elements, artboardPreset, artboardWidth, artboardHeight, zoom, pan, connections,
    }));
  }, [elements, artboardPreset, artboardWidth, artboardHeight, zoom, pan, connections]);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 1800);
  }, []);

  // --- Zoom helpers ---
  const zoomIn = useCallback(() => {
    const rect = viewportRef.current?.getBoundingClientRect();
    if (!rect) return;
    const result = zoomAtCenter(zoom, pan, 1 + ZOOM_STEP, rect);
    setZoom(result.zoom);
    setPan(result.pan);
  }, [zoom, pan]);

  const zoomOut = useCallback(() => {
    const rect = viewportRef.current?.getBoundingClientRect();
    if (!rect) return;
    const result = zoomAtCenter(zoom, pan, 1 / (1 + ZOOM_STEP), rect);
    setZoom(result.zoom);
    setPan(result.pan);
  }, [zoom, pan]);

  const resetZoom = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  const zoom100 = useCallback(() => {
    const rect = viewportRef.current?.getBoundingClientRect();
    if (!rect) return;
    const newPan = centerArtboard(artboardWidth, artboardHeight, 1, rect);
    setZoom(1);
    setPan(newPan);
  }, [artboardWidth, artboardHeight]);

  const fitToScreen = useCallback(() => {
    const rect = viewportRef.current?.getBoundingClientRect();
    if (!rect) return;
    const result = fitArtboardToViewport(artboardWidth, artboardHeight, rect);
    setZoom(result.zoom);
    setPan(result.pan);
  }, [artboardWidth, artboardHeight]);

  const centerCanvas = useCallback(() => {
    const rect = viewportRef.current?.getBoundingClientRect();
    if (!rect) return;
    const newPan = centerArtboard(artboardWidth, artboardHeight, zoom, rect);
    setPan(newPan);
  }, [artboardWidth, artboardHeight, zoom]);

  // --- Keyboard shortcuts ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === " ") {
        e.preventDefault();
        spaceRef.current = true;
        setCursorStyle("grab");
      }
      if (e.key === "Delete" || e.key === "Backspace") {
        if (selectedId && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement)) {
          e.preventDefault();
          deleteElement(selectedId);
        }
      }
      if (e.ctrlKey || e.metaKey) {
        if (e.key === "d" || e.key === "D") { e.preventDefault(); duplicateSelected(); }
        if (e.key === "s" || e.key === "S") { e.preventDefault(); showToast("Saved"); }
        if (e.key === "0") { e.preventDefault(); resetZoom(); }
        if (e.key === "1") { e.preventDefault(); zoom100(); }
        if (e.altKey && (e.key === "f" || e.key === "F")) { e.preventDefault(); fitToScreen(); }
        if (e.key === "=" || e.key === "+") { e.preventDefault(); zoomIn(); }
        if (e.key === "-") { e.preventDefault(); zoomOut(); }
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === " ") {
        spaceRef.current = false;
        if (!isPanningRef.current) setCursorStyle("default");
      }
    };
    document.addEventListener("keydown", handleKeyDown, { capture: true });
    document.addEventListener("keyup", handleKeyUp);
    return () => {
      document.removeEventListener("keydown", handleKeyDown, { capture: true });
      document.removeEventListener("keyup", handleKeyUp);
    };
  }, [selectedId, zoomIn, zoomOut, resetZoom, zoom100, fitToScreen]);

  // --- Wheel: zoom (ctrl) and pan (no ctrl) ---
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      const rect = viewportRef.current?.getBoundingClientRect();
      if (!rect) return;
      if (!viewportRef.current?.contains(e.target as Node)) return;

      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        e.stopImmediatePropagation();
        const factor = e.deltaY < 0 ? ZOOM_WHEEL_FACTOR : 1 / ZOOM_WHEEL_FACTOR;
        const result = zoomAtPoint(zoom, pan, factor, e.clientX, e.clientY, rect);
        setZoom(result.zoom);
        setPan(result.pan);
      } else {
        e.preventDefault();
        e.stopImmediatePropagation();
        const dx = e.shiftKey ? e.deltaY : e.deltaX;
        const dy = e.shiftKey ? 0 : e.deltaY;
        setPan(panByWheel(pan, dx, dy));
      }
    };
    document.addEventListener("wheel", handleWheel, { capture: true, passive: false });
    return () => document.removeEventListener("wheel", handleWheel, { capture: true });
  }, [zoom, pan]);

  // --- Pointer move / up ---
  useEffect(() => {
    const handleMove = (e: PointerEvent) => {
      const rect = viewportRef.current?.getBoundingClientRect();
      if (rect) {
        const w = screenToWorld(e.clientX, e.clientY, pan, zoom, rect);
        setWorldCursor({ x: Math.round(w.x), y: Math.round(w.y) });
      }

      if (panRef.current) {
        const dx = e.clientX - panRef.current.startX;
        const dy = e.clientY - panRef.current.startY;
        setPan({ x: panRef.current.startPanX + dx, y: panRef.current.startPanY + dy });
        setCursorStyle("grabbing");
        return;
      }

      if (dragRef.current && rect) {
        const world = screenToWorld(e.clientX, e.clientY, pan, zoom, rect);
        const nx = snapToGrid(world.x - dragRef.current.offsetX);
        const ny = snapToGrid(world.y - dragRef.current.offsetY);
        setElements((prev) =>
          prev.map((el) =>
            el.id === dragRef.current?.id
              ? { ...el, x: Math.max(0, Math.min(artboardWidth - el.width, nx)), y: Math.max(0, Math.min(artboardHeight - el.height, ny)) }
              : el
          )
        );
      }

      if (resizeRef.current && rect) {
        const r = resizeRef.current;
        const dx = (e.clientX - r.startClientX) / zoom;
        const dy = (e.clientY - r.startClientY) / zoom;
        setElements((prev) =>
          prev.map((el) => {
            if (el.id !== r.id) return el;
            let nx = r.startX, ny = r.startY, nw = r.startWidth, nh = r.startHeight;
            if (r.direction.includes("right")) nw = snapToGrid(r.startWidth + dx);
            if (r.direction.includes("bottom")) nh = snapToGrid(r.startHeight + dy);
            if (r.direction.includes("left")) { nx = snapToGrid(r.startX + dx); nw = snapToGrid(r.startWidth - dx); }
            if (r.direction.includes("top")) { ny = snapToGrid(r.startY + dy); nh = snapToGrid(r.startHeight - dy); }
            if (nw < 40) { if (r.direction.includes("left")) nx = r.startX + r.startWidth - 40; nw = 40; }
            if (nh < 30) { if (r.direction.includes("top")) ny = r.startY + r.startHeight - 30; nh = 30; }
            nx = Math.max(0, Math.min(artboardWidth - nw, nx));
            ny = Math.max(0, Math.min(artboardHeight - nh, ny));
            return { ...el, x: nx, y: ny, width: Math.min(nw, artboardWidth - nx), height: Math.min(nh, artboardHeight - ny) };
          })
        );
      }
    };

    const handleUp = () => {
      if (panRef.current) {
        isPanningRef.current = false;
        setCursorStyle(spaceRef.current ? "grab" : "default");
      }
      dragRef.current = null;
      resizeRef.current = null;
      panRef.current = null;
    };

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
    };
  }, [zoom, pan, artboardWidth, artboardHeight]);

  // --- Element operations ---
  const addElement = (type: CanvasElement["type"]) => {
    const el = normalizeElement({
      id: crypto.randomUUID(),
      type,
      x: 60, y: 60,
      width: type === "carousel" ? 360 : type === "card" ? 320 : type === "button" ? 200 : type === "image" ? 280 : 320,
      height: type === "carousel" ? 280 : type === "card" ? 200 : type === "button" ? 56 : type === "image" ? 200 : 80,
      text:
        type === "heading" ? "Event Heading" :
        type === "button" ? "Register Now" :
        type === "carousel" ? "Carousel" :
        type === "image" ? "" :
        type === "card" ? "Card Container" :
        "Write event details here",
      styles: {
        ...defaultStyles,
        fontSize: type === "text" ? 16 : type === "button" ? 15 : type === "card" ? 14 : 28,
        fontWeight: type === "heading" ? 800 : type === "button" ? 700 : 400,
        color: type === "button" ? "#ffffff" : "#0f172a",
        background: type === "button" ? "#2563eb" : type === "card" ? "#f8fafc" : "#ffffff",
        radius: type === "card" ? 16 : 12,
      },
      cards: type === "carousel" ? createDefaultCards() : undefined,
    });
    setElements((prev) => [...prev, el]);
    setSelectedId(el.id);
  };

  const deleteElement = useCallback((id: string) => {
    setElements((prev) => prev.filter((el) => el.id !== id));
    setSelectedId((prev) => (prev === id ? null : prev));
    setConnections((prev) => prev.filter((c) => c.sourceElementId !== id && c.targetElementId !== id));
    setContextMenu({ visible: false, x: 0, y: 0, elementId: null });
    showToast("Deleted");
  }, [showToast]);

  const duplicateSelected = useCallback(() => {
    if (!selectedElement) return;
    const dup = normalizeElement({
      ...selectedElement,
      id: crypto.randomUUID(),
      x: selectedElement.x + 20,
      y: selectedElement.y + 20,
      cards: selectedElement.type === "carousel"
        ? (selectedElement.cards ?? []).map((c) => ({ ...c, id: crypto.randomUUID() }))
        : undefined,
      events: [],
    });
    setElements((prev) => [...prev, dup]);
    setSelectedId(dup.id);
    showToast("Duplicated");
  }, [selectedElement, showToast]);

  const addCarouselCard = (id: string) => {
    setElements((prev) =>
      prev.map((el) =>
        el.id === id && el.type === "carousel"
          ? { ...el, cards: [...(el.cards ?? []), { id: crypto.randomUUID(), title: "New Card", description: "Card description", image: "" }] }
          : el
      )
    );
    setContextMenu({ visible: false, x: 0, y: 0, elementId: null });
  };

  const bringForward = (id: string) => {
    setElements((prev) => prev.map((el) => el.id === id ? { ...el, zIndex: el.zIndex + 1 } : el));
  };
  const sendBackward = (id: string) => {
    setElements((prev) => prev.map((el) => el.id === id ? { ...el, zIndex: Math.max(0, el.zIndex - 1) } : el));
  };

  const updateElement = (patch: Partial<CanvasElement>) => {
    if (!selectedId) return;
    setElements((prev) => prev.map((el) => el.id === selectedId ? normalizeElement({ ...el, ...patch }) : el));
  };

  const updateStyle = (key: keyof ElementStyles, value: string | number) => {
    if (!selectedId) return;
    setElements((prev) => prev.map((el) =>
      el.id === selectedId ? { ...el, styles: { ...defaultStyles, ...el.styles, [key]: value } } : el
    ));
  };

  const updateCard = (cardId: string, patch: Partial<NonNullable<CanvasElement["cards"]>[number]>) => {
    if (!selectedElement || selectedElement.type !== "carousel") return;
    setElements((prev) => prev.map((el) =>
      el.id === selectedElement.id
        ? { ...el, cards: el.cards?.map((c) => (c.id === cardId ? { ...c, ...patch } : c)) }
        : el
    ));
  };

  const deleteCard = (cardId: string) => {
    if (!selectedElement || selectedElement.type !== "carousel") return;
    setElements((prev) => prev.map((el) =>
      el.id === selectedElement.id
        ? { ...el, cards: el.cards?.filter((c) => c.id !== cardId) }
        : el
    ));
  };

  const uploadCardImage = (cardId: string, file: File) => {
    updateCard(cardId, { image: URL.createObjectURL(file) });
  };

  const uploadImage = (file: File) => {
    if (!selectedId) return;
    updateElement({ imageUrl: URL.createObjectURL(file) });
  };

  // --- Logic operations ---
  const addConnection = useCallback((conn: Connection) => {
    setConnections((prev) => [...prev, conn]);
    showToast("Connection added");
  }, [showToast]);

  const deleteConnection = useCallback((id: string) => {
    setConnections((prev) => prev.filter((c) => c.id !== id));
    setSelectedConnectionId(null);
    showToast("Connection removed");
  }, [showToast]);

  const updateConnection = useCallback((id: string, patch: Partial<Connection>) => {
    setConnections((prev) => prev.map((c) => c.id === id ? { ...c, ...patch } : c));
  }, []);

  const addEvent = useCallback((elementId: string, event: ElementEvent) => {
    setElements((prev) => prev.map((el) =>
      el.id === elementId ? { ...el, events: [...(el.events ?? []), event] } : el
    ));
    showToast("Event added");
  }, [showToast]);

  const deleteEvent = useCallback((elementId: string, eventId: string) => {
    setElements((prev) => prev.map((el) =>
      el.id === elementId ? { ...el, events: (el.events ?? []).filter((e) => e.id !== eventId) } : el
    ));
  }, []);

  const updateCode = useCallback((elementId: string, code: string, language: string) => {
    setElements((prev) => prev.map((el) =>
      el.id === elementId ? { ...el, customCode: code, codeLanguage: language } : el
    ));
  }, []);

  const startDrag = (e: React.PointerEvent<HTMLDivElement>, el: CanvasElement) => {
    if (spaceRef.current || isPanningRef.current) return;
    e.stopPropagation();
    const rect = viewportRef.current?.getBoundingClientRect();
    if (!rect) return;
    const world = screenToWorld(e.clientX, e.clientY, pan, zoom, rect);
    dragRef.current = { id: el.id, offsetX: world.x - el.x, offsetY: world.y - el.y };
    setSelectedId(el.id);
    setSelectedConnectionId(null);
    setContextMenu({ visible: false, x: 0, y: 0, elementId: null });
  };

  const startResize = (e: React.PointerEvent<HTMLButtonElement>, direction: ResizeDirection, el: CanvasElement) => {
    e.preventDefault();
    e.stopPropagation();
    resizeRef.current = {
      id: el.id, direction,
      startClientX: e.clientX, startClientY: e.clientY,
      startX: el.x, startY: el.y, startWidth: el.width, startHeight: el.height,
    };
    setSelectedId(el.id);
  };

  const startPan = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button === 1 || (e.button === 0 && spaceRef.current)) {
      e.preventDefault();
      isPanningRef.current = true;
      panRef.current = { startX: e.clientX, startY: e.clientY, startPanX: pan.x, startPanY: pan.y };
      setCursorStyle("grabbing");
    }
  };

  const closeEditor = () => {
    if (onClose) { onClose(); return; }
    if (window.history.length > 1) window.history.back();
  };

  const selectPreset = (name: string) => {
    if (name === "Custom") {
      setArtboardPreset("Custom");
      setShowPresetPanel(true);
      return;
    }
    const preset = ARTBOARD_PRESETS.find((p) => p.name === name);
    if (!preset) return;
    setArtboardPreset(name);
    setArtboardWidth(preset.width);
    setArtboardHeight(preset.height);
    setShowPresetPanel(false);
    setTimeout(() => {
      const rect = viewportRef.current?.getBoundingClientRect();
      if (rect) {
        const result = fitArtboardToViewport(preset.width, preset.height, rect);
        setZoom(result.zoom);
        setPan(result.pan);
      }
    }, 50);
  };

  const applyCustomSize = () => {
    setArtboardWidth(customW);
    setArtboardHeight(customH);
    setShowPresetPanel(false);
    setTimeout(() => {
      const rect = viewportRef.current?.getBoundingClientRect();
      if (rect) {
        const result = fitArtboardToViewport(customW, customH, rect);
        setZoom(result.zoom);
        setPan(result.pan);
      }
    }, 50);
  };

  const dockItems: DockItemData[] = [
    { icon: <FaHeading size={15} />, label: "Heading", onClick: () => addElement("heading") },
    { icon: <FaAlignLeft size={15} />, label: "Text", onClick: () => addElement("text") },
    { icon: <FaRegSquare size={15} />, label: "Button", onClick: () => addElement("button") },
    { icon: <FaImage size={15} />, label: "Image", onClick: () => addElement("image") },
    { icon: <FaSquare size={15} />, label: "Card", onClick: () => addElement("card") },
    { icon: <FaRegImages size={15} />, label: "Carousel", onClick: () => addElement("carousel") },
    { icon: <FaShareNodes size={15} />, label: "Logic", onClick: () => setLogicPanelOpen((p) => !p) },
    { icon: <FaCode size={15} />, label: "View Code", onClick: () => openViewCodeWindow(elements, artboardWidth, artboardHeight, connections) },
    { icon: <FaMinus size={15} />, label: "Zoom Out", onClick: zoomOut },
    { icon: <span className="text-[9px] font-black">{Math.round(zoom * 100)}%</span>, label: "Reset Zoom", onClick: resetZoom },
    { icon: <FaPlus size={15} />, label: "Zoom In", onClick: zoomIn },
    { icon: <FaExpand size={15} />, label: "Fit to Screen", onClick: fitToScreen },
    { icon: <FaCrosshairs size={15} />, label: "Center Canvas", onClick: centerCanvas },
    { icon: <FaTrash size={15} />, label: "Clear", onClick: () => { setElements([]); setSelectedId(null); setConnections([]); }, className: "text-red-500" },
    { icon: <FaXmark size={15} />, label: "Close", onClick: closeEditor },
  ];

  // Ruler ticks
  const renderRuler = (orientation: "h" | "v") => {
    const step = 100;
    const max = orientation === "h" ? artboardWidth : artboardHeight;
    const ticks: React.ReactNode[] = [];
    for (let i = 0; i <= max; i += step) {
      const pos = i * zoom;
      ticks.push(
        <div key={i} className="absolute" style={orientation === "h"
          ? { left: pan.x + pos, top: 0, height: "100%" }
          : { top: pan.y + pos, left: 0, width: "100%" }
        }>
          <span className={`text-[8px] font-bold text-slate-400 ${orientation === "h" ? "ml-0.5 mt-px block" : "ml-px block"}`}
            style={orientation === "v" ? { writingMode: "vertical-lr", transform: "rotate(180deg)" } : undefined}
          >
            {i}
          </span>
          <div className={orientation === "h" ? "absolute bottom-0 h-1.5 w-px bg-slate-300" : "absolute right-0 w-1.5 h-px bg-slate-300"} />
        </div>
      );
    }
    return ticks;
  };

  const minimapScale = 0.06;
  const minimapW = Math.min(160, artboardWidth * minimapScale * zoom + 20);
  const minimapH = Math.min(120, artboardHeight * minimapScale * zoom + 20);

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col overflow-hidden bg-[#e8ecf1] text-slate-900 select-none">
      {/* Top bar */}
      <div className="relative z-30 flex h-9 items-center border-b border-slate-200/60 bg-white/80 px-3 backdrop-blur-xl">
        <button
          onClick={() => setShowPresetPanel(!showPresetPanel)}
          className="flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-1 text-[11px] font-bold text-slate-700 transition-colors hover:bg-slate-200"
        >
          <FaCompress size={10} />
          {artboardPreset} ({artboardWidth} x {artboardHeight})
        </button>

        {showPresetPanel && (
          <div className="absolute left-3 top-full mt-1 z-50 w-56 rounded-xl bg-white/95 p-2 shadow-[0_12px_40px_rgba(15,23,42,0.16)] backdrop-blur-xl ring-1 ring-slate-200/50">
            {ARTBOARD_PRESETS.map((p) => (
              <button
                key={p.name}
                onClick={() => selectPreset(p.name)}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-[12px] font-semibold transition-colors ${
                  artboardPreset === p.name ? "bg-blue-50 text-blue-700" : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <span>{p.name}</span>
                {p.width > 0 && <span className="text-[10px] text-slate-400">{p.width} x {p.height}</span>}
              </button>
            ))}
            {artboardPreset === "Custom" && (
              <div className="mt-2 grid grid-cols-2 gap-2 border-t border-slate-100 pt-2">
                <input type="number" value={customW} onChange={(e) => setCustomW(Number(e.target.value))} placeholder="Width"
                  className="h-8 rounded-lg bg-slate-50 px-2 text-[12px] font-semibold outline-none ring-1 ring-slate-200 focus:ring-blue-300" />
                <input type="number" value={customH} onChange={(e) => setCustomH(Number(e.target.value))} placeholder="Height"
                  className="h-8 rounded-lg bg-slate-50 px-2 text-[12px] font-semibold outline-none ring-1 ring-slate-200 focus:ring-blue-300" />
                <button onClick={applyCustomSize} className="col-span-2 rounded-lg bg-blue-600 py-1.5 text-[12px] font-bold text-white hover:bg-blue-700">
                  Apply
                </button>
              </div>
            )}
          </div>
        )}

        <div className="ml-auto flex items-center gap-1.5">
          <button onClick={fitToScreen} className="rounded-lg bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-600 hover:bg-slate-200">Fit</button>
          <button onClick={zoom100} className="rounded-lg bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-600 hover:bg-slate-200">100%</button>
        </div>
      </div>

      {/* Main workspace */}
      <div className="flex flex-1 overflow-hidden">
        {/* Vertical ruler */}
        <div className="relative w-5 flex-shrink-0 overflow-hidden border-r border-slate-200/60 bg-slate-50/80">
          {renderRuler("v")}
        </div>

        {/* Viewport */}
        <div
          ref={viewportRef}
          className="relative flex-1 overflow-hidden"
          style={{ cursor: cursorStyle }}
          onPointerDown={(e) => {
            startPan(e);
            if (!spaceRef.current && !isPanningRef.current && e.button === 0) {
              setSelectedId(null);
              setSelectedConnectionId(null);
              setContextMenu({ visible: false, x: 0, y: 0, elementId: null });
            }
          }}
          onContextMenu={(e) => e.preventDefault()}
        >
          {/* Horizontal ruler */}
          <div className="absolute left-0 right-0 top-0 z-10 h-5 overflow-hidden border-b border-slate-200/60 bg-slate-50/80">
            {renderRuler("h")}
          </div>

          {/* Canvas world */}
          <div
            ref={canvasRef}
            className="absolute"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: "0 0",
              width: 0,
              height: 0,
            }}
          >
            {/* Artboard */}
            <div
              className="absolute rounded-xl bg-white shadow-[0_2px_20px_rgba(15,23,42,0.08)] ring-1 ring-slate-200/40"
              style={{ left: 0, top: 0, width: artboardWidth, height: artboardHeight }}
            >
              <div className="absolute -top-5 left-0 text-[9px] font-bold text-slate-400">
                {artboardWidth} x {artboardHeight}
              </div>

              {/* Guide lines for selected element */}
              {selectedElement && (
                <>
                  <div className="pointer-events-none absolute top-0 z-30 h-full w-px bg-blue-500/50" style={{ left: selectedElement.x + selectedElement.width / 2 }} />
                  <div className="pointer-events-none absolute left-0 z-30 h-px w-full bg-blue-500/50" style={{ top: selectedElement.y + selectedElement.height / 2 }} />
                  <div className="pointer-events-none absolute top-0 z-30 h-full w-px bg-blue-400/30" style={{ left: selectedElement.x }} />
                  <div className="pointer-events-none absolute left-0 z-30 h-px w-full bg-blue-400/30" style={{ top: selectedElement.y }} />
                  <div className="pointer-events-none absolute top-0 z-30 h-full w-px bg-blue-400/30" style={{ left: selectedElement.x + selectedElement.width }} />
                  <div className="pointer-events-none absolute left-0 z-30 h-px w-full bg-blue-400/30" style={{ top: selectedElement.y + selectedElement.height }} />
                </>
              )}

              {/* Elements */}
              {elements
                .slice()
                .sort((a, b) => a.zIndex - b.zIndex)
                .map((el) => {
                  const s: ElementStyles = { ...defaultStyles, ...(el.styles ?? {}) };
                  const isSelected = selectedId === el.id;
                  return (
                    <div
                      key={el.id}
                      onPointerDown={(e) => startDrag(e, el)}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setSelectedId(el.id);
                        setContextMenu({ visible: true, x: e.clientX, y: e.clientY, elementId: el.id });
                      }}
                      className={`absolute ${spaceRef.current ? "" : "cursor-grab"} active:cursor-grabbing ${
                        isSelected ? "ring-2 ring-blue-500/70 ring-offset-0" : ""
                      }`}
                      style={{
                        left: el.x,
                        top: el.y,
                        width: el.width,
                        height: el.height,
                        borderRadius: s.radius,
                        opacity: s.opacity / 100,
                        zIndex: el.zIndex,
                        transform: s.rotation ? `rotate(${s.rotation}deg)` : undefined,
                        border: s.borderWidth > 0 ? `${s.borderWidth}px solid ${s.borderColor}` : undefined,
                        boxShadow: s.boxShadow,
                        padding: el.type === "card" ? s.padding : 0,
                      }}
                    >
                      {el.type === "heading" && (
                        <div className="flex h-full w-full items-center px-4" style={{
                          color: s.color, background: s.background, fontSize: s.fontSize,
                          fontWeight: s.fontWeight, fontFamily: s.fontFamily, borderRadius: s.radius,
                          textShadow: s.textShadow, letterSpacing: "-0.02em",
                        }}>
                          {el.text}
                        </div>
                      )}
                      {el.type === "text" && (
                        <div className="flex h-full w-full items-start px-4 pt-2" style={{
                          color: s.color, background: s.background, fontSize: s.fontSize,
                          fontWeight: s.fontWeight, fontFamily: s.fontFamily, borderRadius: s.radius, textShadow: s.textShadow,
                        }}>
                          {el.text}
                        </div>
                      )}
                      {el.type === "button" && (
                        <div className="flex h-full w-full items-center justify-center px-4" style={{
                          color: s.color, background: s.background, fontSize: s.fontSize,
                          fontWeight: s.fontWeight, fontFamily: s.fontFamily, borderRadius: s.radius,
                          textShadow: s.textShadow, boxShadow: s.boxShadow,
                        }}>
                          {el.text}
                        </div>
                      )}
                      {el.type === "image" && (
                        <div className="h-full w-full overflow-hidden" style={{ borderRadius: s.radius, background: s.background }}>
                          {el.imageUrl ? (
                            <img src={el.imageUrl} alt="" className="h-full w-full"
                              style={{ objectFit: s.objectFit as "cover" | "contain" | "fill" }} draggable={false} />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-slate-100 text-slate-400">
                              <FaImage size={24} />
                            </div>
                          )}
                        </div>
                      )}
                      {el.type === "card" && (
                        <div className="h-full w-full" style={{
                          background: s.background, borderRadius: s.radius, padding: s.padding,
                          color: s.color, fontSize: s.fontSize, fontFamily: s.fontFamily,
                        }}>
                          {el.text}
                        </div>
                      )}
                      {el.type === "carousel" && (
                        <Carousel cards={el.cards ?? createDefaultCards()} baseWidth={el.width} baseHeight={el.height} />
                      )}
                      {isSelected && <ResizeHandles onPointerDown={(e, dir) => startResize(e, dir, el)} />}
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Connection lines overlay */}
          <ConnectionLines
            connections={connections}
            elements={elements}
            pan={pan}
            zoom={zoom}
            selectedConnectionId={selectedConnectionId}
            onSelectConnection={(id) => { setSelectedConnectionId(id); setSelectedId(null); }}
            onDeleteConnection={deleteConnection}
          />

          {/* Infinite grid overlay */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage: `
                radial-gradient(circle, rgba(100,116,139,0.18) 1px, transparent 1px),
                linear-gradient(rgba(100,116,139,0.07) 1px, transparent 1px),
                linear-gradient(90deg, rgba(100,116,139,0.07) 1px, transparent 1px)
              `,
              backgroundSize: `${10 * zoom}px ${10 * zoom}px, ${100 * zoom}px ${100 * zoom}px, ${100 * zoom}px ${100 * zoom}px`,
              backgroundPosition: `${pan.x}px ${pan.y}px`,
            }}
          />

          {/* Minimap */}
          <div className="absolute bottom-4 left-4 z-20 overflow-hidden rounded-xl bg-white/90 shadow-[0_4px_20px_rgba(15,23,42,0.1)] ring-1 ring-slate-200/50 backdrop-blur-xl"
            style={{ width: minimapW, height: minimapH }}
          >
            <div className="relative h-full w-full" style={{ padding: 6 }}>
              <div
                className="absolute rounded-sm bg-white ring-1 ring-slate-300"
                style={{
                  left: 6 + (pan.x / zoom) * minimapScale * zoom,
                  top: 6 + (pan.y / zoom) * minimapScale * zoom,
                  width: artboardWidth * minimapScale * zoom,
                  height: artboardHeight * minimapScale * zoom,
                }}
              />
              {elements.map((el) => (
                <div
                  key={el.id}
                  className="absolute rounded-[1px] bg-blue-400/40"
                  style={{
                    left: 6 + ((el.x + pan.x / zoom) * minimapScale * zoom),
                    top: 6 + ((el.y + pan.y / zoom) * minimapScale * zoom),
                    width: Math.max(2, el.width * minimapScale * zoom),
                    height: Math.max(2, el.height * minimapScale * zoom),
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Status bar */}
      <div className="relative z-30 flex h-6 items-center border-t border-slate-200/60 bg-white/80 px-3 text-[9px] font-semibold text-slate-500 backdrop-blur-xl">
        <span>{Math.round(zoom * 100)}%</span>
        <span className="mx-1.5 text-slate-300">|</span>
        <span>{artboardWidth} x {artboardHeight}</span>
        <span className="mx-1.5 text-slate-300">|</span>
        <span>X: {worldCursor.x} Y: {worldCursor.y}</span>
        <span className="mx-1.5 text-slate-300">|</span>
        <span>Pan: {Math.round(pan.x)}, {Math.round(pan.y)}</span>
        {selectedElement && (
          <>
            <span className="mx-1.5 text-slate-300">|</span>
            <span className="text-blue-600">{selectedElement.type} ({selectedElement.width} x {selectedElement.height})</span>
          </>
        )}
        {connections.length > 0 && (
          <>
            <span className="mx-1.5 text-slate-300">|</span>
            <span className="text-blue-500">{connections.length} connection{connections.length !== 1 ? "s" : ""}</span>
          </>
        )}
      </div>

      {/* Properties panel */}
      {selectedElement && !logicPanelOpen && (
        <PropertiesPanel
          element={selectedElement}
          updateElement={updateElement}
          updateStyle={updateStyle}
          updateCard={updateCard}
          deleteCard={deleteCard}
          uploadCardImage={uploadCardImage}
          uploadImage={uploadImage}
        />
      )}

      {/* Logic panel */}
      <LogicPanel
        open={logicPanelOpen}
        onClose={() => setLogicPanelOpen(false)}
        elements={elements}
        selectedElementId={selectedId}
        connections={connections}
        onAddConnection={addConnection}
        onDeleteConnection={deleteConnection}
        onUpdateConnection={updateConnection}
        onAddEvent={addEvent}
        onDeleteEvent={deleteEvent}
        onUpdateCode={updateCode}
      />

      {/* Dock */}
      <Dock items={dockItems} panelHeight={60} baseItemSize={44} magnification={62} />

      {/* Right-click menu */}
      <RightClick
        visible={contextMenu.visible}
        x={contextMenu.x}
        y={contextMenu.y}
        canAddCard={!!contextMenu.elementId && elements.find((el) => el.id === contextMenu.elementId)?.type === "carousel"}
        onAddCard={() => { if (contextMenu.elementId) addCarouselCard(contextMenu.elementId); }}
        onDelete={() => { if (contextMenu.elementId) deleteElement(contextMenu.elementId); }}
        onDuplicate={duplicateSelected}
        onBringForward={() => { if (contextMenu.elementId) bringForward(contextMenu.elementId); }}
        onSendBackward={() => { if (contextMenu.elementId) sendBackward(contextMenu.elementId); }}
        onClose={() => setContextMenu({ visible: false, x: 0, y: 0, elementId: null })}
      />

      {/* Toast */}
      {toast && (
        <div className="fixed left-1/2 top-12 z-[99999] -translate-x-1/2 rounded-xl bg-slate-800 px-4 py-2 text-sm font-semibold text-white shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}
