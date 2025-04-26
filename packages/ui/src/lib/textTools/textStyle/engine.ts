import {
  textDecorations,
  FontFamily,
  FontVariant,
  TextDecoration,
} from "@workspace/ui/lib/textTools/textStyle/styles";
import {
  decorationOffsets,
  styleOffsets,
} from "@workspace/ui/lib/textTools/textStyle/offsets";

const CharCode = {
  A: 0x41,
  Z: 0x5a,
  a: 0x61,
  z: 0x7a,
  zero: 0x30,
  nine: 0x39,
} as const;

const CombiningMarks = /[\u0300-\u036f]/g;

export type TextStyle = {
  family: FontFamily;
  bold: boolean;
  italic: boolean;
  decorations: TextDecoration[];
};

export function applyTextStyles(text: string, style: TextStyle): string {
  const { family, bold, italic, decorations } = style;

  const variant = getFontVariantKey(bold, italic);

  const offsets =
    styleOffsets[family][variant] ?? styleOffsets[family]["normal"];
  if (!offsets) return text;

  const marks = decorations
    .map((decoration) => String.fromCodePoint(decorationOffsets[decoration]))
    .join("");

  text = stripTextStyles(text);

  let result: string[] = [];

  for (const char of text) {
    const code = char.codePointAt(0);
    if (!code) {
      result.push(char);
      continue;
    }

    let transformed = char;

    if (transformed in offsets) {
      transformed = String.fromCodePoint(offsets[transformed] || code);
    } else if (
      offsets.upper !== undefined &&
      code >= CharCode.A &&
      code <= CharCode.Z
    ) {
      transformed = String.fromCodePoint(code + offsets.upper - CharCode.A);
    } else if (
      offsets.lower !== undefined &&
      code >= CharCode.a &&
      code <= CharCode.z
    ) {
      transformed = String.fromCodePoint(code + offsets.lower - CharCode.a);
    } else if (
      offsets.digit !== undefined &&
      code >= CharCode.zero &&
      code <= CharCode.nine
    ) {
      transformed = String.fromCodePoint(code + offsets.digit - CharCode.zero);
    }

    result.push(transformed + marks);
  }

  return result.join("");
}

export function inferTextStyles(text: string): TextStyle {
  let family: FontFamily = "serif";
  let bold = false;
  let italic = false;
  let decorations: TextDecoration[] = [];

  const code = text.codePointAt(0) || NaN;

  for (const [key, variants] of Object.entries(styleOffsets)) {
    for (const [variant, offsets] of Object.entries(variants)) {
      const upperInRange =
        offsets.upper !== undefined &&
        code >= offsets.upper &&
        code <= offsets.upper + 25;

      const lowerInRange =
        offsets.lower !== undefined &&
        code >= offsets.lower &&
        code <= offsets.lower + 25;

      const digitInRange =
        offsets.digit !== undefined &&
        code >= offsets.digit &&
        code <= offsets.digit + 9;

      if (upperInRange || lowerInRange || digitInRange) {
        const { bold: b, italic: i } = getFontVariantByKey(
          variant as FontVariant
        );
        bold = b;
        italic = i;
        family = key as FontFamily;
        break;
      }
    }
  }

  for (const decoration of textDecorations) {
    if (text.includes(String.fromCodePoint(decorationOffsets[decoration]))) {
      decorations.push(decoration);
    }
  }

  return { family, bold, italic, decorations };
}

export function stripTextStyles(text: string): string {
  text = text.normalize("NFKC").normalize("NFD").replace(CombiningMarks, "");

  const { family, bold, italic } = inferTextStyles(text);
  const offsets = styleOffsets[family][getFontVariantKey(bold, italic)];
  if (!offsets) return text;

  let result: string[] = [];

  for (const char of text) {
    const code = char.codePointAt(0);
    if (!code) {
      result.push(char);
      continue;
    }

    let transformed = char;

    if (
      code >= CharCode.A &&
      code <= CharCode.Z &&
      offsets.upper !== undefined
    ) {
      transformed = String.fromCodePoint(code - offsets.upper + CharCode.A);
    } else if (
      code >= CharCode.a &&
      code <= CharCode.z &&
      offsets.lower !== undefined
    ) {
      transformed = String.fromCodePoint(code - offsets.lower + CharCode.a);
    } else if (
      code >= CharCode.zero &&
      code <= CharCode.nine &&
      offsets.digit !== undefined
    ) {
      transformed = String.fromCodePoint(code - offsets.digit + CharCode.zero);
    }

    result.push(transformed);
  }

  return result.join("");
}

export function getFontVariantKey(bold: boolean, italic: boolean): FontVariant {
  if (bold && italic) return "boldItalic";
  if (bold) return "bold";
  if (italic) return "italic";
  return "normal";
}

export function getFontVariantByKey(key: FontVariant): {
  bold: boolean;
  italic: boolean;
} {
  return {
    bold: key === "bold" || key === "boldItalic",
    italic: key === "italic" || key === "boldItalic",
  };
}

export function formatFontName(text: string): string {
  return text.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase());
}
