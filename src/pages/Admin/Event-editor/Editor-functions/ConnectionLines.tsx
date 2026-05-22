import type { CanvasElement, Connection, PanState } from "./EditorTypes";
import { EVENT_TYPE_LABELS, ACTION_TYPE_LABELS } from "./EditorTypes";

interface ConnectionLinesProps {
  connections: Connection[];
  elements: CanvasElement[];
  pan: PanState;
  zoom: number;
  selectedConnectionId: string | null;
  onSelectConnection: (id: string) => void;
  onDeleteConnection: (id: string) => void;
}

function getElementCenter(el: CanvasElement): { x: number; y: number } {
  return { x: el.x + el.width / 2, y: el.y + el.height / 2 };
}

function getElementEdgePoint(source: CanvasElement, target: CanvasElement): { x: number; y: number } {
  const sc = getElementCenter(source);
  const tc = getElementCenter(target);
  const dx = tc.x - sc.x;
  const dy = tc.y - sc.y;
  const angle = Math.atan2(dy, dx);

  const hw = source.width / 2;
  const hh = source.height / 2;

  const absC = Math.abs(Math.cos(angle));
  const absS = Math.abs(Math.sin(angle));

  let ex: number, ey: number;
  if (hw * absS <= hh * absC) {
    ex = sc.x + hw * Math.cos(angle);
    ey = sc.y + hw * Math.sin(angle);
  } else {
    ex = sc.x + hh * Math.cos(angle);
    ey = sc.y + hh * Math.sin(angle);
  }
  return { x: ex, y: ey };
}

export default function ConnectionLines({
  connections,
  elements,
  pan,
  zoom,
  selectedConnectionId,
  onSelectConnection,
  onDeleteConnection,
}: ConnectionLinesProps) {
  return (
    <svg
      className="pointer-events-none absolute inset-0 z-20 h-full w-full overflow-visible"
      style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, transformOrigin: "0 0" }}
    >
      <defs>
        <marker
          id="arrowhead"
          markerWidth="8"
          markerHeight="6"
          refX="7"
          refY="3"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <polygon points="0 0, 8 3, 0 6" fill="#3b82f6" />
        </marker>
        <marker
          id="arrowhead-selected"
          markerWidth="8"
          markerHeight="6"
          refX="7"
          refY="3"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <polygon points="0 0, 8 3, 0 6" fill="#2563eb" />
        </marker>
      </defs>

      {connections.map((conn) => {
        const source = elements.find((el) => el.id === conn.sourceElementId);
        const target = elements.find((el) => el.id === conn.targetElementId);
        if (!source || !target) return null;

        const start = getElementEdgePoint(source, target);
        const end = getElementEdgePoint(target, source);
        const isSelected = selectedConnectionId === conn.id;

        const dx = end.x - start.x;
        const dy = end.y - start.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const curvature = Math.min(dist * 0.35, 120);

        const midX = (start.x + end.x) / 2;
        const midY = (start.y + end.y) / 2;
        const perpX = -dy / (dist || 1);
        const perpY = dx / (dist || 1);

        const cp1x = start.x + dx * 0.25 + perpX * curvature * 0.3;
        const cp1y = start.y + dy * 0.25 + perpY * curvature * 0.3;
        const cp2x = start.x + dx * 0.75 + perpX * curvature * 0.3;
        const cp2y = start.y + dy * 0.75 + perpY * curvature * 0.3;

        const path = `M ${start.x} ${start.y} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${end.x} ${end.y}`;

        const labelX = midX + perpX * curvature * 0.15;
        const labelY = midY + perpY * curvature * 0.15;

        const eventLabel = EVENT_TYPE_LABELS[conn.eventType] || conn.eventType;
        const actionLabel = ACTION_TYPE_LABELS[conn.actionType] || conn.actionType;
        const labelText = conn.label || `${eventLabel} → ${actionLabel}`;

        return (
          <g key={conn.id} className="pointer-events-auto" style={{ cursor: "pointer" }}>
            {/* Invisible wider hit area */}
            <path
              d={path}
              fill="none"
              stroke="transparent"
              strokeWidth={16}
              onClick={(e) => { e.stopPropagation(); onSelectConnection(conn.id); }}
              onContextMenu={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onDeleteConnection(conn.id);
              }}
            />
            {/* Visible line */}
            <path
              d={path}
              fill="none"
              stroke={isSelected ? "#2563eb" : "#3b82f6"}
              strokeWidth={isSelected ? 2.5 : 1.5}
              strokeDasharray={isSelected ? "none" : "6 3"}
              markerEnd={isSelected ? "url(#arrowhead-selected)" : "url(#arrowhead)"}
              className="transition-all duration-150"
            />
            {/* Start dot */}
            <circle cx={start.x} cy={start.y} r={4} fill={isSelected ? "#2563eb" : "#3b82f6"} />
            {/* End dot */}
            <circle cx={end.x} cy={end.y} r={4} fill={isSelected ? "#2563eb" : "#3b82f6"} />
            {/* Label bubble */}
            <g transform={`translate(${labelX}, ${labelY})`}>
              <rect
                x={-labelText.length * 3.2 - 8}
                y={-10}
                width={labelText.length * 6.4 + 16}
                height={20}
                rx={10}
                fill={isSelected ? "#2563eb" : "#3b82f6"}
                opacity={0.9}
              />
              <text
                x={0}
                y={4}
                textAnchor="middle"
                fill="white"
                fontSize={9}
                fontWeight={700}
                fontFamily="system-ui, sans-serif"
              >
                {labelText}
              </text>
            </g>
          </g>
        );
      })}
    </svg>
  );
}
