export const blockTypes = ["bullet", "numbered"] as const;
export type BlockType = (typeof blockTypes)[number];

const blockSymbols: Record<BlockType, string> = {
  bullet: "•",
  numbered: "",
};

export function applyBlockStyle(
  text: string,
  type?: BlockType | null,
  options?: { indent?: number }
): string {
  if (!type || !blockTypes.includes(type)) return text;

  const indent = " ".repeat(options?.indent ?? 0);

  const lines = text.split("\n").map((line, index) => {
    if (type === "bullet") {
      return `${indent}${blockSymbols[type]} ${line}`;
    } else if (type === "numbered") {
      return `${indent}${index + 1}. ${line}`;
    }
    return line;
  });

  return lines.join("\n");
}

export function inferBlockStyle(text: string): BlockType | null {
  if (text.trim() === "") return null;

  const lines = text.split("\n").filter((line) => line.trim() !== "");

  if (lines.every((line) => line.trimStart().startsWith(blockSymbols.bullet))) {
    return "bullet";
  }

  if (
    lines.every((line, index) => line.trimStart().startsWith(`${index + 1}.`))
  ) {
    return "numbered";
  }

  return null;
}

export function stripBlockStyle(text: string): string {
  if (text.trim() === "") return text;

  const lines = text.split("\n");

  const stripped = lines.map((line) => {
    if (line.trimStart().startsWith(blockSymbols.bullet)) {
      return line.trimStart().slice(blockSymbols.bullet.length).trimStart();
    }

    if (line.trimStart().match(/^\d+\.\s/)) {
      return line
        .trimStart()
        .replace(/^\d+\.\s/, "")
        .trimStart();
    }

    return line;
  });

  return stripped.join("\n");
}
