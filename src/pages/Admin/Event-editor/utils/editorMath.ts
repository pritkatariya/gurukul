import type { PanState } from "../Editor-functions/EditorTypes";

const GRID_SIZE = 10;

export function snapToGrid(value: number): number {
  return Math.round(value / GRID_SIZE) * GRID_SIZE;
}

export function screenToWorld(
  screenX: number,
  screenY: number,
  pan: PanState,
  zoom: number,
  viewportRect: DOMRect
): { x: number; y: number } {
  return {
    x: (screenX - viewportRect.left - pan.x) / zoom,
    y: (screenY - viewportRect.top - pan.y) / zoom,
  };
}

export function worldToScreen(
  worldX: number,
  worldY: number,
  pan: PanState,
  zoom: number,
  viewportRect: DOMRect
): { x: number; y: number } {
  return {
    x: worldX * zoom + pan.x + viewportRect.left,
    y: worldY * zoom + pan.y + viewportRect.top,
  };
}

export function zoomAtPoint(
  currentZoom: number,
  currentPan: PanState,
  factor: number,
  mouseX: number,
  mouseY: number,
  viewportRect: DOMRect
): { zoom: number; pan: PanState } {
  const newZoom = Math.min(4, Math.max(0.15, currentZoom * factor));
  const worldBefore = screenToWorld(mouseX, mouseY, currentPan, currentZoom, viewportRect);
  const newPan: PanState = {
    x: mouseX - viewportRect.left - worldBefore.x * newZoom,
    y: mouseY - viewportRect.top - worldBefore.y * newZoom,
  };
  return { zoom: newZoom, pan: newPan };
}

export function zoomAtCenter(
  currentZoom: number,
  currentPan: PanState,
  factor: number,
  viewportRect: DOMRect
): { zoom: number; pan: PanState } {
  const centerX = viewportRect.left + viewportRect.width / 2;
  const centerY = viewportRect.top + viewportRect.height / 2;
  return zoomAtPoint(currentZoom, currentPan, factor, centerX, centerY, viewportRect);
}

export function panByWheel(
  currentPan: PanState,
  deltaX: number,
  deltaY: number
): PanState {
  return {
    x: currentPan.x - deltaX,
    y: currentPan.y - deltaY,
  };
}

export function fitArtboardToViewport(
  artboardWidth: number,
  artboardHeight: number,
  viewportRect: DOMRect,
  padding: number = 80
): { zoom: number; pan: PanState } {
  const availW = viewportRect.width - padding * 2;
  const availH = viewportRect.height - padding * 2;
  const zoom = Math.min(availW / artboardWidth, availH / artboardHeight, 1);
  const pan: PanState = {
    x: (viewportRect.width - artboardWidth * zoom) / 2,
    y: (viewportRect.height - artboardHeight * zoom) / 2,
  };
  return { zoom, pan };
}

export function centerArtboard(
  artboardWidth: number,
  artboardHeight: number,
  currentZoom: number,
  viewportRect: DOMRect
): PanState {
  return {
    x: (viewportRect.width - artboardWidth * currentZoom) / 2,
    y: (viewportRect.height - artboardHeight * currentZoom) / 2,
  };
}
