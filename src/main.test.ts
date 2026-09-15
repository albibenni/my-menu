import { beforeEach, describe, expect, it } from "vitest";
import MyMenuPlugin from "./main";

describe("MyMenuPlugin", () => {
  beforeEach(() => document.body.replaceChildren());

  it("registers its actions and renders the default toolbar on load", async () => {
    const commands: Record<string, { id: string; name: string }> = {
      "editor:toggle-bold": { id: "editor:toggle-bold", name: "Toggle bold" },
      "editor:toggle-italics": {
        id: "editor:toggle-italics",
        name: "Toggle italics",
      },
      "editor:toggle-strikethrough": {
        id: "editor:toggle-strikethrough",
        name: "Toggle strikethrough",
      },
      "editor:toggle-code": { id: "editor:toggle-code", name: "Toggle code" },
      "editor:toggle-blockquote": {
        id: "editor:toggle-blockquote",
        name: "Toggle blockquote",
      },
    };
    const app = {
      commands: {
        commands,
        executeCommandById: () => true,
      },
      workspace: {
        containerEl: document.body,
        rootSplit: {},
        leftSplit: { collapsed: true },
        rightSplit: { collapsed: true },
        getMostRecentLeaf: () => null,
        onLayoutReady: (callback: () => void) => callback(),
        on: () => ({ unsubscribe: () => undefined }),
      },
    };
    const plugin = new MyMenuPlugin(app as never, { id: "my-menu" } as never);

    await plugin.onload();

    expect(commands["my-menu:toggle-underline"]).toBeDefined();
    expect(commands["my-menu:toggle-toolbar-visibility"]).toBeDefined();
    expect(document.querySelectorAll(".my-menu-button")).toHaveLength(9);
  });
});
