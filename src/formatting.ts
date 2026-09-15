export interface EditorPosition {
  line: number;
  ch: number;
}

export interface TextEditor {
  getSelection(): string;
  replaceSelection(value: string): void;
  getCursor(): EditorPosition;
  setCursor(position: EditorPosition): void;
}

export function toggleInlineMarkup(
  editor: TextEditor,
  opening: string,
  closing: string,
): void {
  const selection = editor.getSelection();
  if (selection.length === 0) {
    const cursor = editor.getCursor();
    editor.replaceSelection(opening + closing);
    editor.setCursor({ line: cursor.line, ch: cursor.ch + opening.length });
    return;
  }

  const alreadyWrapped =
    selection.startsWith(opening) && selection.endsWith(closing);
  editor.replaceSelection(
    alreadyWrapped
      ? selection.slice(opening.length, selection.length - closing.length)
      : opening + selection + closing,
  );
}

const CODE_FENCE = "```";

export function toggleCodeBlock(editor: TextEditor): void {
  const selection = editor.getSelection();
  if (selection.length === 0) {
    const cursor = editor.getCursor();
    editor.replaceSelection(`${CODE_FENCE}\n\n${CODE_FENCE}`);
    editor.setCursor({ line: cursor.line + 1, ch: 0 });
    return;
  }

  const lines = selection.trim().split("\n");
  const openingFence = lines[0];
  const closingFence = lines[lines.length - 1];
  const alreadyFenced =
    openingFence?.startsWith(CODE_FENCE) === true &&
    closingFence === CODE_FENCE &&
    lines.length >= 2;
  if (alreadyFenced) {
    editor.replaceSelection(lines.slice(1, -1).join("\n"));
    return;
  }
  editor.replaceSelection(`${CODE_FENCE}\n${selection}\n${CODE_FENCE}`);
}
