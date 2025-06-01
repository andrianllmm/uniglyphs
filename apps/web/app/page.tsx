import React from "react";
import { Editor } from "@workspace/ui/components/editor/Editor";

const textAreaDefaultValue =
  "Write 𝑏𝑒𝑡𝑡𝑒𝑟-𝑙𝑜𝑜𝑘𝑖𝑛𝑔 𝓈𝕙�𝔱 anywhere\nwith this 𝐔𝐧𝐢𝐜𝐨𝐝𝐞-based text editor✍️";

export default function Page() {
  return (
    <div className="flex flex-col gap-4">
      <Editor
        className="p-2"
        textAreaProps={{
          defaultValue: textAreaDefaultValue,
          className: "text-xl!",
        }}
      />
      <div
        suppressContentEditableWarning
        contentEditable
        className="p-2 border-2"
      >
        <p>
          <span>{textAreaDefaultValue}</span>
        </p>
      </div>
    </div>
  );
}
