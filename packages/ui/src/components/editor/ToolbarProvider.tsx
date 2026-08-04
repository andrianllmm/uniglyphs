"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import {
  applyTextStyles,
  inferTextStyles,
  TextDecoration,
  TextStyle,
} from "@workspace/ui/lib/textTools/textStyle";
import {
  hasListStyle,
  toggleListStyle,
  cycleChecklist,
  shiftLineIndent,
  reflowListMarkers,
  getListContinuation,
  ListStyle,
} from "@workspace/ui/lib/textTools/textList";
import { getToolbarData, ToolbarData } from "./toolsData";
import {
  getTextboxState,
  TextboxElement,
  updateTextboxSelection,
  insertTextboxValue,
} from "../../lib/textboxState";

/**
 * Expands [lineStart, lineEnd) outward to the full contiguous run of
 * non-blank lines around it (a blank line breaks the run). Used so a Tab
 * press on a single list item can renumber siblings elsewhere in the list.
 */
function getBlockRange(text: string, lineStart: number, lineEnd: number) {
  let blockStart = lineStart;
  while (blockStart > 0) {
    const prevLineStart = text.lastIndexOf("\n", blockStart - 2) + 1;
    const prevLine = text.slice(prevLineStart, blockStart - 1);
    if (prevLine.trim().length === 0) break;
    blockStart = prevLineStart;
  }

  let blockEnd = lineEnd;
  while (blockEnd < text.length) {
    const nextLineStart = blockEnd + 1;
    const nextLineEndRaw = text.indexOf("\n", nextLineStart);
    const nextLineEnd = nextLineEndRaw === -1 ? text.length : nextLineEndRaw;
    const nextLine = text.slice(nextLineStart, nextLineEnd);
    if (nextLine.trim().length === 0) break;
    blockEnd = nextLineEnd;
  }

  return { blockStart, blockEnd };
}

/**
 * Reflows bullet/numbered markers across the contiguous list block around
 * [lineStart, lineEnd) in `text`, writes the result into the textbox, and
 * returns the absolute position at the end of that (now reflowed) line -
 * used to place a collapsed cursor there afterwards.
 */
function reflowBlockAndLocateLineEnd(
  textbox: TextboxElement,
  text: string,
  lineStart: number,
  lineEnd: number,
): number {
  const { blockStart, blockEnd } = getBlockRange(text, lineStart, lineEnd);
  const blockText = text.slice(blockStart, blockEnd);
  const reflowed = reflowListMarkers(blockText);

  const lineIndex =
    blockText.slice(0, lineStart - blockStart).split("\n").length - 1;
  const reflowedLines = reflowed.split("\n");
  const linesBefore = reflowedLines.slice(0, lineIndex);
  const targetLine = reflowedLines[lineIndex] ?? "";
  const relEnd =
    linesBefore.reduce((sum, l) => sum + l.length + 1, 0) + targetLine.length;
  const finalCursorPos = blockStart + relEnd;

  updateTextboxSelection(textbox, blockStart, blockEnd);
  insertTextboxValue(textbox, reflowed);
  // Collapse the selection synchronously: leaving the whole block selected
  // (even briefly, until a later setTimeout) risks a fast keystroke right
  // after this - very common right after Enter - replacing the entire block.
  updateTextboxSelection(textbox, finalCursorPos, finalCursorPos);

  return finalCursorPos;
}

export type ToolbarContextType = {
  style: TextStyle;
  isListActive: (listStyle: ListStyle) => boolean;
  toolbarData: ToolbarData;
  insertText: (text?: string, type?: "selection" | "line") => void;
  toggleVariant: (variant: "bold" | "italic") => void;
  toggleDecoration: (decoration: TextDecoration) => void;
  styleSelection: (style: TextStyle) => void;
  toggleList: (listStyle: ListStyle) => void;
};

const ToolbarContext = createContext<ToolbarContextType | undefined>(undefined);

export const useToolbar = () => {
  const context = useContext(ToolbarContext);
  if (!context) {
    throw new Error("useToolbar must be used within a ToolbarProvider");
  }
  return context;
};

type Props = {
  children: React.ReactNode;
  textboxRef: React.RefObject<TextboxElement | null>;
  onInsertText?: (text: string) => void;
};

