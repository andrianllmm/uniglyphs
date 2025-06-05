"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { cn } from "@workspace/ui/lib/utils";
import { useDebouncedCallback } from "@workspace/ui/lib/debounceCallback";
import { getAlignToolbarPos, getToolbarPos } from "./toolbarPosition";
import { TextboxElement } from "../../lib/textboxState";

export type TextToolbarStateContextType = {
  toolbarRef: React.RefObject<HTMLDivElement | null>;
  toolbarPos: { top: number; left: number };
  setToolbarPos: (pos: { top: number; left: number }) => void;
  hidden: boolean;
  setHidden: (hidden: boolean) => void;
  sticky: boolean;
  setSticky: (sticky: boolean) => void;
};

const TextToolbarStateContext = createContext<
  TextToolbarStateContextType | undefined
>(undefined);

export const useTextToolbarState = () => {
  const context = useContext(TextToolbarStateContext);
  if (!context) {
    throw new Error(
      "useTextToolbarState must be used within a TextToolbarStateProvider"
    );
  }
  return context;
};

type Props = {
  children: React.ReactNode;
  textboxRef: React.RefObject<TextboxElement | null>;
};

export function TextToolbarStateProvider({ children, textboxRef }: Props) {
  const toolbarRef = useRef<HTMLDivElement | null>(null);

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
    if (sticky) {
      setToolbarPos(getAlignToolbarPos(toolbarRef.current, "center"));
      return;
    }
    if (hidden) {
      setToolbarPos(getAlignToolbarPos(toolbarRef.current, "right"));
      return;
    }

    setToolbarPos(getToolbarPos(textboxRef.current, toolbarRef.current));
  }, [sticky, hidden, textboxRef]);

  const updateCaretPosDebounced = useDebouncedCallback(updateCaretPos, 5);

  useEffect(() => {
    if (typeof window === "undefined") return;

    setToolbarPos(getAlignToolbarPos(toolbarRef.current, "center"));
    setToolbarReady(true);

    // Trigger caret position update shortly after mount
    const timeoutId = setTimeout(() => {
      updateCaretPosDebounced();
    }, 10);

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

  return (
    <TextToolbarStateContext.Provider
      value={{
        toolbarRef,
        toolbarPos,
        setToolbarPos,
        hidden,
        setHidden: handleHiddenChange,
        sticky,
        setSticky: handleStickyChange,
      }}
    >
      {toolbarReady && (
        <div
          ref={toolbarRef}
          className="bg-transparent absolute z-[9000] transition-all duration-300"
          tabIndex={0}
          style={{
            top: `${toolbarPos.top}px`,
            left: `${toolbarPos.left}px`,
          }}
        >
          <div
            className={cn(
              "bg-popover text-popover-foreground p-1 rounded-lg shadow-lg flex gap-1 items-center justify-center animate-in fade-in slide-in-from-bottom-4 duration-500 transition-all",
              hidden && "bg-transparent shadow-none p-0"
            )}
          >
            {children}
          </div>
        </div>
      )}
    </TextToolbarStateContext.Provider>
  );
}
