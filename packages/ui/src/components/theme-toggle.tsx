"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Button } from "@workspace/ui/components/button";
import { MoonIcon, SunIcon, SunMoonIcon } from "lucide-react";

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    if (theme === "light") {
      setTheme("dark");
    } else if (theme === "dark") {
      setTheme("system");
    } else {
      setTheme("light");
    }
  };

  return (
    <Button variant="ghost" size="icon" onClick={toggleTheme}>
      {mounted && theme === "light" ? (
        <SunIcon className="motion-scale-in-[0.2] motion-rotate-in-[360deg] motion-duration-500" />
      ) : mounted && theme === "dark" ? (
        <MoonIcon className="motion-scale-in-[0.2] motion-rotate-in-[360deg] motion-duration-500" />
      ) : (
        <SunMoonIcon className="motion-scale-in-[0.2] motion-rotate-in-[360deg] motion-duration-500" />
      )}
    </Button>
  );
}
