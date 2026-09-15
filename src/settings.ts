import {
  type App,
  type FuzzyMatch,
  FuzzySuggestModal,
  getIconIds,
  PluginSettingTab,
  type Setting,
  type SettingDefinitionItem,
  setIcon,
} from "obsidian";
import type MyMenuPlugin from "./main";
import type { AvailableCommand } from "./toolbar";

export class MyMenuSettingTab extends PluginSettingTab {
  constructor(
    app: App,
    private readonly plugin: MyMenuPlugin,
  ) {
    super(app, plugin);
  }

  getSettingDefinitions(): SettingDefinitionItem[] {
    return [
      {
        type: "group",
        heading: "Toolbar",
        items: [
          {
            name: "Show toolbar",
            desc: "Show MyMenu throughout the main workspace.",
            control: {
              type: "toggle",
              key: "visible",
              defaultValue: true,
            },
          },
          {
            name: "Button size",
            desc: "Size of each command button.",
            control: {
              type: "slider",
              key: "buttonSize",
              min: 28,
              max: 64,
              step: 1,
              displayFormat: formatPixels,
            },
          },
          {
            name: "Button spacing",
            desc: "Space between command buttons.",
            control: {
              type: "slider",
              key: "buttonGap",
              min: 0,
              max: 24,
              step: 1,
              displayFormat: formatPixels,
            },
          },
          {
            name: "Vertical offset",
            desc: "Distance above the bottom edge or on-screen keyboard.",
            control: {
              type: "slider",
              key: "bottomOffset",
              min: 0,
              max: 200,
              step: 1,
              displayFormat: formatPixels,
            },
          },
        ],
      },
      {
        type: "group",
        heading: "Buttons",
        items: [
          ...this.plugin.settings.buttons.map((item, index) => ({
            name:
              this.plugin.commands.find(item.commandId)?.name ??
              "Unavailable command",
            desc: item.commandId,
            render: (setting: Setting) => this.addButtonRow(setting, index),
          })),
          {
            name: "Add command",
            desc: "Add any command registered by Obsidian or another plugin.",
            render: (setting: Setting) => this.addButtonActions(setting),
          },
        ],
      },
    ];
  }

  getControlValue(key: string): unknown {
    switch (key) {
      case "visible":
      case "buttonSize":
      case "buttonGap":
      case "bottomOffset":
        return this.plugin.settings[key];
      default:
        return undefined;
    }
  }

  async setControlValue(key: string, value: unknown): Promise<void> {
    if (key === "visible" && typeof value === "boolean") {
      await this.commit({ ...this.plugin.settings, visible: value }, false);
      return;
    }
    if (typeof value !== "number") return;
    switch (key) {
      case "buttonSize":
      case "buttonGap":
      case "bottomOffset":
        await this.commit({ ...this.plugin.settings, [key]: value }, false);
    }
  }

  private addButtonRow(setting: Setting, index: number): void {
    const item = this.plugin.settings.buttons[index];
    if (!item) return;
    setting
      .addExtraButton((button) =>
        button
          .setIcon(item.icon)
          .setTooltip("Choose icon")
          .onClick(() => this.chooseIcon(index)),
      )
      .addExtraButton((button) =>
        button
          .setIcon("pencil")
          .setTooltip("Choose command")
          .onClick(() => this.chooseCommand(index)),
      )
      .addExtraButton((button) =>
        button
          .setIcon("arrow-left")
          .setTooltip("Move left")
          .setDisabled(index === 0)
          .onClick(() => this.move(index, index - 1)),
      )
      .addExtraButton((button) =>
        button
          .setIcon("arrow-right")
          .setTooltip("Move right")
          .setDisabled(index === this.plugin.settings.buttons.length - 1)
          .onClick(() => this.move(index, index + 1)),
      )
      .addExtraButton((button) =>
        button
          .setIcon("trash-2")
          .setTooltip("Remove button")
          .onClick(() => this.remove(index)),
      );
  }

