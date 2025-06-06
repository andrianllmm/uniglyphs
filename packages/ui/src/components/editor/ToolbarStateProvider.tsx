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
import {
  DefaultToolbarOffset,
  getToolbarPos,
  getAlignToolbarPos,
} from "./toolbarPosition";
import { TextboxElement } from "../../lib/textboxState";

const ToolbarHiddenKey = "toolbar-hidden";
const ToolbarStickyKey = "toolbar-sticky";

export type ToolbarStateContextType = {
  toolbarRef: React.RefObject<HTMLDivElement | null>;
  toolbarPos: { top: number; left: number };
  setToolbarPos: (pos: { top: number; left: number }) => void;
  hidden: boolean;
  setHidden: (hidden: boolean) => void;
  sticky: boolean;
  setSticky: (sticky: boolean) => void;
};

const ToolbarStateContext = createContext<ToolbarStateContextType | undefined>(
  undefined
);

export const useToolbarState = () => {
  const context = useContext(ToolbarStateContext);
  if (!context) {
    throw new Error(
      "useToolbarState must be used within a ToolbarStateProvider"
    );
  }
  return context;
};

type Props = {
  children: React.ReactNode;
  textboxRef: React.RefObject<TextboxElement | null>;
  offset?: number;
};

export function ToolbarStateProvider({
  children,
  textboxRef,
  offset = DefaultToolbarOffset,
}: Props) {
  const toolbarRef = useRef<HTMLDivElement | null>(null);

  const [toolbarReady, setToolbarReady] = useState(false);
  const [toolbarPos, setToolbarPos] = useState({ top: 0, left: 0 });

  const [hidden, setHidden] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(ToolbarHiddenKey) === "true";
  });

  const [sticky, setSticky] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(ToolbarStickyKey) === "true";
  });

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
      setToolbarPos(getAlignToolbarPos(toolbarRef.current, "center", offset));
      return;
    }
    if (hidden) {
      setToolbarPos(getAlignToolbarPos(toolbarRef.current, "right", offset));
      return;
    }

    setToolbarPos(
      getToolbarPos(textboxRef.current, toolbarRef.current, "center", offset)
    );
  }, [textboxRef, sticky, hidden, offset]);

  const updateCaretPosDebounced = useDebouncedCallback(updateCaretPos, 5);

  useEffect(() => {
    if (typeof window === "undefined") return;

    setToolbarPos(getAlignToolbarPos(toolbarRef.current, "center", offset));
    setToolbarReady(true);

    // Trigger caret position update shortly after mount
    const timeoutId = setTimeout(() => {
      updateCaretPosDebounced();
    }, 10);

    const windowEvents = ["focus", "input", "scroll", "resize"];
    const documentEvents = ["selectionchange"];

    windowEvents.forEach((e) =>
      window.addEventListener(e, updateCaretPosDebounced)
    );
    documentEvents.forEach((e) =>
      document.addEventListener(e, updateCaretPosDebounced)
    );

    return () => {
      clearTimeout(timeoutId);
      windowEvents.forEach((e) =>
        window.removeEventListener(e, updateCaretPosDebounced)
      );
      documentEvents.forEach((e) =>
        document.removeEventListener(e, updateCaretPosDebounced)
      );
    };
  }, [updateCaretPosDebounced, offset]);

  useEffect(() => {
    localStorage.setItem(ToolbarHiddenKey, hidden.toString());
  }, [hidden]);

  useEffect(() => {
    localStorage.setItem(ToolbarStickyKey, sticky.toString());
  }, [sticky]);

  return (
    <ToolbarStateContext.Provider
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
    </ToolbarStateContext.Provider>
  );
}
