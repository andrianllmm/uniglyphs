import { useEffect, useRef } from "react";
import { Providers } from "@/components/providers";
import {
  isContentEditable,
  isTextInput,
  TextboxElement,
} from "@workspace/ui/lib/textboxState";
import { TextToolbarProvider } from "@workspace/ui/components/editor/ToolbarProvider";
import { TextToolbar } from "@workspace/ui/components/editor/Toolbar";
import { TextToolbarStateProvider } from "@workspace/ui/components/editor/ToolbarStateProvider";

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
      <TextToolbarStateProvider textboxRef={textboxRef}>
        <TextToolbarProvider textboxRef={textboxRef}>
          <TextToolbar portalContainer={portalContainer} />
        </TextToolbarProvider>
      </TextToolbarStateProvider>
    </Providers>
  );
}
