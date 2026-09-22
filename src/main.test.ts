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

  it("recenters after an overlaying sidebar finishes closing", async () => {
    const workspaceElement = document.createElement("div");
    document.body.append(workspaceElement);
    const contentElement = document.createElement("div");
    const sidebarElement = document.createElement("div");
    const rootSplit = {};
    const leftSplit = { collapsed: false };
    const rightSplit = { collapsed: true };
    contentElement.getBoundingClientRect = () =>
      ({ left: 0, right: 1000, width: 1000 }) as DOMRect;
    sidebarElement.getBoundingClientRect = () =>
      ({ left: 0, right: 280, width: 280 }) as DOMRect;
    const app = {
      commands: { commands: {}, executeCommandById: () => true },
      workspace: {
        containerEl: workspaceElement,
        rootSplit,
        leftSplit,
        rightSplit,
        getMostRecentLeaf: (root: object) => {
          if (root === rootSplit)
            return { view: { containerEl: contentElement } };
          if (root === leftSplit)
            return { view: { containerEl: sidebarElement } };
          return null;
        },
        onLayoutReady: (callback: () => void) => callback(),
        on: () => ({ unsubscribe: () => undefined }),
      },
    };
    const plugin = new MyMenuPlugin(app as never, { id: "my-menu" } as never);
    await plugin.onload();
    const toolbar =
      workspaceElement.querySelector<HTMLElement>(".my-menu-toolbar");
    expect(toolbar?.style.getPropertyValue("--my-menu-center-x")).toBe("640px");

    leftSplit.collapsed = true;
    workspaceElement.dispatchEvent(new Event("transitionend"));

    expect(toolbar?.style.getPropertyValue("--my-menu-center-x")).toBe("500px");
  });

  it("keeps hovered buttons mounted when a transition finishes", async () => {
    const app = {
      commands: { commands: {}, executeCommandById: () => true },
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
    const button = document.querySelector(".my-menu-button");

    button?.dispatchEvent(new Event("transitionend", { bubbles: true }));

    expect(document.querySelector(".my-menu-button")).toBe(button);
  });
});
