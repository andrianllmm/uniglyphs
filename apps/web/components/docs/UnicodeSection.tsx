"use client";

import { useState } from "react";
import { getUnicodeInfo } from "@workspace/ui/lib/getUnicodeInfo";
import { Input } from "@workspace/ui/components/input";
import { H1, P } from "@workspace/ui/components/heading-with-anchor";

export function UnicodeSection() {
  const [char, setChar] = useState("");
  const info = getUnicodeInfo(char);

  return (
    <>
      <H1>Unicode</H1>

      <P>
        Unicode represents characters as numbers. Type a single character to
        view its info.
      </P>

      <div className="grid grid-cols-2 gap-4">
        <Input
          value={char}
          onChange={(e) => {
            const input = e.target.value;
            setChar([...input][0] || "");
          }}
          maxLength={2}
          className="text-4xl! text-center h-full border-2 border-dashed"
          placeholder="A"
        />

        <div className="p-4 border-2 border-dashed rounded-lg text-sm space-y-1">
          <>
            <div>
              <strong>Character:</strong> {info.character}
            </div>
            <div>
              <strong>Code Point:</strong> U+{info.hexCodePoint}
            </div>
            <div>
              <strong>Decimal:</strong> {info.codePoint}
            </div>
          </>
        </div>
      </div>

      <br />
    </>
  );
}
