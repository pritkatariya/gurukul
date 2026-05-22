export type ElementType = "heading" | "text" | "button" | "image" | "carousel" | "card";

export type ResizeDirection =
  | "top"
  | "right"
  | "bottom"
  | "left"
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right";

export interface CarouselCard {
  id: string;
  title: string;
  description: string;
  image: string;
}

export interface ElementStyles {
  color: string;
  background: string;
  fontSize: number;
  fontWeight: number;
  fontFamily: string;
  radius: number;
  opacity: number;
  textShadow: string;
  boxShadow: string;
  padding: number;
  borderColor: string;
  borderWidth: number;
  rotation: number;
  objectFit: string;
}

export interface CanvasElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  imageUrl: string;
  zIndex: number;
  styles: ElementStyles;
  cards?: CarouselCard[];
  events?: ElementEvent[];
  customCode?: string;
  codeLanguage?: string;
}

export interface ArtboardPreset {
  name: string;
  width: number;
  height: number;
}

export const ARTBOARD_PRESETS: ArtboardPreset[] = [
  { name: "Desktop", width: 1440, height: 900 },
  { name: "Laptop", width: 1366, height: 768 },
  { name: "Tablet", width: 768, height: 1024 },
  { name: "Mobile", width: 390, height: 844 },
  { name: "Instagram Post", width: 1080, height: 1080 },
  { name: "Instagram Story", width: 1080, height: 1920 },
  { name: "A4 Portrait", width: 794, height: 1123 },
  { name: "Custom", width: 0, height: 0 },
];

export interface DockItemData {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  className?: string;
}

export interface PanState {
  x: number;
  y: number;
}

// --- Logic / Connections ---

export type EventType =
  | "onClick"
  | "onHover"
  | "onMouseEnter"
  | "onMouseLeave"
  | "onSubmit"
  | "onChange"
  | "onLoad"
  | "custom";

export type ActionType =
  | "navigate"
  | "showPopup"
  | "hidePopup"
  | "toggle"
  | "scrollTo"
  | "updateText"
  | "changeStyle"
  | "playAnimation"
  | "runCode";

export interface Connection {
  id: string;
  sourceElementId: string;
  targetElementId: string;
  eventType: EventType;
  actionType: ActionType;
  label: string;
  params: string;
}

export interface ElementEvent {
  id: string;
  eventType: EventType;
  actionType: ActionType;
  targetElementId: string;
  params: string;
}

export const EVENT_TYPES: EventType[] = [
  "onClick", "onHover", "onMouseEnter", "onMouseLeave",
  "onSubmit", "onChange", "onLoad", "custom",
];

export const ACTION_TYPES: ActionType[] = [
  "navigate", "showPopup", "hidePopup", "toggle",
  "scrollTo", "updateText", "changeStyle", "playAnimation", "runCode",
];

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  onClick: "On Click",
  onHover: "On Hover",
  onMouseEnter: "Mouse Enter",
  onMouseLeave: "Mouse Leave",
  onSubmit: "On Submit",
  onChange: "On Change",
  onLoad: "On Load",
  custom: "Custom Event",
};

export const ACTION_TYPE_LABELS: Record<ActionType, string> = {
  navigate: "Navigate to",
  showPopup: "Show Popup",
  hidePopup: "Hide Popup",
  toggle: "Toggle Component",
  scrollTo: "Scroll to",
  updateText: "Update Text",
  changeStyle: "Change Style",
  playAnimation: "Play Animation",
  runCode: "Run Custom Code",
};
