import { useEffect, useRef, useState } from "react";
import { Providers } from "@/components/providers";
import { getCaretPosition } from "@workspace/ui/lib/caretPosition";
import {
  isContentEditable,
  isTextInput,
  TextboxElement,
} from "@workspace/ui/lib/textboxState";
import { TextToolbar } from "@workspace/ui/components/editor/Toolbar";
import { Button } from "@workspace/ui/components/button";
import { X } from "lucide-react";
import {
  TOOLBAR_FALLBACK_HEIGHT,
  TOOLBAR_FALLBACK_WIDTH,
  TOOLBAR_VERTICAL_OFFSET,
} from "@workspace/ui/components/editor/Editor";
import { useDebouncedCallback } from "@workspace/ui/lib/debounceCallback";

export function App({ portalContainer }: { portalContainer: HTMLElement }) {
  const textboxRef = useRef<TextboxElement | null>(null);
  const toolbarRef = useRef<HTMLDivElement | null>(null);

  const [activeTextbox, setActiveTextbox] = useState<TextboxElement | null>(
    null
  );
  const [toolbarPosition, setToolbarPosition] = useState({ top: 0, left: 0 });

  const updateCaretPosition = useCallback(() => {
    const el = textboxRef.current;
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

    const handleFocus = (event: FocusEvent) => {
      const target = event.target;

      if ((target && isTextInput(target)) || isContentEditable(target)) {
        textboxRef.current = target;
        setTimeout(updateCaretPosition, 0);
        setActiveTextbox(target);
      }
    };

    // Trigger caret position update shortly after mount
    const timeoutId = setTimeout(() => {
      updateCaretPositionDebounced();
    }, 100);

    document.addEventListener("focus", handleFocus, true);
    document.addEventListener("selectionchange", updateCaretPositionDebounced);
    document.addEventListener("input", updateCaretPositionDebounced);
    window.addEventListener("scroll", updateCaretPositionDebounced);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener("focus", handleFocus, true);
      document.removeEventListener(
        "selectionchange",
        updateCaretPositionDebounced
      );
      document.removeEventListener("input", updateCaretPositionDebounced);
      window.removeEventListener("scroll", updateCaretPositionDebounced);
    };
  }, [updateCaretPositionDebounced]);

  if (!activeTextbox) return null;

  return (
    <Providers>
      <div
        ref={toolbarRef}
        className="bg-transparent text-black absolute z-[9999] transition-all duration-300"
        tabIndex={0}
        style={{
          top: `${toolbarPosition.top}px`,
          left: `${toolbarPosition.left}px`,
        }}
      >
        <div className="bg-transparent animate-in fade-in slide-in-from-bottom-4 duration-500 transition-all">
          <div className="bg-transparent p-1 flex gap-1">
            <div className="bg-white p-1 rounded-lg shadow-lg flex gap-1 items-center justify-center">
              <TextToolbar
                textboxRef={textboxRef}
                portalContainer={portalContainer}
              />
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="p-0.25! w-fit h-fit rounded-full text-muted-foreground/80 hover:text-muted-foreground bg-muted/10 hover:bg-muted/20"
              onClick={() => {
                setActiveTextbox(null);
                textboxRef.current = null;
              }}
            >
              <X className="size-3" />
            </Button>
          </div>
        </div>
      </div>
    </Providers>
  );
}
