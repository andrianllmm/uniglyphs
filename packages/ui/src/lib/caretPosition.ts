import { isContentEditable, isTextInput, TextboxElement } from "./textboxState";

// CSS properties to copy from the input
const STYLE_PROPERTIES = [
  "direction",
  "boxSizing",
  "width",
  "height",
  "overflowX",
  "overflowY",

  "borderTopWidth",
  "borderRightWidth",
  "borderBottomWidth",
  "borderLeftWidth",

  "paddingTop",
  "paddingRight",
  "paddingBottom",
  "paddingLeft",

  "fontStyle",
  "fontVariant",
  "fontWeight",
  "fontStretch",
  "fontSize",
  "fontSizeAdjust",
  "lineHeight",
  "fontFamily",

  "textAlign",
  "textTransform",
  "textIndent",
  "textDecoration",

  "letterSpacing",
  "wordSpacing",
] as const;

/**
 * Determines caret position of a textbox element
 */
export function getCaretPos(
  el: TextboxElement
): { top: number; left: number } | null {
  if (isTextInput(el)) return getPosInInput(el);
  if (isContentEditable(el)) return getPosInContentEditable(el);
  return null;
}

/**
 * Calculates caret position inside an input or textarea
 */
export function getPosInInput(
  element: HTMLInputElement | HTMLTextAreaElement
): { top: number; left: number } {
  // Create hidden mirror div and span to replicate text layout
  const mirrorDiv = document.createElement("div");
  const caretSpan = document.createElement("span");
  const beforeCaretText = document.createTextNode("");
  const afterCaretText = document.createTextNode("");

  // Get computed styles to match input appearance
  const computedStyle = getComputedStyle(element);
  const mirrorStyle = mirrorDiv.style;

  // Setup mirror styles
  mirrorStyle.whiteSpace = "pre-wrap";
  if (element.nodeName !== "INPUT") mirrorStyle.wordBreak = "break-word";
  mirrorStyle.position = "absolute";
  mirrorStyle.visibility = "hidden";
  mirrorStyle.overflow = "hidden";

  // Copy relevant styles to mirror
  for (const prop of STYLE_PROPERTIES) {
    mirrorStyle[prop] = computedStyle[prop];
  }

  // Build mirror DOM
  mirrorDiv.appendChild(beforeCaretText);
  caretSpan.appendChild(afterCaretText);
  mirrorDiv.appendChild(caretSpan);
  document.body.appendChild(mirrorDiv);

  // Replace spaces to match input rendering
  const replaceSpaces = (str: string) =>
    element.nodeName === "INPUT" ? str.replace(/\s/g, "\u00a0") : str;

  const value = element.value;
  const selStart = element.selectionStart ?? 0; // caret position index

  // Set mirror text before and after caret
  beforeCaretText.nodeValue = replaceSpaces(value.substring(0, selStart));
  afterCaretText.nodeValue = value.substring(selStart) || "."; // fallback to a visible char

  // Calculate caret position relative to input
  const top =
    caretSpan.offsetTop + parseInt(computedStyle.borderTopWidth || "0", 10);
  const left =
    caretSpan.offsetLeft + parseInt(computedStyle.borderLeftWidth || "0", 10);

  // Clean up mirror from DOM
  document.body.removeChild(mirrorDiv);

  return { top, left };
}

/**
 * Calculates caret position inside a contenteditable element
 */
export function getPosInContentEditable(
  element: HTMLElement
): { top: number; left: number } | null {
  // Get the current user selection
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return null;

  // Clone the first selected range to avoid changing the actual selection
  const range = selection.getRangeAt(0).cloneRange();

  // Ignore if the caret is not inside the target element
  if (!element.contains(range.startContainer)) return null;

  // Moves the selection to a single point at the start (caret position)
  range.collapse(true);

  // Get caret and container rect (object with position and size relative to viewport)
  let rect = range.getBoundingClientRect();

  if (rect.left === 0 && rect.top === 0) {
    // Insert temporary span at caret position
    const tempSpan = document.createElement("span");
    // Zero-width non-breaking space character, ensures span has width
    tempSpan.textContent = "\u200B";
    range.insertNode(tempSpan);

    rect = tempSpan.getBoundingClientRect();

    // Clean up
    tempSpan.parentNode?.removeChild(tempSpan);

    // Restore selection to after the tempSpan
    selection.removeAllRanges();
    const newRange = document.createRange();
    newRange.setStart(range.startContainer, range.startOffset);
    newRange.collapse(true);
    selection.addRange(newRange);
  }

  const containerRect = element.getBoundingClientRect();

  // Calculate caret position relative to element plus page scroll
  const top = rect.top - containerRect.top + window.scrollY;
  const left = rect.left - containerRect.left + window.scrollX;

  return { top, left };
}
