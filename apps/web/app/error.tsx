"use client";

import { useEffect } from "react";
import { H2 } from "@workspace/ui/components/heading-with-anchor";
import { Button } from "@workspace/ui/components/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="my-2 flex flex-col gap-2 items-center justify-center">
      <H2>Oops� Something went wrong!</H2>
      <Button size="sm" onClick={() => reset()}>
        Try again
      </Button>
    </div>
  );
}
