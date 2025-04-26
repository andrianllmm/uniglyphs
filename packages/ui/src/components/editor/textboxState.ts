type TextBoxState = {
  text: string;
  selectionStart: number;
  selectionEnd: number;
  selection: string;
  adjacentChar: string;
  lineStart: number;
  lineEnd: number;
  line: string;
  beforeSelection: string;
  afterSelection: string;
  beforeLine: string;
  afterLine: string;
};

export function getTextBoxState(
  textbox: HTMLTextAreaElement | HTMLInputElement,
): TextBoxState {
  const text = textbox.value;

  const selectionStart = textbox.selectionStart ?? 0;
  const selectionEnd = textbox.selectionEnd ?? 0;
  const selection = text.slice(selectionStart, selectionEnd);
  const adjacentChar = selectionStart > 0 ? text[selectionStart - 1] || "" : "";

  const lineStart = text.lastIndexOf("\n", selectionStart - 1) + 1;
  const lineEndRaw = text.indexOf("\n", selectionEnd);
  const lineEnd = lineEndRaw === -1 ? text.length : lineEndRaw;
  const line = text.slice(lineStart, lineEnd);

  const beforeSelection = text.slice(0, selectionStart);
  const afterSelection = text.slice(selectionEnd);

  const beforeLine = text.slice(0, lineStart);
  const afterLine = text.slice(lineEnd);

  return {
    text,
    selectionStart,
    selectionEnd,
    selection,
    adjacentChar,
    lineStart,
    lineEnd,
    line,
    beforeSelection,
    afterSelection,
    beforeLine,
    afterLine,
  };
}