export function ToolbarProvider({ children, textboxRef, onInsertText }: Props) {
  const [style, setStyle] = useState<TextStyle>({
    family: "serif",
    bold: false,
    italic: false,
    decorations: [],
  });
  const [line, setLine] = useState("");

  // Check whether the current line(s) already have a given list style applied
  const isListActive = (listStyle: ListStyle) => hasListStyle(line, listStyle);

  // Insert text into the textbox and preserve selection.
  // "line" replaces the whole line(s) the selection spans, rather than just the selection.
  const insertText = (
    text: string = "",
    type: "selection" | "line" = "selection",
  ) => {
    const textbox = textboxRef.current;
    if (!textbox) return;

    const state = getTextboxState(textbox);
    const start = type === "line" ? state.lineStart : state.selectionStart;

    if (type === "line") {
      updateTextboxSelection(textbox, state.lineStart, state.lineEnd);
    }

    insertTextboxValue(textbox, text);

    // Restore selection after update
    setTimeout(() => {
      updateTextboxSelection(textbox, start, start + text.length);
      textbox.focus();
    }, 0);

    if (onInsertText) onInsertText(text);
  };

  // Apply a text style to the current selection
  const styleSelection = (
    newStyle: TextStyle = {
      family: "serif",
      bold: false,
      italic: false,
      decorations: [],
    },
  ) => {
    const textbox = textboxRef.current;
    if (!textbox) return;

    const { selection } = getTextboxState(textbox);
    const styledSelection = applyTextStyles(selection, newStyle);
    insertText(styledSelection);

    setStyle(newStyle);
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

  // Toggle a list style on the line(s) the selection spans
  const toggleList = (listStyle: ListStyle) => {
    const textbox = textboxRef.current;
    if (!textbox) return;

    const { line } = getTextboxState(textbox);
    const toggled =
      listStyle === "checklist"
        ? cycleChecklist(line)
        : toggleListStyle(line, listStyle);
    insertText(toggled, "line");

    setLine(toggled);
  };

  // Build toolbar config from available tools
  const toolbarData = getToolbarData({
    styleSelection,
    toggleVariant,
    toggleDecoration,
    toggleList,
  });

  // Listen to selection changes and update style state accordingly
  useEffect(() => {
    const handleSelectionChange = () => {
      const textbox = textboxRef.current;
      if (!textbox) return;

      // Infer style from selected text or adjacent char if collapsed
      const { selection, adjacentChar, selectionStart, selectionEnd, line } =
        getTextboxState(textbox);

      const inferredStyles = inferTextStyles(
        selectionStart === selectionEnd ? adjacentChar : selection,
      );

      setStyle(inferredStyles);
      setLine(line);
    };

    const textbox = textboxRef.current;
    if (!textbox) return;

    const windowEvents = ["input", "keyup", "mouseup"];
    const documentEvents = ["selectionchange"];

    windowEvents.forEach((e) =>
      window.addEventListener(e, handleSelectionChange),
    );
    documentEvents.forEach((e) =>
      document.addEventListener(e, handleSelectionChange),
    );

    return () => {
      windowEvents.forEach((e) =>
        window.removeEventListener(e, handleSelectionChange),
      );
      documentEvents.forEach((e) =>
        document.removeEventListener(e, handleSelectionChange),
      );
    };
  }, [textboxRef]);

  // Build a map from hotkey string to the handler function
  useEffect(() => {
    const hotkeyMap = new Map<string, () => void>();

    Object.values(toolbarData).forEach((group) => {
      Object.values(group.tools).forEach((tool) => {
        hotkeyMap.set(tool.hotkey.toLowerCase(), tool.handler);
      });
    });

    const handleKeyDown = (event: KeyboardEvent) => {
      const modifiers = [];
      if (event.ctrlKey) modifiers.push("ctrl");
      if (event.metaKey) modifiers.push("meta");
      if (event.altKey) modifiers.push("alt");
      if (event.shiftKey) modifiers.push("shift");

      // For digit keys, use the physical key (event.code) rather than
      // event.key, since Shift remaps event.key to a symbol (e.g. "8" -> "*")
      const digitMatch = /^Digit(\d)$/.exec(event.code);
      const key = digitMatch ? digitMatch[1] : event.key.toLowerCase();

      const keyCombo = [...modifiers, key].join("+");

      const handler = hotkeyMap.get(keyCombo);
      if (handler) {
        // Call handler with priority
        event.preventDefault();
        event.stopPropagation();
        handler();
      }
    };

    window.addEventListener("keydown", handleKeyDown, { capture: true });

    return () => {
      window.removeEventListener("keydown", handleKeyDown, { capture: true });
    };
  }, [toolbarData]);

  // Tab / Shift+Tab indent or outdent the line(s) the selection spans
  const insertTextRef = useRef(insertText);
  insertTextRef.current = insertText;

  useEffect(() => {
    const handleTabKey = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;

      const textbox = textboxRef.current;
      if (!textbox || document.activeElement !== textbox) return;

      event.preventDefault();
      event.stopPropagation();

      const direction = event.shiftKey ? -1 : 1;
      const { text, lineStart, lineEnd } = getTextboxState(textbox);

      // Only the target line(s) - one for a collapsed cursor, more for an
      // actual selection - get (out)indented. But markers are reflowed
      // across the whole contiguous list block (blockStart/blockEnd), so
      // numbered/lettered siblings outside the target range stay correctly
      // sequenced instead of restarting their count in isolation.
      const { blockStart, blockEnd } = getBlockRange(text, lineStart, lineEnd);
      const blockText = text.slice(blockStart, blockEnd);

      const relStart = lineStart - blockStart;
      const relEnd = lineEnd - blockStart;
      const targetText = blockText.slice(relStart, relEnd);
      const shiftedTarget = targetText
        .split("\n")
        .map((l) => shiftLineIndent(l, direction))
        .join("\n");
      const newBlockText =
        blockText.slice(0, relStart) + shiftedTarget + blockText.slice(relEnd);
      const reflowed = reflowListMarkers(newBlockText);

      updateTextboxSelection(textbox, blockStart, blockEnd);
      insertTextboxValue(textbox, reflowed);

      // Restore the selection to the shifted target lines' new bounds
      const targetLineIndex =
        blockText.slice(0, relStart).split("\n").length - 1;
      const targetLineCount = targetText.split("\n").length;
      const reflowedLines = reflowed.split("\n");
      const linesBefore = reflowedLines.slice(0, targetLineIndex);
      const targetLinesReflowed = reflowedLines.slice(
        targetLineIndex,
        targetLineIndex + targetLineCount,
      );
      const newRelStart = linesBefore.reduce((sum, l) => sum + l.length + 1, 0);
      const newRelEnd = newRelStart + targetLinesReflowed.join("\n").length;

      const absStart = blockStart + newRelStart;
      const absEnd = blockStart + newRelEnd;

      // Collapse/restore synchronously: leaving the whole block selected
      // (even briefly, until a later setTimeout) risks a fast keystroke
      // right after Tab landing on a stale wide selection instead.
      updateTextboxSelection(textbox, absStart, absEnd);
      textbox.focus();

      setLine(targetLinesReflowed.join("\n"));
    };

    window.addEventListener("keydown", handleTabKey, { capture: true });

    return () => {
      window.removeEventListener("keydown", handleTabKey, { capture: true });
    };
  }, [textboxRef]);

  // Enter on a list line continues the list (or exits it, if the item is
  // empty) instead of just inserting a plain newline
  useEffect(() => {
    const handleEnterKey = (event: KeyboardEvent) => {
      if (event.key !== "Enter") return;
      if (event.ctrlKey || event.metaKey || event.altKey || event.shiftKey)
        return;

      const textbox = textboxRef.current;
      if (!textbox || document.activeElement !== textbox) return;

      const state = getTextboxState(textbox);
      if (state.selectionStart !== state.selectionEnd) return;

      const continuation = getListContinuation(state.line);
      if (!continuation) return;

      event.preventDefault();
      event.stopPropagation();

      if ("empty" in continuation) {
        // Exit the list: clear the (empty) item's marker, no line break added.
        // Collapse the selection synchronously (see reflowBlockAndLocateLineEnd)
        // so a fast keystroke right after Enter can't land on a stale selection.
        const { lineStart } = state;
        updateTextboxSelection(textbox, state.lineStart, state.lineEnd);
        insertTextboxValue(textbox, "");
        updateTextboxSelection(textbox, lineStart, lineStart);

        setTimeout(() => {
          updateTextboxSelection(textbox, lineStart, lineStart);
          textbox.focus();
        }, 0);
        return;
      }

      const insertPos = state.selectionStart;
      const insertion = "\n" + continuation.prefix;

      updateTextboxSelection(textbox, insertPos, insertPos);
      insertTextboxValue(textbox, insertion);
      // Collapse synchronously (see reflowBlockAndLocateLineEnd) so a fast
      // keystroke right after Enter can't land on a stale wide selection
      updateTextboxSelection(
        textbox,
        insertPos + insertion.length,
        insertPos + insertion.length,
      );

      // Reflow the block so any numbered/lettered siblings that now follow
      // this new line stay correctly sequenced
      const freshText = getTextboxState(textbox).text;
      const newCursorPos = insertPos + insertion.length;
      const newLineStart = freshText.lastIndexOf("\n", newCursorPos - 1) + 1;
      const newLineEndRaw = freshText.indexOf("\n", newCursorPos);
      const newLineEnd =
        newLineEndRaw === -1 ? freshText.length : newLineEndRaw;

      reflowBlockAndLocateLineEnd(textbox, freshText, newLineStart, newLineEnd);
      textbox.focus();
    };

    window.addEventListener("keydown", handleEnterKey, { capture: true });

    return () => {
      window.removeEventListener("keydown", handleEnterKey, { capture: true });
    };
  }, [textboxRef]);

  return (
    <ToolbarContext.Provider
      value={{
        style,
        isListActive,
        toolbarData,
        insertText,
        styleSelection,
        toggleVariant,
        toggleDecoration,
        toggleList,
      }}
    >
      {children}
    </ToolbarContext.Provider>
  );
}
