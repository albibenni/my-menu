export type Editor = Record<string, never>;
export interface PluginManifest {
  id: string;
}
export interface Command {
  id: string;
  name: string;
  icon?: string;
}

export class Plugin {
  app: unknown;
  manifest: PluginManifest;
  private data: unknown = {};

  constructor(app: unknown, manifest: PluginManifest) {
    this.app = app;
    this.manifest = manifest;
  }

  addCommand(command: Command): Command {
    const app = this.app as {
      commands?: { commands?: Record<string, Command> };
    };
    const fullCommand = { ...command, id: `${this.manifest.id}:${command.id}` };
    if (app.commands?.commands)
      app.commands.commands[fullCommand.id] = fullCommand;
    return fullCommand;
  }

  addSettingTab(): void {}
  register(): void {}
  registerEvent(): void {}
  registerDomEvent(
    element: HTMLElement,
    event: string,
    callback: EventListener,
  ): void {
    element.addEventListener(event, callback);
  }
  async loadData(): Promise<unknown> {
    return this.data;
  }
  async saveData(data: unknown): Promise<void> {
    this.data = data;
  }
}

export class Notice {
  constructor(public message: string) {}
}

export class PluginSettingTab {
  containerEl = document.createElement("div");
  app: unknown;
  constructor(app: unknown) {
    this.app = app;
  }
}

export class FuzzySuggestModal<_T> {
  constructor(public app: unknown) {}
  open(): void {}
}

export class Setting {
  settingEl = document.createElement("div");
  constructor(parent: HTMLElement) {
    parent.append(this.settingEl);
  }
  setName(): this {
    return this;
  }
  setDesc(): this {
    return this;
  }
  setHeading(): this {
    return this;
  }
  addToggle(): this {
    return this;
  }
  addSlider(): this {
    return this;
  }
  addButton(): this {
    return this;
  }
  addExtraButton(): this {
    return this;
  }
}

export const setIcon = (element: HTMLElement, icon: string): void => {
  element.dataset.icon = icon;
};

export const setTooltip = (element: HTMLElement, text: string): void => {
  element.title = text;
};

export const getIconIds = (): string[] => ["bold", "circle", "sparkles"];
