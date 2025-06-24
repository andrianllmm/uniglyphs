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
  DEFAULT_TOOLBAR_OFFSET,
  getToolbarPos,
  getAlignToolbarPos,
} from "./toolbarPosition";
import { TextboxElement } from "../../lib/textboxState";

const TOOLBAR_HIDDEN_KEY = "toolbar-hidden";
const TOOLBAR_STICKY_KEY = "toolbar-sticky";

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
  undefined,
);

export const useToolbarState = () => {
  const context = useContext(ToolbarStateContext);
  if (!context) {
    throw new Error(
      "useToolbarState must be used within a ToolbarStateProvider",
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
  offset = DEFAULT_TOOLBAR_OFFSET,
}: Props) {
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
      setToolbarPos(getAlignToolbarPos(toolbarRef.current, "center", offset));
      return;
    }
    if (hidden) {
      setToolbarPos(getAlignToolbarPos(toolbarRef.current, "right", offset));
      return;
    }

    setToolbarPos(
      getToolbarPos(textboxRef.current, toolbarRef.current, "center", offset),
    );
  }, [textboxRef, sticky, hidden, offset]);

  const updateCaretPosDebounced = useDebouncedCallback(updateCaretPos, 10);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const savedHidden = localStorage.getItem(TOOLBAR_HIDDEN_KEY);
    setHidden(savedHidden === "true");
    const savedSticky = localStorage.getItem(TOOLBAR_STICKY_KEY);
    setSticky(savedSticky === "true");
  }, []);

  useEffect(() => {
    localStorage.setItem(TOOLBAR_HIDDEN_KEY, hidden.toString());
  }, [hidden]);

  useEffect(() => {
    localStorage.setItem(TOOLBAR_STICKY_KEY, sticky.toString());
  }, [sticky]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    setToolbarPos(getAlignToolbarPos(toolbarRef.current, "center", offset));
    setToolbarReady(true);

    // Trigger caret position update shortly after mount
    const timeoutId = setTimeout(() => {
      updateCaretPosDebounced();
    }, 100);

    const windowEvents = ["focus", "input", "scroll", "resize"];
    const documentEvents = ["selectionchange"];

    windowEvents.forEach((e) =>
      window.addEventListener(e, updateCaretPosDebounced),
    );
    documentEvents.forEach((e) =>
      document.addEventListener(e, updateCaretPosDebounced),
    );

    return () => {
      clearTimeout(timeoutId);
      windowEvents.forEach((e) =>
        window.removeEventListener(e, updateCaretPosDebounced),
      );
      documentEvents.forEach((e) =>
        document.removeEventListener(e, updateCaretPosDebounced),
      );
    };
  }, [updateCaretPosDebounced, offset]);

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
          className="bg-transparent absolute z-[999999998] transition-all duration-300"
          tabIndex={0}
          style={{
            top: `${toolbarPos.top}px`,
            left: `${toolbarPos.left}px`,
          }}
        >
          <div
            className={cn(
              "bg-popover text-popover-foreground p-[4px] rounded-lg shadow-lg flex gap-[4px] items-center justify-center animate-in fade-in slide-in-from-bottom-4 duration-500 transition-all",
              hidden && "bg-transparent shadow-none p-[0px]",
            )}
          >
            {children}
          </div>
        </div>
      )}
    </ToolbarStateContext.Provider>
  );
}
