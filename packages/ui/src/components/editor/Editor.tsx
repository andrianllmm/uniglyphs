"use client";

import { useRef } from "react";
import { cn } from "@workspace/ui/lib/utils";
import { TextToolbarProvider } from "./ToolbarProvider";
import { TextToolbar } from "@workspace/ui/components/editor/Toolbar";
import { Textarea } from "@workspace/ui/components/textarea";
import { TextToolbarStateProvider } from "./ToolbarStateProvider";

export function Editor({
  textAreaProps = {},
  toolbarProps = {},
  className,
}: {
  textAreaProps?: React.ComponentProps<typeof Textarea>;
  toolbarProps?: Omit<React.ComponentProps<typeof TextToolbar>, "textboxRef">;
  className?: string;
}) {
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const { className: textAreaClassName, ...restTextAreaProps } =
    textAreaProps ?? {};
  const { className: toolbarClassName, ...restToolbarProps } =
    toolbarProps ?? {};

  return (
    <div className={cn(className)}>
      <Textarea
        ref={textAreaRef}
        placeholder="Type something..."
        className={cn(
          "border-transparent focus-visible:border-transparent focus-visible:ring-0 p-0 rounded-none",
          textAreaClassName
        )}
        autoFocus
        {...restTextAreaProps}
      />

      <TextToolbarStateProvider textboxRef={textAreaRef}>
        <TextToolbarProvider textboxRef={textAreaRef}>
          <TextToolbar className={cn(toolbarClassName)} {...restToolbarProps} />
        </TextToolbarProvider>
      </TextToolbarStateProvider>
    </div>
  );
}
