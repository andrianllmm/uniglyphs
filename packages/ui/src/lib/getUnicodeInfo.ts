/**
 * Returns information about a Unicode character.
 */
const emptyInfo = {
  character: "",
  hexCodePoint: "",
  codePoint: "",
  utf8: "",
  utf16: "",
};

export function getUnicodeInfo(char: string): {
  character: string;
  hexCodePoint: string;
  codePoint: string;
  utf8: string;
  utf16: string;
} {
  const charCode = char.codePointAt(0);
  if (!charCode) return emptyInfo;

  const charHexCodePoint = charCode.toString(16).toUpperCase();
  const charCodePoint = charCode.toString();
  const charUtf8 = char.normalize("NFKC").codePointAt(0)!.toString(16);
  const charUtf16 = char.normalize("NFKC").codePointAt(0)!.toString(16);

  return {
    character: char,
    hexCodePoint: charHexCodePoint,
    codePoint: charCodePoint,
    utf8: charUtf8,
    utf16: charUtf16,
  };
}
