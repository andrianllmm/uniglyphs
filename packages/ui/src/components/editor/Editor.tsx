"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@workspace/ui/lib/utils";
import { ToolbarProvider } from "./ToolbarProvider";
import { Toolbar } from "@workspace/ui/components/editor/Toolbar";
import { Textarea } from "@workspace/ui/components/textarea";
import { ToolbarStateProvider } from "./ToolbarStateProvider";
import { CircularProgress } from "../circular-progress";
import { Button } from "../button";
import { getEditorActions } from "./editorActions";

const MAX_CHAR_COUNT = 10000;
const MAX_FONT_SIZE = 32;
const MIN_FONT_SIZE = 12;

const VALUE_KEY = "editor_value";
const FONTSIZE_KEY = "editor_fontSize";

export function Editor({
  textAreaProps = {},
  toolbarProps = {},
  initialSelection,
  defaultFontSize = 18,
  toolbarOffset,
  className,
}: {
  textAreaProps?: React.ComponentProps<typeof Textarea>;
  toolbarProps?: Omit<React.ComponentProps<typeof Toolbar>, "textboxRef">;
  initialSelection?: [number, number];
  defaultFontSize?: number;
  toolbarOffset?: number;
  className?: string;
}) {
  const textAreaRef = useRef<HTMLTextAreaElement | null>(null);
  const [value, setValue] = useState<string>("");
  const [fontSize, setFontSize] = useState(
    Math.max(Math.min(defaultFontSize, MAX_FONT_SIZE), MIN_FONT_SIZE)
  );

  const undoStack = useRef<string[]>([]);
  const redoStack = useRef<string[]>([]);

  const typingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleCopy = () => {
    try {
      navigator.clipboard.writeText(value);
    } catch (error) {
      console.error("Failed to copy text to clipboard:", error);
    }
  };

  const handlePaste = () => {
    try {
      navigator.clipboard.readText().then(setValue);
    } catch (error) {
      console.error("Failed to paste text from clipboard:", error);
    }
  };

  const increaseFontSize = () =>
    setFontSize((prevSize) => Math.min(prevSize + 2, MAX_FONT_SIZE));
  const decreaseFontSize = () =>
    setFontSize((prevSize) => Math.max(prevSize - 2, MIN_FONT_SIZE));

  const undo = useCallback(() => {
    if (undoStack.current.length > 0) {
      const prev = undoStack.current.pop()!;
      redoStack.current.push(value);
      setValue(prev);
    }
  }, [value]);

  const redo = useCallback(() => {
    if (redoStack.current.length > 0) {
      const next = redoStack.current.pop()!;
      undoStack.current.push(value);
      setValue(next);
    }
  }, [value]);

  const pushUndoState = (newVal: string) => {
    undoStack.current.push(newVal);
    redoStack.current = [];
  };

  const resetHistory = (initialValue = "") => {
    undoStack.current = [initialValue];
    redoStack.current = [];
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const input = e.target.value;
    const text =
      input.length <= MAX_CHAR_COUNT ? input : input.slice(0, MAX_CHAR_COUNT);

    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      pushUndoState(value);
    }, 200);

    setValue(text);
  };

  const handleToolbarInsertText = () => {
    const textArea = textAreaRef.current;
    if (!textArea) return;
    pushUndoState(textArea.value);
    setValue(textArea.value);
  };

  const actions = getEditorActions(
    handleCopy,
    handlePaste,
    undo,
    redo,
    decreaseFontSize,
    increaseFontSize
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    const savedValue = localStorage.getItem(VALUE_KEY);
    const newVal = savedValue ?? textAreaProps.defaultValue?.toString() ?? "";
    setValue(newVal);
    resetHistory(newVal);

    const savedFs = localStorage.getItem(FONTSIZE_KEY) || "";
    const parsedFs = parseInt(savedFs, 10);
    if (!isNaN(parsedFs)) setFontSize(parsedFs);
  }, [textAreaProps.defaultValue]);

  useEffect(() => {
    localStorage.setItem(VALUE_KEY, value);
  }, [value]);

  useEffect(() => {
    localStorage.setItem(FONTSIZE_KEY, fontSize.toString());
  }, [fontSize]);

  useEffect(() => {
    if (textAreaProps.autoFocus !== true) return;
    const textarea = textAreaRef.current;
    if (textarea) {
      const selection = initialSelection ?? [
        textarea.value.length,
        textarea.value.length,
      ];
      textarea.setSelectionRange(...selection);
      textarea.scrollTop = textarea.scrollHeight;
      textarea.focus();
    }
  }, [textAreaProps.autoFocus, initialSelection]);

  useEffect(() => {
    const textarea = textAreaRef.current;
    if (!textarea) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const modifiers = [];
      if (event.ctrlKey) modifiers.push("ctrl");
      if (event.metaKey) modifiers.push("meta");
      if (event.altKey) modifiers.push("alt");
      if (event.shiftKey) modifiers.push("shift");
      const key = event.key.toLowerCase();

      const keyCombo = [...modifiers, key].join("+");

      const action = Object.values(actions).find(
        (action) => action.hotkey === keyCombo
      );
      if (action?.handler) {
        event.preventDefault();
        event.stopPropagation();
        action.handler();
      }
    };

    textarea.addEventListener("keydown", handleKeyDown);

    return () => {
      textarea.removeEventListener("keydown", handleKeyDown);
    };
  }, [actions]);

  useEffect(() => {
    return () => {
      if (typingTimeout.current) clearTimeout(typingTimeout.current);
    };
  }, []);

  const { className: textAreaClassName, ...restTextAreaProps } =
    textAreaProps ?? {};
  delete restTextAreaProps.defaultValue;
  const { className: toolbarClassName, ...restToolbarProps } =
    toolbarProps ?? {};

  return (
    <div className={cn("flex flex-col gap-8", className)}>
      <ToolbarStateProvider textboxRef={textAreaRef} offset={toolbarOffset}>
        <ToolbarProvider
          textboxRef={textAreaRef}
          onInsertText={handleToolbarInsertText}
        >
          <Toolbar className={cn(toolbarClassName)} {...restToolbarProps} />
        </ToolbarProvider>
      </ToolbarStateProvider>

      <Textarea
        ref={textAreaRef}
        value={value}
        onChange={handleTextareaChange}
        onBlur={() => pushUndoState(value)}
        placeholder="Type something..."
        className={cn(
          "border-transparent focus-visible:border-transparent focus-visible:ring-0 p-0 rounded-none",
          textAreaClassName
        )}
        style={{ fontSize: `${fontSize}px` }}
        {...restTextAreaProps}
      />

      <div className="flex gap-1 justify-between">
        <div className="flex w-full gap-1 items-center" title="Character count">
          <CircularProgress
            className="max-w-4"
            value={value.length}
            max={MAX_CHAR_COUNT}
          />
          <span className="text-nowrap select-none text-sm text-muted-foreground">
            {value.length}/{MAX_CHAR_COUNT}
          </span>
        </div>

        <div className="flex gap-1 items-center">
          {Object.values(actions).map(
            ({ label, icon: Icon, handler, hotkey }) => (
              <Button
                key={label}
                size="icon"
                variant="ghost"
                className="p-1 w-fit h-fit"
                title={`${label} (${hotkey})`}
                onClick={handler}
              >
                {<Icon />}
              </Button>
            )
          )}
        </div>
      </div>
    </div>
  );
}
