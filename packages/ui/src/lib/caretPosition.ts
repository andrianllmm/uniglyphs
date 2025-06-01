import {
  isContentEditable,
  isTextInput,
  TextboxElement,
} from "../components/editor/textboxState";

export function getCaretPosition(
  el: TextboxElement
): { top: number; left: number } | null {
  if (isTextInput(el)) {
    return getPositionInInput(el);
  }

  if (isContentEditable(el)) {
    return getPositionInContentEditable(el);
  }

  return null;
}

const properties = [
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

export function getPositionInInput(
  element: HTMLInputElement | HTMLTextAreaElement
): { top: number; left: number } {
  const computed = getComputedStyle(element);
  const div = document.createElement("div");
  const span = document.createElement("span");
  const divText = document.createTextNode("");
  const spanText = document.createTextNode("");

  const style = div.style;
  style.whiteSpace = "pre-wrap";
  if (element.nodeName !== "INPUT") style.wordBreak = "break-word";
  style.position = "absolute";
  style.visibility = "hidden";
  style.overflow = "hidden";

  for (const prop of properties) {
    style[prop] = computed[prop];
  }

  div.appendChild(divText);
  span.appendChild(spanText);
  div.appendChild(span);
  document.body.appendChild(div);

  const replaceSpaces = (str: string) =>
    element.nodeName === "INPUT" ? str.replace(/\s/g, "\u00a0") : str;

  const value = element.value;
  const selStart = element.selectionStart ?? 0;

  divText.nodeValue = replaceSpaces(value.substring(0, selStart));
  spanText.nodeValue = value.substring(selStart) || ".";

  const top = span.offsetTop + parseInt(computed.borderTopWidth || "0", 10);
  const left = span.offsetLeft + parseInt(computed.borderLeftWidth || "0", 10);

  document.body.removeChild(div);

  return { top, left };
}

export function getPositionInContentEditable(
  element: HTMLElement
): { top: number; left: number } | null {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return null;

  const range = selection.getRangeAt(0).cloneRange();
  if (!element.contains(range.startContainer)) return null;

  range.collapse(true);
  const rect = range.getBoundingClientRect();
  const containerRect = element.getBoundingClientRect();

  const top = rect.top - containerRect.top + window.scrollY;
  const left = rect.left - containerRect.left + window.scrollX;

  return { top, left };
}
