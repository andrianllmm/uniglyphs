import { useEffect, useRef, useState } from "react";
import getCaretCoordinates from "textarea-caret";
import { TextToolbar } from "@workspace/ui/components/editor/Toolbar";
import { Button } from "@workspace/ui/components/button";
import { X } from "lucide-react";

type TextElement = HTMLTextAreaElement | HTMLInputElement;

export function App() {
  const [activeTextBox, setActiveTextBox] = useState<TextElement | null>(null);
  const [toolbarPosition, setToolbarPosition] = useState({
    top: window.innerHeight / 2,
    left: window.innerWidth / 2,
  });
  const textBoxRef = useRef<TextElement | null>(null);
  const toolbarRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const updateCaretPosition = () => {
      const el = textBoxRef.current;
      if (!el || el.selectionStart == null) return;

      const coords = getCaretCoordinates(el, el.selectionStart);
      const elRect = el.getBoundingClientRect();

      let newTop = elRect.top + coords.top + window.scrollY + 30;
      let newLeft = elRect.left + coords.left + window.scrollX;

      newTop = Math.min(
        newTop,
        window.innerHeight - (toolbarRef.current?.offsetHeight || 0),
      );
      newLeft = Math.min(
        newLeft,
        window.innerWidth - (toolbarRef.current?.offsetWidth || 0),
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
      if (
        target instanceof HTMLTextAreaElement ||
        (target instanceof HTMLInputElement && target.type === "text")
      ) {
        textBoxRef.current = target;
        setTimeout(updateCaretPosition, 0);
        setActiveTextBox(target);
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

  if (!activeTextBox) return null;

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
              <TextToolbar textBoxRef={textBoxRef} />
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="p-0.25! w-fit h-fit rounded-full text-muted-foreground/80 hover:text-muted-foreground bg-muted/10 hover:bg-muted/20"
              onClick={() => setActiveTextBox(null)}
            >
              <X className="size-3" />
            </Button>
          </div>
        </div>
      </div>
    </Providers>
  );
}
