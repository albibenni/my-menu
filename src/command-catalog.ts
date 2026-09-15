import type { AvailableCommand, CommandCatalog } from "./toolbar";

interface RuntimeCommand extends AvailableCommand {}

interface RuntimeCommands {
  commands?: Record<string, RuntimeCommand>;
  listCommands?: () => RuntimeCommand[];
  executeCommandById?: (id: string) => boolean;
}

interface AppWithRuntimeCommands {
  commands?: RuntimeCommands;
}

export class ObsidianCommandCatalog implements CommandCatalog {
  private readonly app: AppWithRuntimeCommands;

  constructor(app: unknown) {
    this.app = app as AppWithRuntimeCommands;
  }

  list(): AvailableCommand[] {
    const service = this.app.commands;
    if (!service) return [];
    const commands =
      service.listCommands?.() ?? Object.values(service.commands ?? {});
    return commands
      .map(({ id, name, icon }) => ({ id, name, icon }))
      .sort((left, right) => left.name.localeCompare(right.name));
  }

  find(id: string): AvailableCommand | undefined {
    return this.list().find((command) => command.id === id);
  }

  execute(id: string): boolean {
    try {
      return this.app.commands?.executeCommandById?.(id) === true;
    } catch (error) {
      console.error(`MyMenu could not execute command ${id}:`, error);
      return false;
    }
  }
}
