import { useEffect, useRef, useState } from "react";
import { cn } from "@workspace/ui/lib/utils";
import { Providers } from "@/components/providers";
import { useDebouncedCallback } from "@workspace/ui/lib/debounceCallback";
import {
  getToolbarPos,
  getAlignToolbarPos,
} from "@workspace/ui/components/editor/toolbarPosition";
import {
  isContentEditable,
  isTextInput,
  TextboxElement,
} from "@workspace/ui/lib/textboxState";
import { TextToolbarProvider } from "@workspace/ui/components/editor/ToolbarProvider";
import { TextToolbar } from "@workspace/ui/components/editor/Toolbar";

export function App({ portalContainer }: { portalContainer: HTMLElement }) {
  const textboxRef = useRef<TextboxElement | null>(null);
  const toolbarRef = useRef<HTMLDivElement | null>(null);

  const [activeTextbox, setActiveTextbox] = useState<TextboxElement | null>(
    null
  );
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
    if (sticky) {
      setToolbarPos(getAlignToolbarPos(toolbarRef.current, "center"));
      return;
    }
    if (hidden) {
      setToolbarPos(getAlignToolbarPos(toolbarRef.current, "right"));
      return;
    }

    setToolbarPos(getToolbarPos(textboxRef.current, toolbarRef.current));
  }, [sticky, hidden]);

  const updateCaretPosDebounced = useDebouncedCallback(updateCaretPos, 10);

  useEffect(() => {
    if (typeof window === "undefined") return;

    setToolbarPos(getAlignToolbarPos(toolbarRef.current, "center"));

    const handleFocus = (event: FocusEvent) => {
      const target = event.target;

      if ((target && isTextInput(target)) || isContentEditable(target)) {
        textboxRef.current = target;
        setTimeout(updateCaretPos, 0);
        setActiveTextbox(target);
      }
    };

    // Trigger caret position update shortly after mount
    const timeoutId = setTimeout(() => {
      updateCaretPosDebounced();
    }, 100);

    document.addEventListener("focus", handleFocus, true);
    document.addEventListener("selectionchange", updateCaretPosDebounced);
    document.addEventListener("input", updateCaretPosDebounced);
    window.addEventListener("scroll", updateCaretPosDebounced);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener("focus", handleFocus, true);
      document.removeEventListener("selectionchange", updateCaretPosDebounced);
      document.removeEventListener("input", updateCaretPosDebounced);
      window.removeEventListener("scroll", updateCaretPosDebounced);
    };
  }, [updateCaretPosDebounced]);

  if (!activeTextbox) return null;

  return (
    <Providers>
      <div
        ref={toolbarRef}
        className="bg-transparent text-black absolute z-[9000] transition-all duration-300"
        tabIndex={0}
        style={{
          top: `${toolbarPos.top}px`,
          left: `${toolbarPos.left}px`,
        }}
      >
        <div className="bg-transparent animate-in fade-in slide-in-from-bottom-4 duration-500 transition-all">
          <div
            className={cn(
              "bg-white p-1 rounded-lg shadow-lg flex gap-1 items-center justify-center",
              hidden && "rounded-full border-2 p-0"
            )}
          >
            <TextToolbarProvider
              textboxRef={textboxRef}
              hidden={hidden}
              setHidden={handleHiddenChange}
              sticky={sticky}
              setSticky={handleStickyChange}
            >
              <TextToolbar portalContainer={portalContainer} />
            </TextToolbarProvider>
          </div>
        </div>
      </div>
    </Providers>
  );
}
