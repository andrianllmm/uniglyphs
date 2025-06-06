import React from "react";
import { Editor } from "@workspace/ui/components/editor/Editor";
import { Docs } from "@/components/docs/Docs";
import { ScrollButton } from "@/components/ScrollButton";

const textAreaDefaultValue =
  "Write 𝑏𝑒𝑡𝑡𝑒𝑟-𝑙𝑜𝑜𝑘𝑖𝑛𝑔 𝓈𝕙�𝔱 anywhere\nwith a 𝐔𝐧𝐢𝐜𝐨𝐝𝐞 editor";

export default function Page() {
  return (
    <div className="flex flex-col">
      <ScrollButton />

      <section id="editor" className="scroll-mt-24 h-full mt-8 mb-24">
        <Editor
          className="w-full"
          textAreaProps={{
            defaultValue: textAreaDefaultValue,
            className: "h-[calc(100vh-14rem)] resize-none",
          }}
          initialSelection={[
            textAreaDefaultValue.length,
            textAreaDefaultValue.length,
          ]}
          defaultFontSize={28}
        />
      </section>

      <section id="docs" className="scroll-mt-24">
        <Docs />
      </section>
    </div>
  );
}
