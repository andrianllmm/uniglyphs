import { ExternalLink } from "@workspace/ui/components/external-link";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <div className="w-full p-3 py-5 text-sm text-muted-foreground flex items-center justify-center gap-4">
      <div className="flex items-center gap-2">© {year} UniGlyphs</div>
      <ExternalLink href="/privacy" showIcon={false}>
        Privacy Policy
      </ExternalLink>
      <ExternalLink href="/terms" showIcon={false}>
        Terms of Use
      </ExternalLink>
    </div>
  );
}
