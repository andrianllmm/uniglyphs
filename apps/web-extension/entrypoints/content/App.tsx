import { useEffect, useRef } from "react";
import { Providers } from "@/components/providers";
import {
  isContentEditable,
  isTextInput,
  TextboxElement,
} from "@workspace/ui/lib/textboxState";
import { ToolbarProvider } from "@workspace/ui/components/editor/ToolbarProvider";
import { Toolbar } from "@workspace/ui/components/editor/Toolbar";
import { ToolbarStateProvider } from "@workspace/ui/components/editor/ToolbarStateProvider";

export function App({ portalContainer }: { portalContainer: HTMLElement }) {
  const textboxRef = useRef<TextboxElement | null>(null);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const handleFocus = (event: FocusEvent) => {
      const target = event.target;

      if ((target && isTextInput(target)) || isContentEditable(target)) {
        textboxRef.current = target;
        setIsActive(true);
      }
    };
    document.addEventListener("focus", handleFocus, true);
    return () => {
      document.removeEventListener("focus", handleFocus, true);
    };
  }, []);

  if (!isActive) return null;

  return (
    <Providers>
      <ToolbarStateProvider textboxRef={textboxRef}>
        <ToolbarProvider textboxRef={textboxRef}>
          <Toolbar portalContainer={portalContainer} />
        </ToolbarProvider>
      </ToolbarStateProvider>
    </Providers>
  );
}
