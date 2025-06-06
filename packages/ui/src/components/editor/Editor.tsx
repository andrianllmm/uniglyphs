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

const MaxCharCount = 1000;
const MaxFontSize = 36;
const MinFontSize = 12;

export function Editor({
  textAreaProps = {},
  toolbarProps = {},
  initialSelection = [0, 0],
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
  const [value, setValue] = useState<string>(
    textAreaProps.defaultValue?.toString() || ""
  );
  const [isCopied, setIsCopied] = useState(false);
  const [isPasted, setIsPasted] = useState(false);
  const [fontSize, setFontSize] = useState(
    Math.max(Math.min(defaultFontSize, MaxFontSize), MinFontSize)
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
    setFontSize((prevSize) => Math.min(prevSize + 2, MaxFontSize));
  const decreaseFontSize = () =>
    setFontSize((prevSize) => Math.max(prevSize - 2, MinFontSize));

  useEffect(() => {
    const textarea = textAreaRef.current;
    if (textarea) {
      textarea.setSelectionRange(...initialSelection);
      textarea.focus();
    }
  }, []);

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
        onChange={(e) => setValue(e.target.value)}
        placeholder="Type something..."
        className={cn(
          "border-transparent focus-visible:border-transparent focus-visible:ring-0 p-0 rounded-none",
          textAreaClassName
        )}
        style={{ fontSize: `${fontSize}px` }}
        autoFocus
        {...restTextAreaProps}
      />

      <div className="flex gap-1 justify-between">
        <div className="flex w-full gap-1 items-center">
          <CircularProgress
            className="max-w-4"
            value={value.length / MaxCharCount}
            max={MaxCharCount}
          />
          <span className="text-nowrap select-none text-sm text-muted-foreground">
            {value.length}/{MaxCharCount}
          </span>
        </div>

        <div className="flex gap-1 items-center">
          <Button
            size="icon"
            variant="ghost"
            className="p-1 w-fit h-fit"
            onClick={handleCopy}
          >
            {isCopied ? <CopyCheckIcon /> : <CopyIcon />}
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="p-1 w-fit h-fit"
            onClick={handlePaste}
          >
            {isPasted ? <ClipboardCheckIcon /> : <ClipboardIcon />}
          </Button>
          <div className="flex gap-0 items-center">
            <Button
              size="icon"
              variant="ghost"
              className="p-1 w-fit h-fit"
              onClick={decreaseFontSize}
            >
              <MinusIcon />
            </Button>
            <span className="text-xs select-none">{fontSize}px</span>
            <Button
              size="icon"
              variant="ghost"
              className="p-1 w-fit h-fit"
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
