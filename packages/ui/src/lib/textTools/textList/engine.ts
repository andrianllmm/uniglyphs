import {
  listStyles,
  ListStyle,
} from "@workspace/ui/lib/textTools/textList/styles";

// Spaces, not a tab character, so indentation survives pasting elsewhere
export const INDENT_UNIT = "  ";

const BULLET_MARKER = "• ";
const BULLET_OUTLINE_MARKER = "◦ ";
const NUMBERED_MARKER_PATTERN = /^([0-9]+|[a-z]+)\.\s/;
const CHECKLIST_UNCHECKED_MARKER = "☐ ";
const CHECKLIST_CHECKED_MARKER = "☑ ";

function splitIndent(line: string): { indent: string; rest: string } {
  const [indent] = /^ */.exec(line) ?? [""];
  return { indent, rest: line.slice(indent.length) };
}

function getDepth(indent: string): number {
  return Math.floor(indent.length / INDENT_UNIT.length);
}

// 1-indexed: 1 -> a, 26 -> z, 27 -> aa
function toAlpha(n: number): string {
  let s = "";
  let num = n;
  while (num > 0) {
    num -= 1;
    s = String.fromCharCode(97 + (num % 26)) + s;
    num = Math.floor(num / 26);
  }
  return s;
}

function lineHasMarker(line: string, style: ListStyle): boolean {
  const { rest } = splitIndent(line);
  switch (style) {
    case "bullet":
      return (
        rest.startsWith(BULLET_MARKER) || rest.startsWith(BULLET_OUTLINE_MARKER)
      );
    case "numbered":
      return NUMBERED_MARKER_PATTERN.test(rest);
    case "checklist":
      return (
        rest.startsWith(CHECKLIST_UNCHECKED_MARKER) ||
        rest.startsWith(CHECKLIST_CHECKED_MARKER)
      );
  }
}

function stripLineMarker(line: string, style: ListStyle): string {
  if (!lineHasMarker(line, style)) return line;
  const { indent, rest } = splitIndent(line);
  switch (style) {
    case "bullet":
      return indent + rest.replace(/^(•|◦) /, "");
    case "numbered":
      return indent + rest.replace(NUMBERED_MARKER_PATTERN, "");
    case "checklist":
      return indent + rest.slice(CHECKLIST_UNCHECKED_MARKER.length);
  }
}

// Each depth's numbering counter resets when a shallower line is seen and
// resumes where it left off when nested back into
export function applyListStyle(text: string, style: ListStyle): string {
  const numCounters: number[] = [];

  return text
    .split("\n")
    .map((line) => {
      if (lineHasMarker(line, style)) return line;

      const { indent, rest } = splitIndent(line);
      const depth = getDepth(indent);

      let marker: string;
      if (style === "bullet") {
        marker = depth % 2 === 0 ? BULLET_MARKER : BULLET_OUTLINE_MARKER;
      } else if (style === "numbered") {
        numCounters[depth] = (numCounters[depth] || 0) + 1;
        numCounters.length = depth + 1;
        const n = numCounters[depth];
        marker = depth % 2 === 0 ? `${n}. ` : `${toAlpha(n)}. `;
      } else {
        marker = CHECKLIST_UNCHECKED_MARKER;
      }

      return indent + marker + rest;
    })
    .join("\n");
}

export function stripListStyle(text: string, style: ListStyle): string {
  return text
    .split("\n")
    .map((line) => stripLineMarker(line, style))
    .join("\n");
}

// Empty lines don't count against the style being active
export function hasListStyle(text: string, style: ListStyle): boolean {
  const lines = text.split("\n").filter((line) => line.trim().length > 0);
  if (lines.length === 0) return false;
  return lines.every((line) => lineHasMarker(line, style));
}

function clearOtherListStyles(text: string, style: ListStyle): string {
  return listStyles.reduce(
    (acc, otherStyle) =>
      otherStyle === style ? acc : stripListStyle(acc, otherStyle),
    text,
  );
}

