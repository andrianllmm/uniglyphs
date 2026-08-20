export type TextboxElement =
  | HTMLTextAreaElement
  // | HTMLInputElement
  | HTMLElement; // Supported textbox-like elements

/** Checks if element is a text input (textarea or input[type=text]) */
export function isTextInput(el: EventTarget | null): el is HTMLTextAreaElement {
  return (
    el instanceof HTMLTextAreaElement
    // (el instanceof HTMLInputElement && el.type === "text")
  );
}

/** Checks if element is a contenteditable HTMLElement */
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

/** Extracts detailed state info from textbox element */
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

      // Calculate selection offsets relative to textbox root
      state.selectionStart = getNodeOffset(
        textbox,
        range.startContainer,
        range.startOffset,
      );
      state.selectionEnd = getNodeOffset(
        textbox,
        range.endContainer,
        range.endOffset,
      );
    }
  }

  const chars = Array.from(state.text);

  // Clamp selection offsets to text length
  const startStrIndex = Math.min(state.selectionStart, state.text.length);
  const endStrIndex = Math.min(state.selectionEnd, state.text.length);

  // Convert string indices to char indices
  state.selectionStart = strToCharIdx(state.text, startStrIndex);
  state.selectionEnd = strToCharIdx(state.text, endStrIndex);

  // Extract selection
  state.selection = chars
    .slice(state.selectionStart, state.selectionEnd)
    .join("");

  state.beforeSelection = chars.slice(0, state.selectionStart).join("");
  state.afterSelection = chars.slice(state.selectionEnd).join("");

  state.adjacentChar =
    state.selectionStart == state.selectionEnd
      ? chars.slice(state.selectionStart - 1, state.selectionStart - 0).join("")
      : chars.slice(0, 1).join("");

  // Extract line
  state.lineStart = state.text.lastIndexOf("\n", state.selectionStart - 1) + 1;
  const lineEndRaw = state.text.indexOf("\n", state.selectionEnd);
  state.lineEnd = lineEndRaw === -1 ? state.text.length : lineEndRaw;
  state.line = chars.slice(state.lineStart, state.lineEnd).join("");

  state.beforeLine = chars.slice(0, state.lineStart).join("");
  state.afterLine = chars.slice(state.lineEnd).join("");

  state.selectionStart = charToStrIdx(state.text, state.selectionStart);
  state.selectionEnd = charToStrIdx(state.text, state.selectionEnd);

  return state;
}

/** Inserts text at current selection in textbox */
export function insertTextboxValue(textbox: TextboxElement, text: string) {
  textbox.focus();

  if (isTextInput(textbox)) {
    const start = textbox.selectionStart ?? 0;
    const end = textbox.selectionEnd ?? 0;
    const value = textbox.value;
    const newValue = value.slice(0, start) + text + value.slice(end);

    // Use the native setter (not the instance property) so frameworks like
    // React, which patch the instance setter to track controlled inputs,
    // still observe the change via the subsequent "input" event
    const nativeSetter = Object.getOwnPropertyDescriptor(
      window.HTMLTextAreaElement.prototype,
      "value",
    )?.set;
    if (nativeSetter) {
      nativeSetter.call(textbox, newValue);
    } else {
      textbox.value = newValue;
    }

    textbox.dispatchEvent(
      new InputEvent("input", {
        bubbles: true,
        cancelable: true,
        inputType: "insertText",
        data: text,
      }),
    );
  } else if (isContentEditable(textbox)) {
    // Let the browser perform the insertion via execCommand rather than mutating the DOM ourselves.
    // It replaces the current selection and emits trusted beforeinput/input events,
    // so framework-managed editors (React/Slate/Draft.js/Lexical-style) sync their internal model exactly once,
    // and the native undo stack stays intact.
    //
    // We can't insert ourselves and also let a framework react:
    // those editors commit their model change asynchronously (on the next render),
    // so no synchronous check can tell whether they already handled it.
    // Synthetic events are also untrusted, so they never trigger the native insertion on their own.
    if (execInsertText(text)) return;

    // Fallback for the rare element where execCommand is unavailable or refuses the edit.
    // Nothing was inserted, so doing it by hand and announcing it with a synthetic "input" is safe here.
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    range.deleteContents();

    // Insert lines with <br> for newlines
    const lines = text.split("\n");
    const fragment = document.createDocumentFragment();
    lines.forEach((line, i) => {
      fragment.appendChild(document.createTextNode(line));
      if (i < lines.length - 1)
        fragment.appendChild(document.createElement("br"));
    });

    range.insertNode(fragment);

    // Collapse selection after inserted text
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);

    // Notify any listeners that sync their state from "input"
    textbox.dispatchEvent(
      new InputEvent("input", {
        bubbles: true,
        cancelable: false,
        inputType: "insertText",
        data: text,
      }),
    );
  }
}

