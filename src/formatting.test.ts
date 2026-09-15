import { describe, expect, it } from "vitest";
import {
  type TextEditor,
  toggleCodeBlock,
  toggleInlineMarkup,
} from "./formatting";

class MemoryEditor implements TextEditor {
  replacement = "";
  selection = "important";
  cursor = { line: 0, ch: 0 };

  getSelection(): string {
    return this.selection;
  }

  replaceSelection(value: string): void {
    this.replacement = value;
  }

  getCursor(): { line: number; ch: number } {
    return this.cursor;
  }

  setCursor(position: { line: number; ch: number }): void {
    this.cursor = position;
  }
}

describe("toggleInlineMarkup", () => {
  it("wraps selected text with the requested markup", () => {
    const editor = new MemoryEditor();

    toggleInlineMarkup(editor, "<u>", "</u>");

    expect(editor.replacement).toBe("<u>important</u>");
  });

  it("unwraps a selection that already has the same markup", () => {
    const editor = new MemoryEditor();
    editor.selection = "<sup>2</sup>";

    toggleInlineMarkup(editor, "<sup>", "</sup>");

    expect(editor.replacement).toBe("2");
  });

  it("inserts paired markup around the caret when nothing is selected", () => {
    const editor = new MemoryEditor();
    editor.selection = "";
    editor.cursor = { line: 2, ch: 5 };

    toggleInlineMarkup(editor, "<sub>", "</sub>");

    expect(editor.replacement).toBe("<sub></sub>");
    expect(editor.cursor).toEqual({ line: 2, ch: 10 });
  });
});

describe("toggleCodeBlock", () => {
  it("creates a fenced block and leaves the caret inside when nothing is selected", () => {
    const editor = new MemoryEditor();
    editor.selection = "";
    editor.cursor = { line: 4, ch: 2 };

    toggleCodeBlock(editor);

    expect(editor.replacement).toBe("```\n\n```");
    expect(editor.cursor).toEqual({ line: 5, ch: 0 });
  });

  it("unwraps an existing fenced block with a language", () => {
    const editor = new MemoryEditor();
    editor.selection = "```ts\nconst ready = true;\n```";

    toggleCodeBlock(editor);

    expect(editor.replacement).toBe("const ready = true;");
  });
});