// Activating a style clears any other, so a line only ever has one at a time
export function toggleListStyle(text: string, style: ListStyle): string {
  if (hasListStyle(text, style)) return stripListStyle(text, style);
  return applyListStyle(clearOtherListStyles(text, style), style);
}

// Cycles: not a checklist -> unchecked -> checked -> not a checklist.
// Mixed/partial checked states are treated as unchecked.
export function cycleChecklist(text: string): string {
  const lines = text.split("\n");
  const nonEmptyLines = lines.filter((line) => line.trim().length > 0);

  const allChecked =
    nonEmptyLines.length > 0 &&
    nonEmptyLines.every((line) =>
      splitIndent(line).rest.startsWith(CHECKLIST_CHECKED_MARKER),
    );

  if (!hasListStyle(text, "checklist")) {
    return applyListStyle(clearOtherListStyles(text, "checklist"), "checklist");
  }

  if (allChecked) return stripListStyle(text, "checklist");

  return lines
    .map((line) => {
      const { indent, rest } = splitIndent(line);
      if (!rest.startsWith(CHECKLIST_UNCHECKED_MARKER)) return line;
      return (
        indent +
        CHECKLIST_CHECKED_MARKER +
        rest.slice(CHECKLIST_UNCHECKED_MARKER.length)
      );
    })
    .join("\n");
}

export function shiftLineIndent(line: string, direction: 1 | -1): string {
  if (direction > 0) return INDENT_UNIT + line;

  const { indent, rest } = splitIndent(line);
  return (
    indent.slice(0, Math.max(0, indent.length - INDENT_UNIT.length)) + rest
  );
}

// Checklist markers don't depend on depth, so they're left as-is
export function reflowListMarkers(text: string): string {
  for (const style of listStyles) {
    if (style === "checklist") continue;
    if (hasListStyle(text, style)) {
      return applyListStyle(stripListStyle(text, style), style);
    }
  }
  return text;
}

export function shiftIndent(text: string, direction: 1 | -1): string {
  const indented = text
    .split("\n")
    .map((line) => shiftLineIndent(line, direction))
    .join("\n");

  return reflowListMarkers(indented);
}

// Inverse of toAlpha: a -> 1, aa -> 27
function fromAlpha(s: string): number {
  let n = 0;
  for (const ch of s) n = n * 26 + (ch.charCodeAt(0) - 96);
  return n;
}

// What pressing Enter on a list line should do: continue with the next
// marker, or - if the line is just a marker with no content - exit the
// list. Null if the line isn't a list item.
export type ListContinuation = { prefix: string } | { empty: true };

export function getListContinuation(line: string): ListContinuation | null {
  const { indent, rest } = splitIndent(line);

  if (
    rest.startsWith(BULLET_MARKER) ||
    rest.startsWith(BULLET_OUTLINE_MARKER)
  ) {
    const marker = rest.startsWith(BULLET_MARKER)
      ? BULLET_MARKER
      : BULLET_OUTLINE_MARKER;
    const content = rest.slice(marker.length);
    return content.trim().length === 0
      ? { empty: true }
      : { prefix: indent + marker };
  }

  if (
    rest.startsWith(CHECKLIST_UNCHECKED_MARKER) ||
    rest.startsWith(CHECKLIST_CHECKED_MARKER)
  ) {
    const marker = rest.startsWith(CHECKLIST_UNCHECKED_MARKER)
      ? CHECKLIST_UNCHECKED_MARKER
      : CHECKLIST_CHECKED_MARKER;
    const content = rest.slice(marker.length);
    return content.trim().length === 0
      ? { empty: true }
      : { prefix: indent + CHECKLIST_UNCHECKED_MARKER };
  }

  const numberedMatch = NUMBERED_MARKER_PATTERN.exec(rest);
  if (numberedMatch) {
    const token = numberedMatch[1]!;
    const content = rest.slice(numberedMatch[0].length);
    if (content.trim().length === 0) return { empty: true };

    const isNumeric = /^[0-9]+$/.test(token);
    const nextToken = isNumeric
      ? String(Number(token) + 1)
      : toAlpha(fromAlpha(token) + 1);
    return { prefix: indent + `${nextToken}. ` };
  }

  return null;
}
