import type { CanvasElement, ElementStyles, CarouselCard } from "./EditorTypes";

const defaultStyles: ElementStyles = {
  color: "#0f172a",
  background: "#ffffff",
  fontSize: 28,
  fontWeight: 400,
  fontFamily: "Inter, system-ui, sans-serif",
  radius: 12,
  opacity: 100,
  textShadow: "none",
  boxShadow: "0 4px 16px rgba(15,23,42,0.08)",
  padding: 16,
  borderColor: "#e2e8f0",
  borderWidth: 0,
  rotation: 0,
  objectFit: "cover",
};

export { defaultStyles };

interface PropertiesPanelProps {
  element: CanvasElement;
  updateElement: (patch: Partial<CanvasElement>) => void;
  updateStyle: (key: keyof ElementStyles, value: string | number) => void;
  updateCard: (cardId: string, patch: Partial<CarouselCard>) => void;
  deleteCard: (cardId: string) => void;
  uploadCardImage: (cardId: string, file: File) => void;
  uploadImage: (file: File) => void;
}

export default function PropertiesPanel({
  element,
  updateElement,
  updateStyle,
  updateCard,
  deleteCard,
  uploadCardImage,
  uploadImage,
}: PropertiesPanelProps) {
  const s: ElementStyles = { ...defaultStyles, ...(element.styles ?? {}) };

  return (
    <aside className="fixed right-3 top-3 z-50 max-h-[calc(100vh-100px)] w-[268px] overflow-auto rounded-2xl bg-white/95 p-3.5 shadow-[0_16px_60px_rgba(15,23,42,0.14)] backdrop-blur-xl ring-1 ring-slate-200/50">
      <div className="mb-2.5 flex items-center gap-2">
        <span className="rounded-lg bg-blue-50 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-blue-600">
          {element.type}
        </span>
      </div>

      <div className="grid gap-2">
        <Row2>
          <Field label="X" type="number" value={element.x} onChange={(v) => updateElement({ x: Number(v) })} />
          <Field label="Y" type="number" value={element.y} onChange={(v) => updateElement({ y: Number(v) })} />
        </Row2>
        <Row2>
          <Field label="W" type="number" value={element.width} onChange={(v) => updateElement({ width: Number(v) })} />
          <Field label="H" type="number" value={element.height} onChange={(v) => updateElement({ height: Number(v) })} />
        </Row2>

        {element.type !== "image" && element.type !== "carousel" && (
          <Field label="Text" value={element.text} onChange={(v) => updateElement({ text: v })} />
        )}

        <Row2>
          <ColorField label="Color" value={s.color} onChange={(v) => updateStyle("color", v)} />
          <ColorField label="Fill" value={s.background} onChange={(v) => updateStyle("background", v)} />
        </Row2>

        <Row2>
          <Field label="Size" type="number" value={s.fontSize} onChange={(v) => updateStyle("fontSize", Number(v))} />
          <Field label="Weight" type="number" value={s.fontWeight} onChange={(v) => updateStyle("fontWeight", Number(v))} />
        </Row2>

        <Field label="Font" value={s.fontFamily} onChange={(v) => updateStyle("fontFamily", v)} />
        <Row2>
          <Field label="Radius" type="number" value={s.radius} onChange={(v) => updateStyle("radius", Number(v))} />
          <Field label="Opacity" type="number" value={s.opacity} onChange={(v) => updateStyle("opacity", Number(v))} />
        </Row2>
        <Row2>
          <Field label="Padding" type="number" value={s.padding} onChange={(v) => updateStyle("padding", Number(v))} />
          <Field label="Rotate" type="number" value={s.rotation} onChange={(v) => updateStyle("rotation", Number(v))} />
        </Row2>
        <Row2>
          <ColorField label="Border" value={s.borderColor} onChange={(v) => updateStyle("borderColor", v)} />
          <Field label="Bdr W" type="number" value={s.borderWidth} onChange={(v) => updateStyle("borderWidth", Number(v))} />
        </Row2>
        <Field label="Text Shadow" value={s.textShadow} onChange={(v) => updateStyle("textShadow", v)} />
        <Field label="Box Shadow" value={s.boxShadow} onChange={(v) => updateStyle("boxShadow", v)} />

        {element.type === "image" && (
          <div className="grid gap-2 border-t border-slate-100 pt-2">
            <Field label="Image URL" value={element.imageUrl} onChange={(v) => updateElement({ imageUrl: v })} />
            <label className="grid gap-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Upload</span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) { uploadImage(f); e.target.value = ""; }
                }}
                className="block w-full cursor-pointer rounded-lg bg-slate-50 px-2.5 py-1.5 text-[11px] font-semibold text-slate-600 ring-1 ring-slate-200 hover:ring-blue-300"
              />
            </label>
            <Row2>
              <label className="grid gap-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Fit</span>
                <select
                  value={s.objectFit}
                  onChange={(e) => updateStyle("objectFit", e.target.value)}
                  className="h-8 rounded-lg bg-slate-50 px-2 text-[12px] font-semibold text-slate-700 outline-none ring-1 ring-slate-200 focus:ring-blue-300"
                >
                  <option value="cover">Cover</option>
                  <option value="contain">Contain</option>
                  <option value="fill">Fill</option>
                </select>
              </label>
            </Row2>
          </div>
        )}

        {element.type === "carousel" && (
          <div className="grid gap-2 border-t border-slate-100 pt-2">
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Cards</p>
            {(element.cards ?? []).map((card, i) => (
              <div key={card.id} className="rounded-xl bg-slate-50 p-2.5">
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Card {i + 1}</span>
                  <button
                    onClick={() => deleteCard(card.id)}
                    className="text-[10px] font-bold text-red-400 hover:text-red-600"
                  >
                    Remove
                  </button>
                </div>
                <div className="grid gap-1.5">
                  <Field label="Title" value={card.title} onChange={(v) => updateCard(card.id, { title: v })} />
                  <Field label="Desc" value={card.description} onChange={(v) => updateCard(card.id, { description: v })} />
                  <Field label="Image" value={card.image} onChange={(v) => updateCard(card.id, { image: v })} />
                  <label className="grid gap-1">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) { uploadCardImage(card.id, f); e.target.value = ""; }
                      }}
                      className="block w-full cursor-pointer rounded-lg bg-white px-2 py-1 text-[10px] font-semibold text-slate-600 ring-1 ring-slate-200 hover:ring-blue-300"
                    />
                  </label>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <label className="grid gap-0.5">
      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-8 rounded-lg bg-slate-50 px-2.5 text-[12px] font-semibold text-slate-800 outline-none ring-1 ring-slate-200 transition-all focus:bg-white focus:ring-blue-300"
      />
    </label>
  );
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="grid gap-0.5">
      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">{label}</span>
      <div className="flex h-8 items-center gap-1.5 rounded-lg bg-slate-50 px-2 ring-1 ring-slate-200 transition-all focus-within:bg-white focus-within:ring-blue-300">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-4 w-4 cursor-pointer rounded border-0 bg-transparent p-0"
        />
        <span className="text-[11px] font-semibold text-slate-500">{value}</span>
      </div>
    </label>
  );
}

function Row2({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-2">{children}</div>;
}
