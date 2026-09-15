import type { MyMenuSettings } from "./settings-schema";

export interface AvailableCommand {
  id: string;
  name: string;
  icon?: string;
}

export interface CommandCatalog {
  find(id: string): AvailableCommand | undefined;
  execute(id: string): boolean;
}

interface ToolbarDependencies {
  commands: CommandCatalog;
  drawIcon(element: HTMLElement, icon: string): void;
  showTooltip(element: HTMLElement, text: string): void;
  reportUnavailable(commandId: string): void;
}

interface HorizontalBounds {
  left: number;
  width: number;
}

export class MyMenuToolbar {
  private readonly element: HTMLDivElement;

  constructor(
    host: HTMLElement,
    private readonly dependencies: ToolbarDependencies,
  ) {
    this.element = host.createDiv({ cls: "my-menu-toolbar" });
    this.element.setAttribute("role", "toolbar");
    this.element.setAttribute("aria-label", "MyMenu commands");
  }

  render(settings: MyMenuSettings): void {
    this.element.replaceChildren();
    this.element.hidden = !settings.visible;
    this.element.style.setProperty(
      "--my-menu-button-size",
      `${settings.buttonSize}px`,
    );
    this.element.style.setProperty("--my-menu-gap", `${settings.buttonGap}px`);
    this.element.style.setProperty(
      "--my-menu-bottom",
      `${settings.bottomOffset}px`,
    );

    for (const item of settings.buttons) {
      this.element.append(this.createButton(item.commandId, item.icon));
    }
  }

  setKeyboardOffset(offset: number): void {
    this.element.style.setProperty(
      "--my-menu-keyboard",
      `${Math.max(0, offset)}px`,
    );
  }

  setAvailableBounds(bounds: HorizontalBounds): void {
    this.element.style.setProperty(
      "--my-menu-center-x",
      `${bounds.left + bounds.width / 2}px`,
    );
    this.element.style.setProperty(
      "--my-menu-max-width",
      `${Math.max(0, bounds.width - 24)}px`,
    );
  }

  destroy(): void {
    this.element.remove();
  }

  private createButton(commandId: string, icon: string): HTMLButtonElement {
    const command = this.dependencies.commands.find(commandId);
    const button = this.element.createEl("button", {
      cls: ["my-menu-button", "clickable-icon"],
      attr: { type: "button" },
    });
    button.disabled = command === undefined;

    const label = command?.name ?? `Unavailable command: ${commandId}`;
    button.setAttribute("aria-label", label);
    this.dependencies.showTooltip(button, label);
    this.dependencies.drawIcon(button, icon);

    button.addEventListener("pointerdown", (event) => event.preventDefault());
    button.addEventListener("click", () => {
      if (!this.dependencies.commands.execute(commandId)) {
        this.dependencies.reportUnavailable(commandId);
      }
    });
    return button;
  }
}
