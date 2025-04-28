"use client";

import { useRef } from "react";
import { cn } from "@workspace/ui/lib/utils";
import { TextToolbar } from "@workspace/ui/components/editor/Toolbar";
import { Textarea } from "@workspace/ui/components/textarea";

export function Editor({ className }: { className?: string }) {
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  return (
    <div className={cn("space-y-2", className)}>
      <Textarea
        ref={textAreaRef}
        placeholder="Type something..."
        autoFocus
      ></Textarea>

      <TextToolbar textBoxRef={textAreaRef} />
    </div>
  );
}
