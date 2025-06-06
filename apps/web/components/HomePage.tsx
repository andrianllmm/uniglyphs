"use client";

import { useRef } from "react";
import { useInView } from "@workspace/ui/hooks/use-in-view";
import { useDebounce } from "@workspace/ui/hooks/use-debounce";
import { Docs } from "./docs/Docs";
import { Spinner } from "@workspace/ui/components/spinner";

export function HomePage() {
  const docsRef = useRef<HTMLElement>(null);
  const isDocsInView = useInView(docsRef, {
    root: null,
    rootMargin: "-100px -0px -100px -0px",
    threshold: 0.1,
  });

  const debouncedInView = useDebounce(isDocsInView, 50);

  return (
    <section id="docs" ref={docsRef} className="min-h-screen scroll-mt-24">
      {debouncedInView ? (
        <Docs className="animate-in slide-in-from-bottom-24 fade-in duration-500" />
      ) : (
        <Spinner className="m-4 text-primary/20" />
      )}
    </section>
  );
}
