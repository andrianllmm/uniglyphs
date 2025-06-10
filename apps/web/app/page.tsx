"use client";

import { useState, useEffect } from "react";
import { Editor } from "@workspace/ui/components/editor/Editor";
import { ScrollButton } from "@/components/ScrollButton";
import { HomePage } from "@/components/HomePage";
import { useSearchParams } from "next/navigation";

const TEXT_DEFAULT_VALUE =
  "Write 𝑏𝑒𝑡𝑡𝑒𝑟-𝑙𝑜𝑜𝑘𝑖𝑛𝑔 text 𝐚𝐧𝐲𝐰𝐡𝐞𝐫𝐞 with a 𝖀𝐧𝑖𝕔𝚘𝒹𝖾 e̲d̲i̲t̲o̲r̲";

export default function Page() {
  const searchParams = useSearchParams();
  const editing = searchParams.get("editing") === "true";
  const [shouldAutoFocus, setShouldAutoFocus] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash;
    console.log(hash);
    setShouldAutoFocus(hash === "" || hash === "#editor");
  }, []);

  return (
    <div className="flex flex-col">
      <ScrollButton />

      <section id="editor" className="scroll-mt-24 h-full mt-8 mb-24">
        <Editor
          className="w-full animate-in slide-in-from-bottom-2 fade-in duration-500"
          textAreaProps={{
            defaultValue: editing ? "" : TEXT_DEFAULT_VALUE,
            className: "h-[calc(100vh-14rem)] resize-none",
            autoFocus: shouldAutoFocus,
          }}
          initialSelection={[
            TEXT_DEFAULT_VALUE.length,
            TEXT_DEFAULT_VALUE.length,
          ]}
          defaultFontSize={editing ? 20 : 28}
        />
      </section>

      <HomePage />
      <br />
    </div>
  );
}
