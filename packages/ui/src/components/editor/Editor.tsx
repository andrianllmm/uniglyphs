"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@workspace/ui/lib/utils";
import { ToolbarProvider } from "./ToolbarProvider";
import { Toolbar } from "@workspace/ui/components/editor/Toolbar";
import { Textarea } from "@workspace/ui/components/textarea";
import { ToolbarStateProvider } from "./ToolbarStateProvider";
import { CircularProgress } from "../circular-progress";
import {
  ClipboardCheckIcon,
  ClipboardIcon,
  CopyCheckIcon,
  CopyIcon,
  MinusIcon,
  PlusIcon,
} from "lucide-react";
import { Button } from "../button";

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
  const [isCopied, setIsCopied] = useState(false);
  const [isPasted, setIsPasted] = useState(false);
  const [fontSize, setFontSize] = useState(
    Math.max(Math.min(defaultFontSize, MAX_FONT_SIZE), MIN_FONT_SIZE)
  );

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 1000);
  };

  const handlePaste = () => {
    navigator.clipboard.readText().then((text) => {
      setValue(text);
    });
    setIsPasted(true);
    setTimeout(() => setIsPasted(false), 1000);
  };

  const increaseFontSize = () =>
    setFontSize((prevSize) => Math.min(prevSize + 2, MAX_FONT_SIZE));
  const decreaseFontSize = () =>
    setFontSize((prevSize) => Math.max(prevSize - 2, MIN_FONT_SIZE));

  useEffect(() => {
    if (typeof window === "undefined") return;
    const savedValue = localStorage.getItem(VALUE_KEY);
    if (savedValue != null) {
      setValue(savedValue);
    } else {
      setValue(textAreaProps.defaultValue?.toString() || "");
    }
    const savedFs = localStorage.getItem(FONTSIZE_KEY);
    if (savedFs) setFontSize(parseInt(savedFs));
  }, []);

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

  const { className: textAreaClassName, ...restTextAreaProps } =
    textAreaProps ?? {};
  delete restTextAreaProps.defaultValue;
  const { className: toolbarClassName, ...restToolbarProps } =
    toolbarProps ?? {};

  return (
    <div className={cn("flex flex-col gap-8", className)}>
      <ToolbarStateProvider textboxRef={textAreaRef} offset={toolbarOffset}>
        <ToolbarProvider textboxRef={textAreaRef}>
          <Toolbar className={cn(toolbarClassName)} {...restToolbarProps} />
        </ToolbarProvider>
      </ToolbarStateProvider>

      <Textarea
        ref={textAreaRef}
        value={value}
        onChange={(e) => {
          const input = e.target.value;
          if (input.length <= MAX_CHAR_COUNT) {
            setValue(input);
          } else {
            setValue(input.slice(0, MAX_CHAR_COUNT));
          }
        }}
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
          <Button
            size="icon"
            variant="ghost"
            className="p-1 w-fit h-fit"
            title="Copy"
            onClick={handleCopy}
          >
            {isCopied ? <CopyCheckIcon /> : <CopyIcon />}
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="p-1 w-fit h-fit"
            title="Paste"
            onClick={handlePaste}
          >
            {isPasted ? <ClipboardCheckIcon /> : <ClipboardIcon />}
          </Button>
          <div className="flex gap-0 items-center">
            <Button
              size="icon"
              variant="ghost"
              className="p-1 w-fit h-fit"
              title="Decrease font size"
              onClick={decreaseFontSize}
            >
              <MinusIcon />
            </Button>
            <span className="text-xs select-none">{fontSize}px</span>
            <Button
              size="icon"
              variant="ghost"
              className="p-1 w-fit h-fit"
              title="Increase font size"
              onClick={increaseFontSize}
            >
              <PlusIcon />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
