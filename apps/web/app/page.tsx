import React from "react";
import { Editor } from "@workspace/ui/components/editor/Editor";

export default function Page() {
  return (
    <div className="flex flex-col gap-4">
      <Editor className="p-2" />
    </div>
  );
}
