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

// Character codes for reference ranges
const CHAR_CODE = {
  A: 0x41,
  Z: 0x5a,
  a: 0x61,
  z: 0x7a,
  zero: 0x30,
  nine: 0x39,
} as const;

// Regex to match combining marks (accents, diacritics)
const COMBINING_MARKS = /[\u0300-\u036f]/g;

export type TextStyle = {
  family: FontFamily;
  bold: boolean;
  italic: boolean;
  decorations: TextDecoration[];
};

/**
 * Applies given text styles by mapping chars to styled Unicode variants
 * and appends decoration marks as combining characters.
 */
export function applyTextStyles(text: string, style: TextStyle): string {
  const { family, bold, italic, decorations } = style;
  const variant = getFontVariantKey(bold, italic);

  // Get style offsets for the font family and variant
  const familyOffsets = styleOffsets[family];
  if (!familyOffsets) return text;

  const offsets = familyOffsets[variant] ?? familyOffsets["normal"];
  if (!offsets) return text;

  // Convert decorations to corresponding combining marks
  const marks = decorations
    .map((decoration) => String.fromCodePoint(decorationOffsets[decoration]))
    .join("");

  text = stripTextStyles(text);

  const result: string[] = [];

  for (const char of text) {
    const code = char.codePointAt(0);
    if (!code) {
      result.push(char);
      continue;
    }

    let transformed = char;

    // Transform the character by applying offsets
    if (transformed in offsets) {
      transformed = String.fromCodePoint(offsets[transformed] || code);
    } else if (
      offsets.upper !== undefined &&
      code >= CHAR_CODE.A &&
      code <= CHAR_CODE.Z
    ) {
      transformed = String.fromCodePoint(code + offsets.upper - CHAR_CODE.A);
    } else if (
      offsets.lower !== undefined &&
      code >= CHAR_CODE.a &&
      code <= CHAR_CODE.z
    ) {
      transformed = String.fromCodePoint(code + offsets.lower - CHAR_CODE.a);
    } else if (
      offsets.digit !== undefined &&
      code >= CHAR_CODE.zero &&
      code <= CHAR_CODE.nine
    ) {
      transformed = String.fromCodePoint(code + offsets.digit - CHAR_CODE.zero);
    }

    // Append combining marks
    result.push(transformed + marks);
  }

  return result.join("");
}

/**
 * Infers text styles from the first character of the text by checking
 * which style offsets it falls into and detects applied decorations.
 */
export function inferTextStyles(text: string): TextStyle {
  let family: FontFamily = "serif";
  let bold = false;
  let italic = false;
  const decorations: TextDecoration[] = [];

  const code = text.codePointAt(0) || NaN;

  // Determine font family and variant by checking code ranges in styleOffsets
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

  // Detect any decoration combining marks in the text
  for (const decoration of textDecorations) {
    if (text.includes(String.fromCodePoint(decorationOffsets[decoration]))) {
      decorations.push(decoration);
    }
  }

  return { family, bold, italic, decorations };
}

/**
 * Removes all applied text styles by reversing style offsets and
 * stripping decoration combining marks and diacritics.
 */
export function stripTextStyles(text: string): string {
  // Normalize text and remove combining marks (diacritics)
  text = text.normalize("NFKC").normalize("NFD").replace(COMBINING_MARKS, "");

  const { family, bold, italic } = inferTextStyles(text);
  const variant = getFontVariantKey(bold, italic);

  const familyOffsets = styleOffsets[family];
  if (!familyOffsets) return text;

  const offsets = familyOffsets[variant];
  if (!offsets) return text;

  const result: string[] = [];

  for (const char of text) {
    const code = char.codePointAt(0);
    if (!code) {
      result.push(char);
      continue;
    }

    let transformed = char;

    if (
      code >= CHAR_CODE.A &&
      code <= CHAR_CODE.Z &&
      offsets.upper !== undefined
    ) {
      transformed = String.fromCodePoint(code - offsets.upper + CHAR_CODE.A);
    } else if (
      code >= CHAR_CODE.a &&
      code <= CHAR_CODE.z &&
      offsets.lower !== undefined
    ) {
      transformed = String.fromCodePoint(code - offsets.lower + CHAR_CODE.a);
    } else if (
      code >= CHAR_CODE.zero &&
      code <= CHAR_CODE.nine &&
      offsets.digit !== undefined
    ) {
      transformed = String.fromCodePoint(code - offsets.digit + CHAR_CODE.zero);
    }

    result.push(transformed);
  }

  return result.join("");
}

/** Returns the variant key string based on bold/italic flags */
export function getFontVariantKey(bold: boolean, italic: boolean): FontVariant {
  if (bold && italic) return "boldItalic";
  if (bold) return "bold";
  if (italic) return "italic";
  return "normal";
}

/** Returns bold and italic flags from variant key string */
export function getFontVariantByKey(key: FontVariant): {
  bold: boolean;
  italic: boolean;
} {
  return {
    bold: key === "bold" || key === "boldItalic",
    italic: key === "italic" || key === "boldItalic",
  };
}

/** Formats font family from camelCase to sentence case */
export function formatFontName(text: string): string {
  return text.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase());
}
