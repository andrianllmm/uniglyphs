import {
  listStyles,
  ListStyle,
} from "@workspace/ui/lib/textTools/textList/styles";

const BULLET_MARKER = "• ";
const NUMBERED_MARKER_PATTERN = /^\d+\.\s/;

/** Checks whether a single line already has the given list style's marker */
function lineHasMarker(line: string, style: ListStyle): boolean {
  return style === "bullet"
    ? line.startsWith(BULLET_MARKER)
    : NUMBERED_MARKER_PATTERN.test(line);
}

/** Removes a single list style's marker from a single line, if present */
function stripLineMarker(line: string, style: ListStyle): string {
  if (!lineHasMarker(line, style)) return line;
  return style === "bullet"
    ? line.slice(BULLET_MARKER.length)
    : line.replace(NUMBERED_MARKER_PATTERN, "");
}

/** Prepends the list marker to every line that doesn't already have it */
export function applyListStyle(text: string, style: ListStyle): string {
  return text
    .split("\n")
    .map((line, i) => {
      if (lineHasMarker(line, style)) return line;
      const marker = style === "bullet" ? BULLET_MARKER : `${i + 1}. `;
      return marker + line;
    })
    .join("\n");
}

/** Removes the list marker from every line that has it */
export function stripListStyle(text: string, style: ListStyle): string {
  return text
    .split("\n")
    .map((line) => stripLineMarker(line, style))
    .join("\n");
}

/** Checks whether every non-empty line already has the list style applied */
export function hasListStyle(text: string, style: ListStyle): boolean {
  const lines = text.split("\n").filter((line) => line.trim().length > 0);
  if (lines.length === 0) return false;
  return lines.every((line) => lineHasMarker(line, style));
}

/**
 * Toggles the list style on the given block of text (one or more lines).
 * Activating a style clears markers from any other list style first, so a
 * line can only belong to one list style at a time.
 */
export function toggleListStyle(text: string, style: ListStyle): string {
  if (hasListStyle(text, style)) return stripListStyle(text, style);

  const cleared = listStyles.reduce(
    (acc, otherStyle) =>
      otherStyle === style ? acc : stripListStyle(acc, otherStyle),
    text,
  );
  return applyListStyle(cleared, style);
}
