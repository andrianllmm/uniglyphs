import * as React from "react";
import { cn } from "@workspace/ui/lib/utils";
import { ExternalLinkIcon } from "lucide-react";

function ExternalLink({
  className,
  href,
  children,
  ...props
}: React.ComponentProps<"a">) {
  return (
    <a
      className={cn(
        "inline-flex items-center gap-1 transition-all hover:underline",
        className
      )}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    >
      {children}
      <ExternalLinkIcon className="size-4" />
      <span className="sr-only">Opens in a new window</span>
    </a>
  );
}

export { ExternalLink };
