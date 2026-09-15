import {
  type App,
  type FuzzyMatch,
  FuzzySuggestModal,
  getIconIds,
  PluginSettingTab,
  Setting,
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

  display(): void {
    this.containerEl.empty();
    this.containerEl.addClass("my-menu-settings");

    new Setting(this.containerEl).setName("Toolbar").setHeading();
    this.addVisibilitySetting();
    this.addSizeSetting();
    this.addGapSetting();
    this.addOffsetSetting();
    new Setting(this.containerEl).setName("Buttons").setHeading();
    this.plugin.settings.buttons.forEach((_, index) => {
      this.addButtonRow(index);
    });
    this.addButtonActions();
  }

  private addVisibilitySetting(): void {
    new Setting(this.containerEl)
      .setName("Show toolbar")
      .setDesc("Show MyMenu throughout the main workspace.")
      .addToggle((toggle) =>
        toggle.setValue(this.plugin.settings.visible).onChange((visible) => {
          void this.commit({ ...this.plugin.settings, visible });
        }),
      );
  }

  private addSizeSetting(): void {
    new Setting(this.containerEl)
      .setName("Button size")
      .setDesc(`${this.plugin.settings.buttonSize}px`)
      .addSlider((slider) =>
        slider
          .setLimits(28, 64, 1)
          .setValue(this.plugin.settings.buttonSize)
          .setDynamicTooltip()
          .onChange((buttonSize) => {
            void this.commit({ ...this.plugin.settings, buttonSize }, false);
          }),
      );
  }

  private addGapSetting(): void {
    new Setting(this.containerEl)
      .setName("Button spacing")
      .setDesc(`${this.plugin.settings.buttonGap}px`)
      .addSlider((slider) =>
        slider
          .setLimits(0, 24, 1)
          .setValue(this.plugin.settings.buttonGap)
          .setDynamicTooltip()
          .onChange((buttonGap) => {
            void this.commit({ ...this.plugin.settings, buttonGap }, false);
          }),
      );
  }

  private addOffsetSetting(): void {
    new Setting(this.containerEl)
      .setName("Vertical offset")
      .setDesc(`${this.plugin.settings.bottomOffset}px above the bottom edge.`)
      .addSlider((slider) =>
        slider
          .setLimits(0, 200, 1)
          .setValue(this.plugin.settings.bottomOffset)
          .setDynamicTooltip()
          .onChange((bottomOffset) => {
            void this.commit({ ...this.plugin.settings, bottomOffset }, false);
          }),
      );
  }

  private addButtonRow(index: number): void {
    const item = this.plugin.settings.buttons[index];
    if (!item) return;
    const command = this.plugin.commands.find(item.commandId);
    new Setting(this.containerEl)
      .setName(command?.name ?? "Unavailable command")
      .setDesc(item.commandId)
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

  private addButtonActions(): void {
    new Setting(this.containerEl)
      .setName("Add command")
      .setDesc("Add any command registered by Obsidian or another plugin.")
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
          .setWarning()
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
    redrawSettings = true,
  ): Promise<void> {
    await this.plugin.updateSettings(settings);
    if (redrawSettings) this.display();
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
