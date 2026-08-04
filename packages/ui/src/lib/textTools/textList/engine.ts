import { ListStyle } from "@workspace/ui/lib/textTools/textList/styles";

// Unicode markers prepended to each line for a given list style
const listMarkers: Record<ListStyle, string> = {
  bullet: "• ",
};

/** Prepends the list marker to every line that doesn't already have it */
export function applyListStyle(text: string, style: ListStyle): string {
  const marker = listMarkers[style];
  return text
    .split("\n")
    .map((line) => (line.startsWith(marker) ? line : marker + line))
    .join("\n");
}

/** Removes the list marker from every line that has it */
export function stripListStyle(text: string, style: ListStyle): string {
  const marker = listMarkers[style];
  return text
    .split("\n")
    .map((line) => (line.startsWith(marker) ? line.slice(marker.length) : line))
    .join("\n");
}

/** Checks whether every non-empty line already has the list style applied */
export function hasListStyle(text: string, style: ListStyle): boolean {
  const marker = listMarkers[style];
  const lines = text.split("\n").filter((line) => line.trim().length > 0);
  if (lines.length === 0) return false;
  return lines.every((line) => line.startsWith(marker));
}

/** Toggles the list style on the given block of text (one or more lines) */
export function toggleListStyle(text: string, style: ListStyle): string {
  return hasListStyle(text, style)
    ? stripListStyle(text, style)
    : applyListStyle(text, style);
}
