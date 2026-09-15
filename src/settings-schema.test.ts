import { describe, expect, it } from "vitest";
import { DEFAULT_SETTINGS, parseSettings } from "./settings-schema";

describe("parseSettings", () => {
  it("provides an editable cMenu-style toolbar for a new installation", () => {
    const settings = parseSettings(undefined);

    expect(settings).toEqual(DEFAULT_SETTINGS);
    expect(settings.buttons.map((button) => button.commandId)).toEqual([
      "editor:toggle-bold",
      "editor:toggle-italics",
      "editor:toggle-strikethrough",
      "my-menu:toggle-underline",
      "my-menu:toggle-superscript",
      "my-menu:toggle-subscript",
      "editor:toggle-code",
      "my-menu:toggle-code-block",
      "editor:toggle-blockquote",
    ]);
  });

  it("preserves a valid customized toolbar", () => {
    const settings = parseSettings({
      schemaVersion: 1,
      visible: false,
      buttonSize: 44,
      buttonGap: 8,
      bottomOffset: 30,
      buttons: [
        {
          id: "ai",
          commandId: "ask-ai:open-selection-in-ai-chat",
          icon: "sparkles",
        },
      ],
    });

    expect(settings.visible).toBe(false);
    expect(settings.buttons[0]?.commandId).toBe(
      "ask-ai:open-selection-in-ai-chat",
    );
  });
});
