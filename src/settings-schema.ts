import { z } from "zod";

export interface MenuButton {
  id: string;
  commandId: string;
  icon: string;
}

export interface MyMenuSettings {
  schemaVersion: 1;
  visible: boolean;
  buttonSize: number;
  buttonGap: number;
  bottomOffset: number;
  buttons: MenuButton[];
}

export const DEFAULT_BUTTONS: readonly MenuButton[] = [
  { id: "bold", commandId: "editor:toggle-bold", icon: "bold" },
  { id: "italic", commandId: "editor:toggle-italics", icon: "italic" },
  {
    id: "strikethrough",
    commandId: "editor:toggle-strikethrough",
    icon: "strikethrough",
  },
  {
    id: "underline",
    commandId: "my-menu:toggle-underline",
    icon: "underline",
  },
  {
    id: "superscript",
    commandId: "my-menu:toggle-superscript",
    icon: "superscript",
  },
  {
    id: "subscript",
    commandId: "my-menu:toggle-subscript",
    icon: "subscript",
  },
  { id: "inline-code", commandId: "editor:toggle-code", icon: "code" },
  {
    id: "code-block",
    commandId: "my-menu:toggle-code-block",
    icon: "square-code",
  },
  {
    id: "blockquote",
    commandId: "editor:toggle-blockquote",
    icon: "quote",
  },
] as const;

export const DEFAULT_SETTINGS: MyMenuSettings = {
  schemaVersion: 1,
  visible: true,
  buttonSize: 36,
  buttonGap: 4,
  bottomOffset: 12,
  buttons: DEFAULT_BUTTONS.map((button) => ({ ...button })),
};

const buttonSchema = z.object({
  id: z.string().min(1),
  commandId: z.string().min(1),
  icon: z.string().min(1),
});

const settingsSchema = z.object({
  schemaVersion: z.literal(1).default(1),
  visible: z.boolean().default(true),
  buttonSize: z.number().min(28).max(64).default(36),
  buttonGap: z.number().min(0).max(24).default(4),
  bottomOffset: z.number().min(0).max(200).default(12),
  buttons: z.array(buttonSchema).default(() => cloneDefaultButtons()),
});

export function parseSettings(input: unknown): MyMenuSettings {
  const result = settingsSchema.safeParse(input ?? {});
  if (!result.success) return cloneDefaultSettings();
  return {
    ...result.data,
    buttons: result.data.buttons.map((button) => ({ ...button })),
  };
}

export function cloneDefaultSettings(): MyMenuSettings {
  return { ...DEFAULT_SETTINGS, buttons: cloneDefaultButtons() };
}

function cloneDefaultButtons(): MenuButton[] {
  return DEFAULT_BUTTONS.map((button) => ({ ...button }));
}
