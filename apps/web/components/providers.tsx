"use client";

import * as React from "react";
import { ThemeProvider } from "@workspace/ui/components/providers/theme-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return <ThemeProvider>{children}</ThemeProvider>;
}
