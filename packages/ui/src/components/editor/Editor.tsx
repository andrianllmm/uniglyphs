"use client";

import { useRef } from "react";
import { TextToolbar } from "@workspace/ui/components/editor/Toolbar";
import { Textarea } from "@workspace/ui/components/textarea";

export function Editor() {
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  return (
    <div className="p-4 space-y-2">
      <Textarea
        ref={textAreaRef}
        placeholder="Type something..."
        autoFocus
      ></Textarea>

      <TextToolbar textBoxRef={textAreaRef} />
    </div>
  );
}
