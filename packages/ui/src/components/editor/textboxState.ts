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
    const fullText = textbox.innerText || "";
    state.text = fullText;

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      state.selectionStart = 0;
      state.selectionEnd = 0;
    } else {
      const range = selection.getRangeAt(0);

      state.selectionStart = getNodeOffset(
        textbox,
        range.startContainer,
        range.startOffset
      );

      state.selectionEnd = getNodeOffset(
        textbox,
        range.endContainer,
        range.endOffset
      );
    }
  }

  state.selectionStart = Math.min(state.selectionStart, state.text.length);
  state.selectionEnd = Math.min(state.selectionEnd, state.text.length);

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

export function insertTextboxValue(textbox: TextboxElement, text: string) {
  if (isTextInput(textbox)) {
    const start = textbox.selectionStart ?? 0;
    const end = textbox.selectionEnd ?? 0;
    const value = textbox.value;

    textbox.value = value.slice(0, start) + text + value.slice(end);
  } else if (isContentEditable(textbox)) {
    const inserted = simulatePaste(textbox, text);

    if (!inserted) {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;

      const range = selection.getRangeAt(0);
      range.deleteContents();

      const lines = text.split("\n");
      const fragment = document.createDocumentFragment();

      lines.forEach((line, i) => {
        fragment.appendChild(document.createTextNode(line));
        if (i < lines.length - 1)
          fragment.appendChild(document.createElement("br"));
      });

      range.insertNode(fragment);

      range.collapse(false);
      selection.removeAllRanges();
      selection.addRange(range);
    }
  }
}

function simulatePaste(el: HTMLElement, text: string): boolean {
  try {
    const dataTransfer = new DataTransfer();
    dataTransfer.setData("text/plain", text);

    const pasteEvent = new ClipboardEvent("paste", {
      clipboardData: dataTransfer,
      bubbles: true,
      cancelable: true,
    });

    return !el.dispatchEvent(pasteEvent) || !!el.textContent?.includes(text);
  } catch {
    return false;
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

    textbox.focus();

    const { node: startNode, nodeOffset: startOffset } = getNodeAtOffset(
      textbox,
      selectionStart
    );
    const { node: endNode, nodeOffset: endOffset } = getNodeAtOffset(
      textbox,
      selectionEnd
    );

    if (!startNode || !endNode) return;

    const range = document.createRange();
    range.setStart(startNode, startOffset);
    range.setEnd(endNode, endOffset);

    selection.removeAllRanges();
    selection.addRange(range);

    textbox.dispatchEvent(new Event("selectionchange", { bubbles: true }));
  }
}

/**
 * Returns the character offset within the contenteditable element
 * for a given node and offset within that node.
 */
function getNodeOffset(
  root: HTMLElement,
  node: Node,
  offsetInNode: number
): number {
  let totalOffset = 0;

  const walker = document.createTreeWalker(
    root,
    NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT,
    {
      acceptNode(n) {
        if (n.nodeType === Node.TEXT_NODE) return NodeFilter.FILTER_ACCEPT;
        if (
          n.nodeType === Node.ELEMENT_NODE &&
          (n as Element).tagName === "BR"
        ) {
          return NodeFilter.FILTER_ACCEPT;
        }
        return NodeFilter.FILTER_SKIP;
      },
    }
  );

  while (walker.nextNode()) {
    const curr = walker.currentNode;
    if (curr === node) {
      return totalOffset + offsetInNode;
    }

    if (curr.nodeType === Node.TEXT_NODE) {
      totalOffset += (curr as Text).length;
    } else if (
      curr.nodeType === Node.ELEMENT_NODE &&
      (curr as Element).tagName === "BR"
    ) {
      totalOffset += 1;
    }
  }

  return totalOffset;
}

/**
 * Returns the DOM node and offset within it corresponding to a
 * given character offset in the contenteditable element.
 */
function getNodeAtOffset(
  root: HTMLElement,
  offset: number
): { node: Text | Element | null; nodeOffset: number } {
  let runningTotal = 0;

  const walker = document.createTreeWalker(
    root,
    NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT,
    {
      acceptNode(n) {
        if (n.nodeType === Node.TEXT_NODE) return NodeFilter.FILTER_ACCEPT;
        if (
          n.nodeType === Node.ELEMENT_NODE &&
          (n as Element).tagName === "BR"
        ) {
          return NodeFilter.FILTER_ACCEPT;
        }
        return NodeFilter.FILTER_SKIP;
      },
    }
  );

  while (walker.nextNode()) {
    const curr = walker.currentNode;
    if (curr.nodeType === Node.TEXT_NODE) {
      const txtLen = (curr as Text).length;
      if (runningTotal + txtLen >= offset) {
        return {
          node: curr as Text,
          nodeOffset: offset - runningTotal,
        };
      }
      runningTotal += txtLen;
    } else if (
      curr.nodeType === Node.ELEMENT_NODE &&
      (curr as Element).tagName === "BR"
    ) {
      if (runningTotal + 1 > offset) {
        return { node: curr as Element, nodeOffset: 0 };
      }
      runningTotal += 1;
    }
  }

  return { node: null, nodeOffset: 0 };
}
