import { useEffect, useRef, useState } from "react";
import { Providers } from "@/components/providers";
import { getCaretPosition } from "@workspace/ui/lib/caretPosition";
import {
  isContentEditable,
  isTextInput,
  TextboxElement,
} from "@workspace/ui/components/editor/textboxState";
import { TextToolbar } from "@workspace/ui/components/editor/Toolbar";
import { Button } from "@workspace/ui/components/button";
import { X } from "lucide-react";

export function App() {
  const [activeTextbox, setActiveTextbox] = useState<TextboxElement | null>(
    null
  );
  const [toolbarPosition, setToolbarPosition] = useState({
    top: window.innerHeight / 2,
    left: window.innerWidth / 2,
  });
  const textboxRef = useRef<TextboxElement | null>(null);
  const toolbarRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const updateCaretPosition = () => {
      const el = textboxRef.current;
      if (!el) return;

      const coords = getCaretPosition(el) || toolbarPosition;

      const elRect = el.getBoundingClientRect();

      let newTop = elRect.top + coords.top + window.scrollY + 30;
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

      setToolbarPosition({
        top: newTop,
        left: newLeft,
      });
    };

    const handleFocus = (event: FocusEvent) => {
      const target = event.target;

      if ((target && isTextInput(target)) || isContentEditable(target)) {
        textboxRef.current = target;
        setTimeout(updateCaretPosition, 0);
        setActiveTextbox(target);
      }
    };

    window.addEventListener("focus", handleFocus, true);
    document.addEventListener("selectionchange", updateCaretPosition);
    document.addEventListener("input", updateCaretPosition);
    window.addEventListener("scroll", updateCaretPosition);

    return () => {
      window.removeEventListener("focus", handleFocus, true);
      document.removeEventListener("selectionchange", updateCaretPosition);
      document.removeEventListener("input", updateCaretPosition);
      window.removeEventListener("scroll", updateCaretPosition);
    };
  }, []);

  if (!activeTextbox) return null;

  return (
    <Providers>
      <div
        ref={toolbarRef}
        className="absolute z-50 transition-all duration-300"
        tabIndex={-1}
        style={{
          top: `${toolbarPosition.top}px`,
          left: `${toolbarPosition.left}px`,
        }}
      >
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 transition-all">
          <div className="bg-transparent p-1 flex gap-1">
            <div className="bg-background p-1 rounded-lg shadow-lg flex gap-1 items-center justify-center">
              <TextToolbar textboxRef={textboxRef} />
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="p-0.25! w-fit h-fit rounded-full text-muted-foreground/80 hover:text-muted-foreground bg-muted/10 hover:bg-muted/20"
              onClick={() => setActiveTextbox(null)}
            >
              <X className="size-3" />
            </Button>
          </div>
        </div>
      </div>
    </Providers>
  );
}
