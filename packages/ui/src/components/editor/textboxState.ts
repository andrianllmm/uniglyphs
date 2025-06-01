export type TextboxElement =
  | HTMLTextAreaElement
  | HTMLInputElement
  | HTMLElement;

export function isTextInput(
  el: EventTarget | null
): el is HTMLTextAreaElement | HTMLInputElement {
  return (
    el instanceof HTMLTextAreaElement ||
    (el instanceof HTMLInputElement && el.type === "text")
  );
}

export function isContentEditable(el: EventTarget | null): el is HTMLElement {
  return el instanceof HTMLElement && el.isContentEditable === true;
}

type TextboxState = {
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

export function getTextboxState(textbox: TextboxElement): TextboxState {
  const state = {
    text: "",
    selectionStart: 0,
    selectionEnd: 0,
    selection: "",
    adjacentChar: "",
    lineStart: 0,
    lineEnd: 0,
    line: "",
    beforeSelection: "",
    afterSelection: "",
    beforeLine: "",
    afterLine: "",
  };

  if (isTextInput(textbox)) {
    state.text = textbox.value;
    state.selectionStart = textbox.selectionStart ?? 0;
    state.selectionEnd = textbox.selectionEnd ?? 0;
  } else if (isContentEditable(textbox)) {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      return state;
    }

    const fullText = textbox.innerText || textbox.textContent || "";
    state.text = fullText;

    const range = selection.getRangeAt(0);

    const preCaretRange = range.cloneRange();
    preCaretRange.selectNodeContents(textbox);
    preCaretRange.setEnd(range.startContainer, range.startOffset);
    state.selectionStart = preCaretRange.toString().length;

    const postCaretRange = range.cloneRange();
    postCaretRange.selectNodeContents(textbox);
    postCaretRange.setEnd(range.endContainer, range.endOffset);
    state.selectionEnd = postCaretRange.toString().length;
  }

  state.selection = state.text.slice(state.selectionStart, state.selectionEnd);
  state.adjacentChar =
    state.selectionStart > 0 ? state.text[state.selectionStart - 1] || "" : "";

  state.lineStart = state.text.lastIndexOf("\n", state.selectionStart - 1) + 1;
  const lineEndRaw = state.text.indexOf("\n", state.selectionEnd);
  state.lineEnd = lineEndRaw === -1 ? state.text.length : lineEndRaw;
  state.line = state.text.slice(state.lineStart, state.lineEnd);

  state.beforeSelection = state.text.slice(0, state.selectionStart);
  state.afterSelection = state.text.slice(state.selectionEnd);

  state.beforeLine = state.text.slice(0, state.lineStart);
  state.afterLine = state.text.slice(state.lineEnd);

  return state;
}

export function updateTextboxValue(textbox: TextboxElement, text: string) {
  if (isTextInput(textbox)) {
    textbox.value = text;
  } else if (isContentEditable(textbox)) {
    textbox.textContent = text;
  }
}

export function updateTextboxSelection(
  textbox: TextboxElement,
  selectionStart: number,
  selectionEnd: number
) {
  if (isTextInput(textbox)) {
    textbox.selectionStart = selectionStart;
    textbox.selectionEnd = selectionEnd;
  } else if (isContentEditable(textbox)) {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);

    const textNode = getTextNodeAtOffset(textbox, selectionStart);
    range.setStart(textNode, selectionStart);
    range.setEnd(textNode, selectionEnd);

    selection.removeAllRanges();
    selection.addRange(range);
  }
}

function getTextNodeAtOffset(element: HTMLElement, offset: number): Text {
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null);

  let currentNode: Text | null = null;
  let currentOffset = 0;

  while (walker.nextNode()) {
    currentNode = walker.currentNode as Text;
    const length = currentNode.length;

    if (currentOffset + length >= offset) {
      return currentNode;
    }

    currentOffset += length;
  }

  return currentNode as Text;
}
