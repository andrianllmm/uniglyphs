import { ExternalLink } from "@workspace/ui/components/external-link";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <div className="w-full p-3 py-5 text-sm text-muted-foreground flex flex-wrap items-center justify-center gap-3">
      <div className="whitespace-nowrap">© {year} UniGlyphs</div>
      <ExternalLink
        href="/privacy"
        showIcon={false}
        className="whitespace-nowrap"
      >
        Privacy Policy
      </ExternalLink>
      <ExternalLink
        href="/terms"
        showIcon={false}
        className="whitespace-nowrap"
      >
        Terms of Use
      </ExternalLink>
      <ExternalLink
        href="/contact"
        showIcon={false}
        className="whitespace-nowrap"
      >
        Contact
      </ExternalLink>
    </div>
  );
}
