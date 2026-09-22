import { describe, expect, it, vi } from "vitest";
import type { MyMenuSettings } from "./settings-schema";
import { MyMenuToolbar } from "./toolbar";

const settings: MyMenuSettings = {
  schemaVersion: 1,
  visible: true,
  buttonSize: 40,
  buttonGap: 6,
  bottomOffset: 10,
  buttons: [
    { id: "ask-ai", commandId: "ask-ai:open-selection", icon: "sparkles" },
  ],
};

describe("MyMenuToolbar", () => {
  it("preserves an unavailable command as a disabled accessible button", () => {
    const host = document.createElement("div");
    const toolbar = new MyMenuToolbar(host, {
      commands: { find: () => undefined, execute: vi.fn() },
      drawIcon: vi.fn(),
      reportUnavailable: vi.fn(),
    });

    toolbar.render(settings);

    const button = host.querySelector("button");
    expect(button?.disabled).toBe(true);
    expect(button?.getAttribute("aria-label")).toBe(
      "Unavailable command: ask-ai:open-selection",
    );
    expect(button?.title).toBe("Unavailable command: ask-ai:open-selection");
  });

  it("executes an available command without taking pointer focus", () => {
    const host = document.createElement("div");
    const execute = vi.fn(() => true);
    const toolbar = new MyMenuToolbar(host, {
      commands: {
        find: () => ({ id: "editor:toggle-bold", name: "Toggle bold" }),
        execute,
      },
      drawIcon: vi.fn(),
      reportUnavailable: vi.fn(),
    });
    toolbar.render({
      ...settings,
      buttons: [{ id: "bold", commandId: "editor:toggle-bold", icon: "bold" }],
    });
    const button = host.querySelector("button");
    const pointerDown = new Event("pointerdown", { cancelable: true });

    button?.dispatchEvent(pointerDown);
    button?.click();

    expect(pointerDown.defaultPrevented).toBe(true);
    expect(execute).toHaveBeenCalledWith("editor:toggle-bold");
  });

  it("shows the assigned command name on hover", () => {
    const host = document.createElement("div");
    const toolbar = new MyMenuToolbar(host, {
      commands: {
        find: (id) => ({ id, name: "Toggle bold" }),
        execute: vi.fn(),
      },
      drawIcon: vi.fn(),
      reportUnavailable: vi.fn(),
    });

    toolbar.render({
      ...settings,
      buttons: [{ id: "bold", commandId: "editor:toggle-bold", icon: "bold" }],
    });

    expect(host.querySelector("button")?.title).toBe("Toggle bold");
  });

  it("centers and constrains itself within the main content bounds", () => {
    const host = document.createElement("div");
    const toolbar = new MyMenuToolbar(host, {
      commands: { find: () => undefined, execute: vi.fn() },
      drawIcon: vi.fn(),
      reportUnavailable: vi.fn(),
    });

    toolbar.setAvailableBounds({ left: 280, width: 760 });

    const element = host.querySelector<HTMLElement>(".my-menu-toolbar");
    expect(element?.style.getPropertyValue("--my-menu-center-x")).toBe("660px");
    expect(element?.style.getPropertyValue("--my-menu-max-width")).toBe(
      "736px",
    );
  });
});
