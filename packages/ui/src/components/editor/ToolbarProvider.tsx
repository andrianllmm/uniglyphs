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

// Expands [lineStart, lineEnd) to the surrounding run of non-blank lines,
// so a Tab press on one item can renumber siblings elsewhere in the list
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

// Reflows the list block around [lineStart, lineEnd), writes it into the
// textbox, and returns the cursor position at the end of the target line
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
  // Collapse synchronously - a keystroke landing before an async restore
  // would replace the whole selected block instead of just the cursor
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

  const isListActive = (listStyle: ListStyle) => hasListStyle(line, listStyle);

  // "line" replaces the whole line(s) the selection spans, not just the selection
  const insertText = (
    text: string = "",
    type: "selection" | "line" = "selection",
  ) => {
    const textbox = textboxRef.current;
    if (!textbox) return;

    const state = getTextboxState(textbox);

    let start: number;
    let end: number;

    if (type === "line") {
      // Shift the cursor by however many chars the marker added/removed,
      // rather than selecting the whole newly-formatted line
      const delta = text.length - state.line.length;
      const newLineStart = state.lineStart;
      const newLineEnd = state.lineStart + text.length;
      start = Math.min(
        Math.max(state.selectionStart + delta, newLineStart),
        newLineEnd,
      );
      end = Math.min(
        Math.max(state.selectionEnd + delta, newLineStart),
        newLineEnd,
      );

      updateTextboxSelection(textbox, state.lineStart, state.lineEnd);
    } else {
      start = state.selectionStart;
      end = start + text.length;
    }

    insertTextboxValue(textbox, text);
    updateTextboxSelection(textbox, start, end); // sync, to avoid a stale wide selection

    setTimeout(() => {
      updateTextboxSelection(textbox, start, end);
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
      const { text, lineStart, lineEnd, selectionStart, selectionEnd } =
        getTextboxState(textbox);
      const wasCollapsed = selectionStart === selectionEnd;

      // Only the target line(s) get (out)indented, but markers are reflowed
      // across the whole list block so siblings outside the target range
      // stay correctly sequenced
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

      // A collapsed cursor stays collapsed at its relative offset; an actual
      // selection stays selected, so Tab can be pressed again on it
      let finalStart = absStart;
      let finalEnd = absEnd;
      if (wasCollapsed) {
        const targetDelta =
          targetLinesReflowed.join("\n").length - targetText.length;
        const collapsedPos = Math.min(
          Math.max(selectionStart + targetDelta, absStart),
          absEnd,
        );
        finalStart = collapsedPos;
        finalEnd = collapsedPos;
      }

      updateTextboxSelection(textbox, finalStart, finalEnd); // sync, to avoid a stale wide selection
      textbox.focus();

      setLine(targetLinesReflowed.join("\n"));
    };

    window.addEventListener("keydown", handleTabKey, { capture: true });

    return () => {
      window.removeEventListener("keydown", handleTabKey, { capture: true });
    };
  }, [textboxRef]);

  // Enter on a list line continues the list, or exits it if the item is empty
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
        // Exit the list: clear the (empty) item's marker, no line break added
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
      updateTextboxSelection(
        textbox,
        insertPos + insertion.length,
        insertPos + insertion.length,
      ); // sync, to avoid a stale wide selection

      // Reflow so numbered/lettered siblings after this new line stay sequenced
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
