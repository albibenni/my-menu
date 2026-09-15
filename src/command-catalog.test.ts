import { describe, expect, it, vi } from "vitest";
import { ObsidianCommandCatalog } from "./command-catalog";

describe("ObsidianCommandCatalog", () => {
  it("lists and executes commands through the runtime command service", () => {
    const executeCommandById = vi.fn(() => true);
    const catalog = new ObsidianCommandCatalog({
      commands: {
        commands: {
          "ask-ai:open-selection-in-ai-chat": {
            id: "ask-ai:open-selection-in-ai-chat",
            name: "Ask AI: Open selection in AI chat",
          },
        },
        executeCommandById,
      },
    });

    expect(catalog.list()).toEqual([
      {
        id: "ask-ai:open-selection-in-ai-chat",
        name: "Ask AI: Open selection in AI chat",
      },
    ]);
    expect(catalog.execute("ask-ai:open-selection-in-ai-chat")).toBe(true);
    expect(executeCommandById).toHaveBeenCalledWith(
      "ask-ai:open-selection-in-ai-chat",
    );
  });
});
