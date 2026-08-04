import {
  listStyles,
  ListStyle,
} from "@workspace/ui/lib/textTools/textList/styles";

const BULLET_MARKER = "• ";
const NUMBERED_MARKER_PATTERN = /^\d+\.\s/;
const CHECKLIST_UNCHECKED_MARKER = "☐ ";
const CHECKLIST_CHECKED_MARKER = "☑ ";

/** Checks whether a single line already has the given list style's marker */
function lineHasMarker(line: string, style: ListStyle): boolean {
  switch (style) {
    case "bullet":
      return line.startsWith(BULLET_MARKER);
    case "numbered":
      return NUMBERED_MARKER_PATTERN.test(line);
    case "checklist":
      return (
        line.startsWith(CHECKLIST_UNCHECKED_MARKER) ||
        line.startsWith(CHECKLIST_CHECKED_MARKER)
      );
  }
}

/** Removes a single list style's marker from a single line, if present */
function stripLineMarker(line: string, style: ListStyle): string {
  if (!lineHasMarker(line, style)) return line;
  switch (style) {
    case "bullet":
      return line.slice(BULLET_MARKER.length);
    case "numbered":
      return line.replace(NUMBERED_MARKER_PATTERN, "");
    case "checklist":
      return line.slice(CHECKLIST_UNCHECKED_MARKER.length);
  }
}

/** Prepends the list marker to every line that doesn't already have it */
export function applyListStyle(text: string, style: ListStyle): string {
  return text
    .split("\n")
    .map((line, i) => {
      if (lineHasMarker(line, style)) return line;
      const marker =
        style === "bullet"
          ? BULLET_MARKER
          : style === "numbered"
            ? `${i + 1}. `
            : CHECKLIST_UNCHECKED_MARKER;
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

/** Removes markers from every list style other than the given one */
function clearOtherListStyles(text: string, style: ListStyle): string {
  return listStyles.reduce(
    (acc, otherStyle) =>
      otherStyle === style ? acc : stripListStyle(acc, otherStyle),
    text,
  );
}

/**
 * Toggles the list style on the given block of text (one or more lines).
 * Activating a style clears markers from any other list style first, so a
 * line can only belong to one list style at a time.
 */
export function toggleListStyle(text: string, style: ListStyle): string {
  if (hasListStyle(text, style)) return stripListStyle(text, style);
  return applyListStyle(clearOtherListStyles(text, style), style);
}

/**
 * Cycles a checklist through three states: not a checklist -> unchecked ->
 * checked -> not a checklist. Mixed/partial states are treated as unchecked
 * (i.e. the next step checks all items).
 */
export function cycleChecklist(text: string): string {
  const lines = text.split("\n");
  const nonEmptyLines = lines.filter((line) => line.trim().length > 0);

  const allChecked =
    nonEmptyLines.length > 0 &&
    nonEmptyLines.every((line) => line.startsWith(CHECKLIST_CHECKED_MARKER));

  if (!hasListStyle(text, "checklist")) {
    return applyListStyle(clearOtherListStyles(text, "checklist"), "checklist");
  }

  if (allChecked) return stripListStyle(text, "checklist");

  return lines
    .map((line) =>
      line.startsWith(CHECKLIST_UNCHECKED_MARKER)
        ? CHECKLIST_CHECKED_MARKER +
          line.slice(CHECKLIST_UNCHECKED_MARKER.length)
        : line,
    )
    .join("\n");
}
