interface ViewportGeometry {
  layoutHeight: number;
  visibleHeight: number;
  visibleOffsetTop: number;
}

export function calculateKeyboardOffset(geometry: ViewportGeometry): number {
  return Math.max(
    0,
    geometry.layoutHeight - geometry.visibleHeight - geometry.visibleOffsetTop,
  );
}
