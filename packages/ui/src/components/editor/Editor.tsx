"use client";

import { useRef } from "react";
import { cn } from "@workspace/ui/lib/utils";
import { ToolbarProvider } from "./ToolbarProvider";
import { Toolbar } from "@workspace/ui/components/editor/Toolbar";
import { Textarea } from "@workspace/ui/components/textarea";
import { ToolbarStateProvider } from "./ToolbarStateProvider";

export function Editor({
  textAreaProps = {},
  toolbarProps = {},
  className,
}: {
  textAreaProps?: React.ComponentProps<typeof Textarea>;
  toolbarProps?: Omit<React.ComponentProps<typeof Toolbar>, "textboxRef">;
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

      <ToolbarStateProvider textboxRef={textAreaRef}>
        <ToolbarProvider textboxRef={textAreaRef}>
          <Toolbar className={cn(toolbarClassName)} {...restToolbarProps} />
        </ToolbarProvider>
      </ToolbarStateProvider>
    </div>
  );
}
