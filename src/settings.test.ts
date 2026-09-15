import type { SettingDefinitionGroup } from "obsidian";
import { describe, expect, it, vi } from "vitest";
import { MyMenuSettingTab } from "./settings";
import { cloneDefaultSettings } from "./settings-schema";

describe("MyMenuSettingTab", () => {
  it("publishes searchable declarative settings and persists control changes", async () => {
    const updateSettings = vi.fn(async () => undefined);
    const plugin = {
      settings: cloneDefaultSettings(),
      commands: { list: () => [], find: () => undefined },
      defaultButtons: () => [],
      updateSettings,
    };
    const tab = new MyMenuSettingTab({} as never, plugin as never);

    const definitions = tab.getSettingDefinitions();
    await tab.setControlValue("buttonSize", 44);

    expect(definitions.length).toBeGreaterThan(0);
    expect(
      definitions.some(
        (definition) =>
          "type" in definition &&
          (definition as SettingDefinitionGroup).heading === "Toolbar",
      ),
    ).toBe(true);
    expect(updateSettings).toHaveBeenCalledWith(
      expect.objectContaining({ buttonSize: 44 }),
    );
  });
});
