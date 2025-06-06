"use client";

import { useState, useEffect } from "react";
import { cn } from "../lib/utils";
import { applyRandomStyle } from "../lib/textTools/textStyle/random";

type GlitchStyledTextProps = {
  text: string;
  intervalDuration?: number;
  className?: string;
};

export function GlitchStyledText({
  text,
  intervalDuration = 200,
  className = "",
}: GlitchStyledTextProps) {
  const [styledText, setStyledText] = useState<string>(text);
  const [paused, setPaused] = useState<boolean>(false);

  useEffect(() => {
    if (paused) return;

    // Apply a new random style at regular intervals
    const interval = setInterval(() => {
      setStyledText(applyRandomStyle(text));
    }, intervalDuration);

    setStyledText(applyRandomStyle(text));

    return () => clearInterval(interval);
  }, [text, intervalDuration, paused]);

  return (
    <span
      className={cn("inline-block whitespace-nowrap", className)}
      onClick={() => setPaused(!paused)}
      title="Click to pause/resume glitch"
    >
      {[...styledText].map((char, index) => (
        <span key={index} className="inline-block">
          {char}
        </span>
      ))}
    </span>
  );
}
