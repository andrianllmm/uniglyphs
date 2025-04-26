import { FontFamily, FontVariant } from "./styles";

export const styleOffsets: Record<
  FontFamily,
  Partial<Record<FontVariant, Record<string, number>>>
> = {
  serif: {
    normal: { upper: 0x41, lower: 0x61, digit: 0x30 },
    bold: { upper: 0x1d400, lower: 0x1d41a, digit: 0x1d7ce },
    italic: { upper: 0x1d434, lower: 0x1d44e, h: 0x210e },
    boldItalic: { upper: 0x1d468, lower: 0x1d482 },
  },
  sansSerif: {
    normal: { upper: 0x1d5a0, lower: 0x1d5ba, digit: 0x1d7e2 },
    bold: { upper: 0x1d5d4, lower: 0x1d5ee, digit: 0x1d7ec },
    italic: { upper: 0x1d608, lower: 0x1d622 },
    boldItalic: { upper: 0x1d63c, lower: 0x1d656 },
  },
  script: {
    normal: {
      upper: 0x1d49c,
      lower: 0x1d4b6,
      B: 0x212c,
      E: 0x2130,
      F: 0x2131,
      H: 0x210b,
      I: 0x2110,
      L: 0x2112,
      M: 0x2133,
      R: 0x211b,
      e: 0x1d4ee,
      g: 0x1d4f0,
      o: 0x1d4f8,
    },
    bold: { upper: 0x1d4d0, lower: 0x1d4ea },
  },
  gothic: {
    normal: {
      upper: 0x1d504,
      lower: 0x1d51e,
      C: 0x212d,
      H: 0x210c,
      I: 0x2111,
      R: 0x211c,
      Z: 0x2128,
    },
    bold: { upper: 0x1d56c, lower: 0x1d586 },
  },
  monospace: {
    normal: {
      upper: 0x1d670,
      lower: 0x1d68a,
      digit: 0x1d7f6,
      " ": 0x2000,
      "-": 0x2013,
    },
  },
  doubleStruck: {
    normal: {
      upper: 0x1d538,
      lower: 0x1d552,
      digit: 0x1d7d8,
      C: 0x2102,
      H: 0x210d,
      N: 0x2115,
      P: 0x2119,
      Q: 0x211a,
      R: 0x211d,
      Z: 0x2124,
    },
  },
  fullWidth: {
    normal: {
      upper: 0xff21,
      lower: 0xff41,
      digit: 0xff10,
    },
  },
};

export const decorationOffsets = {
  underline: 0x0332,
  strikethrough: 0x0336,
} as const;
