"use client";

import { useState, useEffect } from "react";
import { cn } from "../lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@workspace/ui/components/select";

const fontOptions = [
  { value: "notoSans", label: "Noto Sans" },
  { value: "roboto", label: "Roboto" },
  { value: "inter", label: "Inter" },
  { value: "merriweather", label: "Merriweather" },
  { value: "playfair", label: "Playfair" },
  { value: "lora", label: "Lora" },
];
const defaultFont = "notoSans";
const FONT_KEY = "font";

export function FontSelect({ className }: { className?: string }) {
  const [font, setFont] = useState<string>(defaultFont);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const savedFont = localStorage.getItem(FONT_KEY);
    if (savedFont) setFont(savedFont);
  }, []);

  useEffect(() => {
    localStorage.setItem(FONT_KEY, font);
    document.documentElement.style.setProperty(
      "--chosen-font",
      `var(--font-${font})`,
    );
  }, [font]);

  return (
    <Select value={font} onValueChange={setFont}>
      <SelectTrigger
        className={cn(
          "p-2 hover:bg-accent hover:text-accent-foreground font-extrabold border-0 shadow-none gap-0",
          className,
        )}
        title="Font"
      >
        T
      </SelectTrigger>
      <SelectContent>
        {fontOptions.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
