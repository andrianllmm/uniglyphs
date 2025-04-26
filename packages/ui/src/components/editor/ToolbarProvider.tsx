"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  applyTextStyles,
  inferTextStyles,
  TextDecoration,
  TextStyle,
} from "@workspace/ui/lib/textTools/textStyle";
import {
  applyBlockStyle,
  BlockType,
  inferBlockStyle,
  stripBlockStyle,
} from "@workspace/ui/lib/textTools/textBlock";
import { getToolbarData } from "./toolsData";
import { registerHotkeys } from "./toolsHotkeys";
import { getTextBoxState } from "./textboxState";

export type TextToolbarContextType = {
  style: TextStyle;
  block: BlockType | null | "";
  toolbarData: ReturnType<typeof getToolbarData>;
  insertText: (text?: string, type?: "selection" | "line") => void;
  toggleVariant: (variant: "bold" | "italic") => void;
  toggleDecoration: (decoration: TextDecoration) => void;
  styleSelection: (style: TextStyle) => void;
  makeBlock: (type: BlockType | null) => void;
  indent: (increase: boolean) => void;
};

const TextToolbarContext = createContext<TextToolbarContextType | undefined>(
  undefined,
);

export const useTextToolbar = () => {
  const context = useContext(TextToolbarContext);
  if (!context) {
    throw new Error("useTextToolbar must be used within a TextToolbarProvider");
  }
  return context;
};

type Props = {
  children: React.ReactNode;
  textBoxRef: React.RefObject<HTMLTextAreaElement | HTMLInputElement | null>;
};

export function TextToolbarProvider({ children, textBoxRef }: Props) {
  const [style, setStyle] = useState<TextStyle>({
    family: "serif",
    bold: false,
    italic: false,
    decorations: [],
  });
  const [block, setBlock] = useState<BlockType | null | "">(null);

  const insertText = (
    text: string = "",
    type: "selection" | "line" = "selection",
  ) => {
    const textbox = textBoxRef.current;
    if (!textbox) return;

    const {
      selectionStart,
      beforeSelection,
      afterSelection,
      beforeLine,
      afterLine,
    } = getTextBoxState(textbox);

    let before = "",
      after = "";

    if (type === "selection") {
      before = beforeSelection;
      after = afterSelection;
    } else if (type === "line") {
      before = beforeLine;
      after = afterLine;
    } else {
      throw new Error("Invalid type");
    }

    textbox.value = before + text + after;

    setTimeout(() => {
      textbox.selectionStart = selectionStart;
      textbox.selectionEnd = selectionStart + text.length;
      textbox.focus();
    }, 0);
  };

  const styleSelection = (
    newStyle: TextStyle = {
      family: "serif",
      bold: false,
      italic: false,
      decorations: [],
    },
  ) => {
    const textbox = textBoxRef.current;
    if (!textbox) return;

    const { selection } = getTextBoxState(textbox);

    insertText(applyTextStyles(selection, newStyle));
  };

  const toggleVariant = (variant: "bold" | "italic") => {
    styleSelection({
      ...style,
      [variant]: style[variant] ? !style[variant] : true,
    });
  };

  const toggleDecoration = (decoration: TextDecoration) => {
    const newDecorations = style.decorations.includes(decoration)
      ? style.decorations.filter((d) => d !== decoration)
      : [...style.decorations, decoration];
    styleSelection({ ...style, decorations: newDecorations });
  };

  const makeBlock = (type: BlockType | null) => {
    const textbox = textBoxRef.current!;
    if (!textbox) return;

    const { line } = getTextBoxState(textbox);
    const stripped = stripBlockStyle(line);
    insertText(
      type === block ? stripped : applyBlockStyle(stripped, type),
      "line",
    );
  };

  const indent = (increase: boolean, indentChar: string = "\t") => {
    const textbox = textBoxRef.current;
    if (!textbox) return;

    const { beforeLine, line, afterLine, selectionStart, selectionEnd } =
      getTextBoxState(textbox);

    const lines = line
      .split("\n")
      .map((ln) =>
        increase
          ? `${indentChar}${ln}`
          : ln.startsWith(indentChar)
            ? ln.slice(1)
            : ln,
      );
    const text = lines.join("\n");

    textbox.value = beforeLine + text + afterLine;

    setTimeout(() => {
      textbox.focus();
      const shift = increase ? 1 : -1;
      textbox.selectionStart = Math.max(selectionStart + shift, 0);
      textbox.selectionEnd = Math.max(selectionEnd + lines.length * shift, 0);
    }, 0);
  };

  const handleSelectionChange = () => {
    const textbox = textBoxRef.current;
    if (!textbox) return;
    const { selection, adjacentChar, line, selectionStart, selectionEnd } =
      getTextBoxState(textbox);

    const inferredStyles = inferTextStyles(
      selectionStart === selectionEnd ? adjacentChar : selection,
    );
    setStyle(inferredStyles);

    const inferredBlockType = inferBlockStyle(line);
    setBlock(inferredBlockType || "");
  };

  useEffect(() => {
    const textbox = textBoxRef.current;
    if (!textbox) return;

    textbox.addEventListener("select", handleSelectionChange);
    textbox.addEventListener("keyup", handleSelectionChange);
    textbox.addEventListener("mouseup", handleSelectionChange);

    return () => {
      textbox.removeEventListener("select", handleSelectionChange);
      textbox.removeEventListener("keyup", handleSelectionChange);
      textbox.removeEventListener("mouseup", handleSelectionChange);
    };
  }, [textBoxRef]);

  const toolbarData = getToolbarData({
    styleSelection: styleSelection,
    toggleVariant,
    toggleDecoration,
    makeBlock: makeBlock,
    indent,
  });

  registerHotkeys(toolbarData, textBoxRef);

  return (
    <TextToolbarContext.Provider
      value={{
        style,
        block,
        toolbarData,
        insertText,
        styleSelection,
        toggleVariant,
        toggleDecoration,
        makeBlock,
        indent,
      }}
    >
      {children}
    </TextToolbarContext.Provider>
  );
}
