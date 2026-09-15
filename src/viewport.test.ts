import { describe, expect, it } from "vitest";
import { calculateKeyboardOffset } from "./viewport";

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
