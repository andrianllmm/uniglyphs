import { StylesSection } from "./StylesSection";
import { GlitchStyledText } from "@workspace/ui/components/glitch-styles";
import { H1, P } from "@workspace/ui/components/heading-with-anchor";
import { ExternalLink } from "@workspace/ui/components/external-link";

export function Docs({ className = "" }: { className?: string }) {
  return (
    <div className={className}>
      <H1>
        What is <GlitchStyledText text="UniGlyphs" />?
      </H1>
      <P>
        UniGlyphs is a browser extension that lets you style text on any
        website, like{" "}
        <ExternalLink href="https://facebook.com/">Facebook</ExternalLink>,
        using a dynamic toolbar.
      </P>
      <br />

      <StylesSection />
    </div>
  );
}
