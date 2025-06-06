import { getCaretPos } from "@workspace/ui/lib/caretPosition";
import { TextboxElement } from "@workspace/ui/lib/textboxState";

export const MinVerticalToolbarOffset = 30;
export const DefaultToolbarOffset = 30;
export const ToolbarFallbackHeight = 40;
export const ToolbarFallbackWidth = 200;

export function getToolbarPos(
  textbox: TextboxElement | null,
  toolbar: HTMLDivElement | null,
  fallback_alignment: "center" | "right" | "left" = "center",
  offset: number = DefaultToolbarOffset
) {
  if (!textbox) return { top: 0, left: 0 };

  const coords = getCaretPos(textbox);
  if (!coords || (coords.left === 0 && coords.top === 0)) {
    return getAlignToolbarPos(toolbar, fallback_alignment, offset);
  }

  const textboxRect = textbox.getBoundingClientRect();

  let newTop =
    textboxRect.top +
    coords.top +
    window.scrollY +
    Math.max(offset, MinVerticalToolbarOffset);
  let newLeft = textboxRect.left + coords.left + window.scrollX;

  newTop = Math.min(
    newTop,
    window.innerHeight -
      (toolbar?.offsetHeight || ToolbarFallbackHeight) -
      offset
  );
  newLeft = Math.min(
    newLeft,
    window.innerWidth - (toolbar?.offsetWidth || ToolbarFallbackWidth) - offset
  );

  newTop = Math.max(newTop, 0);
  newLeft = Math.max(newLeft, 0);

  return { top: newTop, left: newLeft };
}

export function getAlignToolbarPos(
  toolbar: HTMLDivElement | null,
  alignment: "center" | "right" | "left" = "center",
  offset: number = DefaultToolbarOffset
) {
  const toolbarHeight = toolbar?.offsetHeight || ToolbarFallbackHeight;
  const toolbarWidth = toolbar?.offsetWidth || ToolbarFallbackWidth;

  const top = window.scrollY + window.innerHeight - toolbarHeight - offset;
  let left = 0;
  if (alignment === "center") {
    left = (window.innerWidth - toolbarWidth) / 2;
  } else if (alignment === "right") {
    left = window.scrollX + window.innerWidth - toolbarWidth - offset;
  } else if (alignment === "left") {
    left = offset;
  }

  return { top, left };
}