  private addButtonActions(setting: Setting): void {
    setting
      .addButton((button) =>
        button
          .setButtonText("Add button")
          .setCta()
          .onClick(() => {
            new CommandPicker(
              this.app,
              this.plugin.commands.list(),
              (command) => {
                const index = this.plugin.settings.buttons.length;
                const item = {
                  id: createButtonId(),
                  commandId: command.id,
                  icon: command.icon ?? "circle",
                };
                void this.commit({
                  ...this.plugin.settings,
                  buttons: [...this.plugin.settings.buttons, item],
                }).then(() => {
                  if (!command.icon) this.chooseIcon(index);
                });
              },
            ).open();
          }),
      )
      .addButton((button) =>
        button
          .setButtonText("Reset defaults")
          .setDestructive()
          .onClick(() => {
            void this.commit({
              ...this.plugin.settings,
              buttons: this.plugin.defaultButtons(),
            });
          }),
      );
  }

  private chooseCommand(index: number): void {
    new CommandPicker(this.app, this.plugin.commands.list(), (command) => {
      const buttons = this.plugin.settings.buttons.map((item, itemIndex) =>
        itemIndex === index
          ? { ...item, commandId: command.id, icon: command.icon ?? item.icon }
          : item,
      );
      void this.commit({ ...this.plugin.settings, buttons }).then(() => {
        if (!command.icon) this.chooseIcon(index);
      });
    }).open();
  }

  private chooseIcon(index: number): void {
    new IconPicker(this.app, (icon) => {
      const buttons = this.plugin.settings.buttons.map((item, itemIndex) =>
        itemIndex === index ? { ...item, icon } : item,
      );
      void this.commit({ ...this.plugin.settings, buttons });
    }).open();
  }

  private move(from: number, to: number): void {
    if (to < 0 || to >= this.plugin.settings.buttons.length) return;
    const buttons = [...this.plugin.settings.buttons];
    const [item] = buttons.splice(from, 1);
    if (!item) return;
    buttons.splice(to, 0, item);
    void this.commit({ ...this.plugin.settings, buttons });
  }

  private remove(index: number): void {
    const buttons = this.plugin.settings.buttons.filter(
      (_, itemIndex) => itemIndex !== index,
    );
    void this.commit({ ...this.plugin.settings, buttons });
  }

  private async commit(
    settings: MyMenuPlugin["settings"],
    updateDefinitions = true,
  ): Promise<void> {
    await this.plugin.updateSettings(settings);
    if (updateDefinitions) this.update();
  }
}

class CommandPicker extends FuzzySuggestModal<AvailableCommand> {
  constructor(
    app: App,
    private readonly commands: AvailableCommand[],
    private readonly choose: (command: AvailableCommand) => void,
  ) {
    super(app);
    this.setPlaceholder("Choose a command");
  }

  getItems(): AvailableCommand[] {
    return this.commands;
  }

  getItemText(item: AvailableCommand): string {
    return item.name;
  }

  onChooseItem(item: AvailableCommand): void {
    this.choose(item);
  }
}

class IconPicker extends FuzzySuggestModal<string> {
  constructor(
    app: App,
    private readonly choose: (icon: string) => void,
  ) {
    super(app);
    this.setPlaceholder("Choose an icon");
  }

  getItems(): string[] {
    return [...getIconIds()].sort();
  }

  getItemText(icon: string): string {
    return icon;
  }

  renderSuggestion(match: FuzzyMatch<string>, element: HTMLElement): void {
    element.addClass("my-menu-icon-suggestion");
    const preview = element.createSpan({ cls: "my-menu-icon-preview" });
    setIcon(preview, match.item);
    element.createSpan({ text: match.item });
  }

  onChooseItem(icon: string): void {
    this.choose(icon);
  }
}

function createButtonId(): string {
  return `button-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function formatPixels(value: number): string {
  return `${value}px`;
}
