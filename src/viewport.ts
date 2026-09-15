interface ViewportGeometry {
  layoutHeight: number;
  visibleHeight: number;
  visibleOffsetTop: number;
}

interface HorizontalEdges {
  left: number;
  right: number;
}

interface HorizontalBounds {
  left: number;
  width: number;
}

export function calculateKeyboardOffset(geometry: ViewportGeometry): number {
  return Math.max(
    0,
    geometry.layoutHeight - geometry.visibleHeight - geometry.visibleOffsetTop,
  );
}

export function availableHorizontalBounds(
  content: HorizontalEdges,
  leftSidebar?: HorizontalEdges,
  rightSidebar?: HorizontalEdges,
): HorizontalBounds {
  const left = Math.max(content.left, leftSidebar?.right ?? content.left);
  const right = Math.min(content.right, rightSidebar?.left ?? content.right);
  return { left, width: Math.max(0, right - left) };
}
