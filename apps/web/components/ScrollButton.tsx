"use client";

import { useEffect, useState } from "react";
import { cn } from "@workspace/ui/lib/utils";
import Link from "next/link";
import { Button } from "@workspace/ui/components/button";
import { ArrowUpIcon, ArrowDownIcon } from "lucide-react";

export function ScrollButton({ className }: { className?: string }) {
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const docsSection = document.getElementById("docs");
    if (!docsSection) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowBackToTop(entry?.isIntersecting ?? false);
      },
      { threshold: 0.1 },
    );

    observer.observe(docsSection);
    return () => observer.disconnect();
  }, []);

  return (
    <Button
      variant="outline"
      className={cn(
        "fixed bottom-8 left-1/2 -translate-x-1/2 p-0 w-fit h-fit flex gap-1",
        "rounded-full bg-background/80 hover:bg-background/90 text-foreground/70 hover:text-foreground/80 text-sm",
        "transition-transform hover:scale-105",
        !showBackToTop && "animate-bounce",
        className,
      )}
      asChild
    >
      <Link href={showBackToTop ? "#editor" : "#docs"}>
        {showBackToTop ? (
          <>
            <ArrowUpIcon className="size-3" />
            Editor
          </>
        ) : (
          <>
            <ArrowDownIcon className="size-3" />
            Docs
          </>
        )}
      </Link>
    </Button>
  );
}
