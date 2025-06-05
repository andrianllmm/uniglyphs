"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@workspace/ui/lib/utils";
import { useDebouncedCallback } from "@workspace/ui/lib/debounceCallback";
import { getToolbarPos, getAlignToolbarPos } from "./toolbarPosition";
import { TextToolbarProvider } from "./ToolbarProvider";
import { TextToolbar } from "@workspace/ui/components/editor/Toolbar";
import { Textarea } from "@workspace/ui/components/textarea";

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
  const toolbarRef = useRef<HTMLDivElement>(null);

  const [toolbarReady, setToolbarReady] = useState(false);
  const [toolbarPos, setToolbarPos] = useState({ top: 0, left: 0 });
  const [hidden, setHidden] = useState(false);
  const [sticky, setSticky] = useState(false);

  const handleHiddenChange = (hidden: boolean) => {
    if (hidden && sticky) setSticky(false);
    setHidden(hidden);
  };

  const handleStickyChange = (sticky: boolean) => {
    if (sticky && hidden) setHidden(false);
    setSticky(sticky);
  };

  const updateCaretPos = useCallback(() => {
    if (typeof window === "undefined") return;

    if (sticky) {
      setToolbarPos(getAlignToolbarPos(toolbarRef.current, "center"));
      return;
    }
    if (hidden) {
      setToolbarPos(getAlignToolbarPos(toolbarRef.current, "right"));
      return;
    }

    setToolbarPos(getToolbarPos(textAreaRef.current, toolbarRef.current));
  }, [sticky, hidden]);

  const updateCaretPosDebounced = useDebouncedCallback(updateCaretPos, 10);

  useEffect(() => {
    if (typeof window === "undefined") return;

    setToolbarPos(getAlignToolbarPos(toolbarRef.current, "center"));
    setToolbarReady(true);

    // Trigger caret position update shortly after mount
    const timeoutId = setTimeout(() => {
      updateCaretPosDebounced();
    }, 100);

    window.addEventListener("focus", updateCaretPosDebounced, true);
    document.addEventListener("selectionchange", updateCaretPosDebounced);
    document.addEventListener("input", updateCaretPosDebounced);
    window.addEventListener("scroll", updateCaretPosDebounced);
    window.addEventListener("resize", updateCaretPosDebounced);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("focus", updateCaretPosDebounced, true);
      document.removeEventListener("selectionchange", updateCaretPosDebounced);
      document.removeEventListener("input", updateCaretPosDebounced);
      window.removeEventListener("scroll", updateCaretPosDebounced);
      window.removeEventListener("resize", updateCaretPosDebounced);
    };
  }, [updateCaretPosDebounced]);

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

      {toolbarReady && (
        <div
          ref={toolbarRef}
          className="bg-transparent text-foreground absolute z-[9000] transition-all duration-300"
          tabIndex={0}
          style={{
            top: `${toolbarPos.top}px`,
            left: `${toolbarPos.left}px`,
          }}
        >
          <div className="bg-transparent animate-in fade-in slide-in-from-bottom-4 duration-500 transition-all">
            <div
              className={cn(
                "bg-background p-1 rounded-lg shadow-lg flex gap-1 items-center justify-center",
                hidden && "rounded-full border-2 p-0"
              )}
            >
              <TextToolbarProvider
                textboxRef={textAreaRef}
                hidden={hidden}
                setHidden={handleHiddenChange}
                sticky={sticky}
                setSticky={handleStickyChange}
              >
                <TextToolbar
                  className={cn(toolbarClassName)}
                  {...restToolbarProps}
                />
              </TextToolbarProvider>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
