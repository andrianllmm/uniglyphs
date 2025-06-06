import { applyTextStyles, TextStyle } from "./engine";
import { fontFamilies, FontFamily, FontVariant, fontVariants } from "./styles";

export function getRandomStyle(): TextStyle {
  const randomFamily = fontFamilies[
    Math.floor(Math.random() * fontFamilies.length)
  ] as FontFamily;
  const randomVariant = fontVariants[
    Math.floor(Math.random() * fontVariants.length)
  ] as FontVariant;

  return {
    family: randomFamily,
    bold: randomVariant.includes("bold"),
    italic: randomVariant.includes("italic"),
    decorations: [],
  };
}

export function applyRandomStyle(text: string): string {
  const newText = text
    .split("")
    .map((char) => {
      const randomStyle = getRandomStyle();
      return applyTextStyles(char, randomStyle);
    })
    .join("");
  return newText;
}
