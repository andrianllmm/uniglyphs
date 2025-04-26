export const fontFamilies = [
  "serif",
  "sansSerif",
  "script",
  "gothic",
  "monospace",
  "doubleStruck",
  "fullWidth",
] as const;
export type FontFamily = (typeof fontFamilies)[number];

export const fontVariants = ["normal", "bold", "italic", "boldItalic"] as const;
export type FontVariant = (typeof fontVariants)[number];

export const textDecorations = ["underline", "strikethrough"] as const;
export type TextDecoration = (typeof textDecorations)[number];