/**
 * Replaces the current selection with `text` using execCommand,
 * so the browser performs (and announces) the edit itself.
 * Returns whether the edit was carried out.
 */
function execInsertText(text: string): boolean {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return false;

  try {
    if (text === "") {
      // insertText with an empty string is a no-op in some engines,
      // so clear the selection explicitly
      // but only when something is actually selected,
      // since "delete" on a collapsed caret would eat the preceding character
      if (selection.isCollapsed) return true;
      return document.execCommand("delete");
    }

    return document.execCommand("insertText", false, text);
  } catch {
    return false;
  }
}

export function updateTextboxSelection(
  textbox: TextboxElement,
  selectionStart: number,
  selectionEnd: number,
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
      selectionStart,
    );
    const { node: endNode, nodeOffset: endOffset } = getNodeAtOffset(
      textbox,
      selectionEnd,
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
 * Returns the character offset for a given node and offset within it.
 */
function getNodeOffset(
  root: HTMLElement,
  node: Node,
  nodeOffset: number,
): number {
  let totalOffset = 0;

  // Create a walker that traverses text nodes and <br> elements
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
    },
  );

  // Walk the tree until the target node is found
  while (walker.nextNode()) {
    const curr = walker.currentNode;

    if (curr === node) {
      return totalOffset + nodeOffset;
    }

    // Add the length of the text node to the total offset
    if (curr.nodeType === Node.TEXT_NODE) {
      totalOffset += (curr as Text).length;
    } else if (
      curr.nodeType === Node.ELEMENT_NODE &&
      (curr as Element).tagName === "BR"
    ) {
      totalOffset += 1; // Treat <br> as one character
    }
  }

  // If target node is not found, return total offset
  return totalOffset;
}

/**
 * Returns the node and offset within it corresponding to a given character offset.
 */
function getNodeAtOffset(
  root: HTMLElement,
  offset: number,
): { node: Text | Element | null; nodeOffset: number } {
  let runningTotal = 0;

  // Create a walker that traverses text nodes and <br> elements
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
    },
  );

  // Walk the tree until the offset falls within this text node
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
      runningTotal += 1; // Treat <br> as one character
    }
  }

  // If offset is beyond content length, return null/default
  return { node: null, nodeOffset: 0 };
}

/**
 * Converts a UTF-16 string index to a Unicode character index.
 */
function strToCharIdx(text: string, stringIndex: number): number {
  let charCount = 0;
  let strIdx = 0;
  const len = text.length;

  while (strIdx < stringIndex && strIdx < len) {
    const codePoint = text.codePointAt(strIdx);
    if (codePoint === undefined) break;
    strIdx += codePoint > 0xffff ? 2 : 1;
    charCount++;
  }

  return charCount;
}

/**
 * Converts a Unicode character index to a UTF-16 string index.
 */
function charToStrIdx(text: string, charIdx: number): number {
  let strIdx = 0;
  let count = 0;

  for (const char of text) {
    if (count === charIdx) break;
    strIdx += char.length;
    count++;
  }

  return strIdx;
}
