"use client";

import { useState, useEffect } from "react";
import { cn } from "../lib/utils";
import { applyRandomStyle } from "../lib/textTools/textStyle/random";
import { stripTextStyles } from "../lib/textTools/textStyle";

type GlitchStyledTextProps = {
  text: string;
  intervalDuration?: number;
  duration?: number;
  className?: string;
};

export function GlitchStyledText({
  text,
  intervalDuration = 200,
  duration,
  className = "",
}: GlitchStyledTextProps) {
  const strippedText = stripTextStyles(text);
  const [styledText, setStyledText] = useState<string>(text);
  const [paused, setPaused] = useState<boolean>(false);

  useEffect(() => {
    if (paused) return;

    let interval: NodeJS.Timeout;
    let timeout: NodeJS.Timeout;

    const startGlitch = () => {
      interval = setInterval(() => {
        setStyledText(applyRandomStyle(strippedText));
      }, intervalDuration);
      setStyledText(applyRandomStyle(strippedText));
    };

    startGlitch();

    if (duration) {
      timeout = setTimeout(() => {
        clearInterval(interval);
        setStyledText(text);
      }, duration);
    }

    return () => {
      clearInterval(interval);
      if (timeout) clearTimeout(timeout);
    };
  }, [text, strippedText, intervalDuration, duration, paused]);

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
