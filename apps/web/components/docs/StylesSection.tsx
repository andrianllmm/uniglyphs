"use client";

import { useState } from "react";
import {
  applyTextStyles,
  fontFamilies,
  FontFamily,
  FontVariant,
  fontVariants,
  getFontVariantByKey,
  getFontVariantKey,
  TextDecoration,
  textDecorations,
  TextStyle,
} from "@workspace/ui/lib/textTools/textStyle";
import { cva } from "class-variance-authority";
import { H1, H2, P } from "@workspace/ui/components/heading-with-anchor";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@workspace/ui/components/toggle-group";
import { Button } from "@workspace/ui/components/button";

const LETTERS = "abcdefghijklmnopqrstuvwxyz";
const NUMBERS = "0123456789";
const SYMBOLS = ".,";
const SAMPLE_TEXT = "Pack my box with five dozen liquor jugs.";

const toggleGroupItemClass = cva(
  "p-1 border-2 rounded! text-center bg-background! hover:border-primary data-[state=on]:border-primary data-[state=off]:border-dotted"
);

export function StylesSection() {
  const [letters, setLetters] = useState(LETTERS);
  const [style, setStyle] = useState<TextStyle>({
    family: "serif",
    bold: false,
    italic: false,
    decorations: [],
  });

  return (
    <>
      <H1 anchor="tools">Styles</H1>

      <P>
        These styles work by replacing each letter with a different version of
        it from the Unicode set.
      </P>
      <br />

      {/* Sample preview */}
      <div className="mb-1">
        {/* Sentence */}
        <div className="p-1 text-center text-sm border-2 border-dotted hover:border-primary">
          {applyTextStyles(SAMPLE_TEXT, style)}
        </div>
        {/* Characters */}
        <div className="grid gap-0 grid-cols-[repeat(auto-fit,minmax(2rem,1fr))]">
          {[
            ...applyTextStyles(
              [...letters, ...NUMBERS, ...SYMBOLS].join(""),
              style
            ),
          ].map((char, index) => (
            <div
              key={index}
              className="select-none p-1 text-center text-sm border-2 border-dotted hover:border-primary"
              title={"U+" + char.codePointAt(0)?.toString(16)}
            >
              {char}
            </div>
          ))}
        </div>
      </div>

      {/* Footer of sample preview */}
      <div className="flex">
        {/* Info text */}
        <div className="text-muted-foreground text-xs me-auto">
          Hover to see Unicode number
        </div>

        {/* Case options */}
        <Button
          variant="ghost"
          size="icon"
          className="text-xs font-semibold p-1 !w-fit !h-fit"
          onClick={() => setLetters(LETTERS.toUpperCase())}
        >
          AB
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="text-xs font-semibold p-1 !w-fit !h-fit"
          onClick={() => setLetters(LETTERS.toLowerCase())}
        >
          ab
        </Button>
      </div>

      <br />

      {/* Font family grid */}
      <H2 anchor="font-families">Font Families</H2>
      <ToggleGroup
        type="single"
        defaultValue="serif"
        value={style.family}
        onValueChange={(family: FontFamily) =>
          setStyle((prev) => ({ ...prev, family }))
        }
        className="w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2"
      >
        {fontFamilies.map((fontFamily) => (
          <ToggleGroupItem
            key={fontFamily}
            value={fontFamily}
            className={toggleGroupItemClass()}
          >
            {applyTextStyles(fontFamily, {
              family: fontFamily,
              bold: false,
              italic: false,
              decorations: [],
            })}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      <br />

      <H2 anchor="font-variants">Font Variants</H2>
      <ToggleGroup
        type="single"
        defaultValue="normal"
        value={getFontVariantKey(style.bold, style.italic)}
        onValueChange={(variant: FontVariant) =>
          setStyle((prev) => ({ ...prev, ...getFontVariantByKey(variant) }))
        }
        className="w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2"
      >
        {fontVariants.map((variant) => (
          <ToggleGroupItem
            key={variant}
            value={variant}
            className={toggleGroupItemClass()}
          >
            {applyTextStyles(variant, {
              family: "serif",
              bold: false,
              italic: false,
              decorations: [],
            })}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      <br />

      <H2 anchor="text-decorations">Text Decorations</H2>
      <ToggleGroup
        type="multiple"
        value={style.decorations}
        onValueChange={(decorations: TextDecoration[]) =>
          setStyle((prev) => ({ ...prev, decorations }))
        }
        className="w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2"
      >
        {textDecorations.map((decoration) => (
          <ToggleGroupItem
            key={decoration}
            value={decoration}
            className={toggleGroupItemClass()}
          >
            {applyTextStyles(decoration, {
              family: "serif",
              bold: false,
              italic: false,
              decorations: [decoration],
            })}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      <br />
    </>
  );
}
