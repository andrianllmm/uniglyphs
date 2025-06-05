"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@workspace/ui/lib/utils";
import { TextToolbar } from "@workspace/ui/components/editor/Toolbar";
import { Textarea } from "@workspace/ui/components/textarea";
import { getCaretPosition } from "@workspace/ui/lib/caretPosition";
import { useDebouncedCallback } from "@workspace/ui/lib/debounceCallback";

export const TOOLBAR_VERTICAL_OFFSET = 30;
export const TOOLBAR_FALLBACK_HEIGHT = 40;
export const TOOLBAR_FALLBACK_WIDTH = 200;

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
  const [toolbarPosition, setToolbarPosition] = useState({ top: 0, left: 0 });

  const updateCaretPosition = useCallback(() => {
    const el = textAreaRef.current;
    if (!el) return;

    const coords = getCaretPosition(el);
    if (!coords || (coords.left === 0 && coords.top === 0)) {
      if (typeof window === "undefined") return;
      const toolbarHeight =
        toolbarRef.current?.offsetHeight || TOOLBAR_FALLBACK_HEIGHT;
      const toolbarWidth =
        toolbarRef.current?.offsetWidth || TOOLBAR_FALLBACK_WIDTH;
      setToolbarPosition({
        top: window.innerHeight - toolbarHeight - TOOLBAR_VERTICAL_OFFSET,
        left: (window.innerWidth - toolbarWidth) / 2,
      });
      return;
    }

    const elRect = el.getBoundingClientRect();

    let newTop =
      elRect.top + coords.top + window.scrollY + TOOLBAR_VERTICAL_OFFSET;
    let newLeft = elRect.left + coords.left + window.scrollX;

    newTop = Math.min(
      newTop,
      window.innerHeight - (toolbarRef.current?.offsetHeight || 0)
    );
    newLeft = Math.min(
      newLeft,
      window.innerWidth - (toolbarRef.current?.offsetWidth || 0)
    );

    newTop = Math.max(newTop, 0);
    newLeft = Math.max(newLeft, 0);

    setToolbarPosition({ top: newTop, left: newLeft });
  }, []);

  const updateCaretPositionDebounced = useDebouncedCallback(
    updateCaretPosition,
    10
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Set initial position to bottom center
    const toolbarHeight =
      toolbarRef.current?.offsetHeight || TOOLBAR_FALLBACK_HEIGHT;
    const toolbarWidth =
      toolbarRef.current?.offsetWidth || TOOLBAR_FALLBACK_WIDTH;
    setToolbarPosition({
      top: window.innerHeight - toolbarHeight - TOOLBAR_VERTICAL_OFFSET,
      left: (window.innerWidth - toolbarWidth) / 2,
    });

    setToolbarReady(true);

    // Trigger caret position update shortly after mount
    const timeoutId = setTimeout(() => {
      updateCaretPositionDebounced();
    }, 100);

    window.addEventListener("focus", updateCaretPositionDebounced, true);
    document.addEventListener("selectionchange", updateCaretPositionDebounced);
    document.addEventListener("input", updateCaretPositionDebounced);
    window.addEventListener("scroll", updateCaretPositionDebounced);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("focus", updateCaretPositionDebounced, true);
      document.removeEventListener(
        "selectionchange",
        updateCaretPositionDebounced
      );
      document.removeEventListener("input", updateCaretPositionDebounced);
      window.removeEventListener("scroll", updateCaretPositionDebounced);
    };
  }, [updateCaretPositionDebounced]);

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
          className="bg-transparent text-foreground absolute z-[9999] transition-all duration-300"
          tabIndex={0}
          style={{
            top: `${toolbarPosition.top}px`,
            left: `${toolbarPosition.left}px`,
          }}
        >
          <div className="bg-transparent animate-in fade-in slide-in-from-bottom-4 duration-500 transition-all">
            <div className="bg-background p-1 rounded-lg shadow-lg flex gap-1 items-center justify-center">
              <TextToolbar
                textboxRef={textAreaRef}
                className={cn(toolbarClassName)}
                {...restToolbarProps}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
