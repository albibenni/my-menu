import { type Editor, Notice, Plugin, setIcon, setTooltip } from "obsidian";
import { ObsidianCommandCatalog } from "./command-catalog";
import {
  type TextEditor,
  toggleCodeBlock,
  toggleInlineMarkup,
} from "./formatting";
import { MyMenuSettingTab } from "./settings";
import {
  DEFAULT_BUTTONS,
  type MenuButton,
  type MyMenuSettings,
  parseSettings,
} from "./settings-schema";
import { MyMenuToolbar } from "./toolbar";
import { calculateKeyboardOffset } from "./viewport";

export default class MyMenuPlugin extends Plugin {
  settings!: MyMenuSettings;
  private toolbar: MyMenuToolbar | null = null;
  private commandCatalog!: ObsidianCommandCatalog;

  get commands(): ObsidianCommandCatalog {
    return this.commandCatalog;
  }

  async onload(): Promise<void> {
    this.settings = parseSettings(await this.loadData());
    this.registerFormattingCommands();
    this.registerVisibilityCommand();
    this.commandCatalog = new ObsidianCommandCatalog(this.app);
    this.addSettingTab(new MyMenuSettingTab(this.app, this));

    this.app.workspace.onLayoutReady(() => this.mountToolbar());
    this.registerEvent(
      this.app.workspace.on("layout-change", () =>
        this.toolbar?.render(this.settings),
      ),
    );
  }

  onunload(): void {
    this.toolbar?.destroy();
    this.toolbar = null;
  }

  async updateSettings(settings: MyMenuSettings): Promise<void> {
    this.settings = parseSettings(settings);
    await this.saveData(this.settings);
    this.toolbar?.render(this.settings);
  }

  defaultButtons(): MenuButton[] {
    return DEFAULT_BUTTONS.map((button) => ({ ...button }));
  }

  private registerFormattingCommands(): void {
    this.addInlineCommand(
      "toggle-underline",
      "Toggle underline",
      "<u>",
      "</u>",
    );
    this.addInlineCommand(
      "toggle-superscript",
      "Toggle superscript",
      "<sup>",
      "</sup>",
    );
    this.addInlineCommand(
      "toggle-subscript",
      "Toggle subscript",
      "<sub>",
      "</sub>",
    );
    this.addCommand({
      id: "toggle-code-block",
      name: "Toggle code block",
      icon: "square-code",
      editorCallback: (editor: Editor) => toggleCodeBlock(editor as TextEditor),
    });
  }

  private addInlineCommand(
    id: string,
    name: string,
    opening: string,
    closing: string,
  ): void {
    this.addCommand({
      id,
      name,
      editorCallback: (editor: Editor) =>
        toggleInlineMarkup(editor as TextEditor, opening, closing),
    });
  }

  private registerVisibilityCommand(): void {
    this.addCommand({
      id: "toggle-toolbar-visibility",
      name: "Toggle toolbar visibility",
      icon: "panel-bottom",
      callback: () => {
        void this.updateSettings({
          ...this.settings,
          visible: !this.settings.visible,
        });
      },
    });
  }

  private mountToolbar(): void {
    this.toolbar?.destroy();
    this.toolbar = new MyMenuToolbar(this.app.workspace.containerEl, {
      commands: this.commandCatalog,
      drawIcon: (element, icon) => setIcon(element, icon),
      showTooltip: (element, text) => setTooltip(element, text),
      reportUnavailable: (commandId) =>
        new Notice(`MyMenu command is unavailable: ${commandId}`),
    });
    this.toolbar.render(this.settings);
    this.trackVisibleViewport();
  }

  private trackVisibleViewport(): void {
    const workspaceDocument = this.app.workspace.containerEl.ownerDocument;
    const workspaceWindow = workspaceDocument.defaultView;
    const viewport = workspaceWindow?.visualViewport;
    if (!viewport) return;
    const updateOffset = (): void => {
      const keyboardHeight = calculateKeyboardOffset({
        layoutHeight: Math.max(
          workspaceWindow.innerHeight,
          workspaceDocument.documentElement.clientHeight,
        ),
        visibleHeight: viewport.height,
        visibleOffsetTop: viewport.offsetTop,
      });
      this.toolbar?.setKeyboardOffset(keyboardHeight);
    };
    viewport.addEventListener("resize", updateOffset);
    viewport.addEventListener("scroll", updateOffset);
    this.register(() => {
      viewport.removeEventListener("resize", updateOffset);
      viewport.removeEventListener("scroll", updateOffset);
    });
    updateOffset();
  }
}
