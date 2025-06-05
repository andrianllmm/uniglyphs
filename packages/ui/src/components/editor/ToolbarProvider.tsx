"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { HotKeys } from "react-hotkeys";
import {
  applyTextStyles,
  inferTextStyles,
  TextDecoration,
  TextStyle,
} from "@workspace/ui/lib/textTools/textStyle";
import { getToolbarData, ToolbarData } from "./toolsData";
import {
  getTextboxState,
  TextboxElement,
  updateTextboxSelection,
  insertTextboxValue,
} from "../../lib/textboxState";

export type TextToolbarContextType = {
  style: TextStyle;
  toolbarData: ToolbarData;
  insertText: (text?: string, type?: "selection" | "line") => void;
  toggleVariant: (variant: "bold" | "italic") => void;
  toggleDecoration: (decoration: TextDecoration) => void;
  styleSelection: (style: TextStyle) => void;
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

  // Insert text into the textbox and preserve selection
  const insertText = (text: string = "") => {
    const textbox = textboxRef.current;
    if (!textbox) return;

    const { selectionStart } = getTextboxState(textbox);

    insertTextboxValue(textbox, text);

    // Restore selection after update
    setTimeout(() => {
      updateTextboxSelection(
        textbox,
        selectionStart,
        selectionStart + text.length
      );
      textbox.focus();
    }, 0);
  };

  // Apply a text style to the current selection
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
  };

  // Toggle bold or italic styles
  const toggleVariant = (variant: "bold" | "italic") => {
    styleSelection({
      ...style,
      [variant]: style[variant] ? !style[variant] : true,
    });
  };

  // Toggle a text decoration
  const toggleDecoration = (decoration: TextDecoration) => {
    const newDecorations = style.decorations.includes(decoration)
      ? style.decorations.filter((d) => d !== decoration)
      : [...style.decorations, decoration];
    styleSelection({ ...style, decorations: newDecorations });
  };

  // Listen to selection changes and update style state accordingly
  useEffect(() => {
    const handleSelectionChange = () => {
      const textbox = textboxRef.current;
      if (!textbox) return;

      // Infer style from selected text or adjacent char if collapsed
      const { selection, adjacentChar, selectionStart, selectionEnd } =
        getTextboxState(textbox);
      const inferredStyles = inferTextStyles(
        selectionStart === selectionEnd ? adjacentChar : selection
      );
      setStyle(inferredStyles);
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

  // Build toolbar config from available tools
  const toolbarData = getToolbarData({
    styleSelection,
    toggleVariant,
    toggleDecoration,
  });

  // Create key mappings for keyboard shortcuts
  const keyMap = Object.values(toolbarData).reduce(
    (acc, group) => {
      Object.values(group.tools).forEach((tool) => {
        acc[tool.label] = tool.hotkey;
      });
      return acc;
    },
    {} as Record<string, string>
  );

  // Create event handlers for keyboard shortcuts
  const handlers = Object.values(toolbarData).reduce(
    (acc, section) => {
      Object.values(section.tools).forEach((tool) => {
        acc[tool.label] = tool.handler;
      });
      return acc;
    },
    {} as Record<string, () => void>
  );

  // Wrap children with context and HotKeys handler
  return (
    <TextToolbarContext.Provider
      value={{
        style,
        toolbarData,
        insertText,
        styleSelection,
        toggleVariant,
        toggleDecoration,
      }}
    >
      <HotKeys keyMap={keyMap} handlers={handlers}>
        {children}
      </HotKeys>
    </TextToolbarContext.Provider>
  );
}
