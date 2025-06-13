import * as React from "react";
import { cn } from "@workspace/ui/lib/utils";
import { ExternalLinkIcon } from "lucide-react";

function ExternalLink({
  children,
  className,
  href,
  showIcon = true,
  ...props
}: React.ComponentProps<"a"> & {
  showIcon?: boolean;
}) {
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
      {showIcon && (
        <ExternalLinkIcon className="w-4 h-4 text-muted-foreground" />
      )}
      <span className="sr-only">Opens in a new window</span>
    </a>
  );
}

export { ExternalLink };
