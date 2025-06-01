"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { HotKeys } from "react-hotkeys";
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
import { getToolbarData, ToolbarData } from "./toolsData";
import {
  getTextboxState,
  TextboxElement,
  updateTextboxSelection,
  updateTextboxValue,
} from "./textboxState";

export type TextToolbarContextType = {
  style: TextStyle;
  block: BlockType | null | "";
  toolbarData: ToolbarData;
  insertText: (text?: string, type?: "selection" | "line") => void;
  toggleVariant: (variant: "bold" | "italic") => void;
  toggleDecoration: (decoration: TextDecoration) => void;
  styleSelection: (style: TextStyle) => void;
  makeBlock: (type: BlockType | null) => void;
  indent: (increase: boolean) => void;
};

const TextToolbarContext = createContext<TextToolbarContextType | undefined>(
  undefined
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
  textboxRef: React.RefObject<TextboxElement | null>;
};

export function TextToolbarProvider({ children, textboxRef }: Props) {
  const [style, setStyle] = useState<TextStyle>({
    family: "serif",
    bold: false,
    italic: false,
    decorations: [],
  });
  const [block, setBlock] = useState<BlockType | null | "">(null);

  const insertText = (
    text: string = "",
    type: "selection" | "line" = "selection"
  ) => {
    const textbox = textboxRef.current;
    if (!textbox) return;

    const {
      selectionStart,
      beforeSelection,
      afterSelection,
      beforeLine,
      afterLine,
    } = getTextboxState(textbox);

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

    updateTextboxValue(textbox, before + text + after);

    setTimeout(() => {
      updateTextboxSelection(
        textbox,
        selectionStart,
        selectionStart + text.length
      );
      textbox.focus();
    }, 0);
  };

  const styleSelection = (
    newStyle: TextStyle = {
      family: "serif",
      bold: false,
      italic: false,
      decorations: [],
    }
  ) => {
    const textbox = textboxRef.current;
    if (!textbox) return;

    const { selection } = getTextboxState(textbox);
    const styledSelection = applyTextStyles(selection, newStyle);
    insertText(styledSelection);

    setStyle(inferTextStyles(styledSelection));
    setBlock(inferBlockStyle(styledSelection));
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
    const textbox = textboxRef.current!;
    if (!textbox) return;

    const { line } = getTextboxState(textbox);
    const stripped = stripBlockStyle(line);
    const styledLine =
      type === block ? stripped : applyBlockStyle(stripped, type);
    insertText(styledLine, "line");

    setStyle(inferTextStyles(styledLine));
    setBlock(inferBlockStyle(styledLine));
  };

  const indent = (increase: boolean, indentChar: string = "\t") => {
    const textbox = textboxRef.current;
    if (!textbox) return;

    const { beforeLine, line, afterLine, selectionStart, selectionEnd } =
      getTextboxState(textbox);

    const lines = line
      .split("\n")
      .map((ln) =>
        increase
          ? `${indentChar}${ln}`
          : ln.startsWith(indentChar)
            ? ln.slice(1)
            : ln
      );
    const text = lines.join("\n");

    updateTextboxValue(textbox, beforeLine + text + afterLine);

    setTimeout(() => {
      textbox.focus();
      const shift = increase ? 1 : -1;
      updateTextboxSelection(
        textbox,
        Math.max(selectionStart + shift, 0),
        Math.max(selectionEnd + lines.length * shift, 0)
      );
    }, 0);
  };

  useEffect(() => {
    const handleSelectionChange = () => {
      const textbox = textboxRef.current;
      if (!textbox) return;
      const { selection, adjacentChar, line, selectionStart, selectionEnd } =
        getTextboxState(textbox);
      const inferredStyles = inferTextStyles(
        selectionStart === selectionEnd ? adjacentChar : selection
      );
      setStyle(inferredStyles);
      const inferredBlockType = inferBlockStyle(line);
      setBlock(inferredBlockType || "");
    };

    const textbox = textboxRef.current;
    if (!textbox) return;

    textbox.addEventListener("select", handleSelectionChange);
    textbox.addEventListener("keyup", handleSelectionChange);
    textbox.addEventListener("mouseup", handleSelectionChange);

    return () => {
      textbox.removeEventListener("select", handleSelectionChange);
      textbox.removeEventListener("keyup", handleSelectionChange);
      textbox.removeEventListener("mouseup", handleSelectionChange);
    };
  }, [textboxRef]);

  const toolbarData = getToolbarData({
    styleSelection,
    toggleVariant,
    toggleDecoration,
    makeBlock,
    indent,
  });

  const keyMap = Object.values(toolbarData).reduce(
    (acc, group) => {
      Object.values(group.tools).forEach((tool) => {
        acc[tool.label] = tool.hotkey;
      });
      return acc;
    },
    {} as Record<string, string>
  );

  const handlers = Object.values(toolbarData).reduce(
    (acc, section) => {
      Object.values(section.tools).forEach((tool) => {
        acc[tool.label] = tool.handler;
      });
      return acc;
    },
    {} as Record<string, () => void>
  );

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
      <HotKeys keyMap={keyMap} handlers={handlers}>
        {children}
      </HotKeys>
    </TextToolbarContext.Provider>
  );
}
