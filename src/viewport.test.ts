import { describe, expect, it } from "vitest";
import { availableHorizontalBounds, calculateKeyboardOffset } from "./viewport";

describe("calculateKeyboardOffset", () => {
  it("moves the toolbar by the covered portion of the layout viewport", () => {
    expect(
      calculateKeyboardOffset({
        layoutHeight: 1024,
        visibleHeight: 620,
        visibleOffsetTop: 0,
      }),
    ).toBe(404);
  });

  it("does not move the toolbar when the viewport is fully visible", () => {
    expect(
      calculateKeyboardOffset({
        layoutHeight: 1024,
        visibleHeight: 1024,
        visibleOffsetTop: 0,
      }),
    ).toBe(0);
  });
});

describe("availableHorizontalBounds", () => {
  it("excludes mobile drawers that overlay the main content", () => {
    expect(
      availableHorizontalBounds(
        { left: 0, right: 1024 },
        { left: 0, right: 320 },
        undefined,
      ),
    ).toEqual({ left: 320, width: 704 });
  });
});
