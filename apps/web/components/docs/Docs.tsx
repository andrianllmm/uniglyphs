import { StylesSection } from "./StylesSection";
import { GlitchStyledText } from "@workspace/ui/components/glitch-styles";
import { H1, H2, P } from "@workspace/ui/components/heading-with-anchor";
import { ExternalLink } from "@workspace/ui/components/external-link";
import { FeaturesSection } from "./FeaturesSection";
import { FAQ } from "./FAQ";

export function Docs({ className = "" }: { className?: string }) {
  return (
    <div className={className}>
      <H1>
        What is <GlitchStyledText text="UniGlyphs" />�
      </H1>
      <P>
        UniGlyphs is a browser extension that lets you style text on any
        website, like{" "}
        <ExternalLink href="https://facebook.com/">Facebook</ExternalLink>,
        using a dynamic toolbar.
      </P>
      <br />

      <H1>Getting Started</H1>
      <P>
        Install the UniGlyphs extension from the{" "}
        <ExternalLink href="https://chrome.google.com/webstore">
          Chrome Web Store
        </ExternalLink>
        . Once installed, you can activate the toolbar on any supported website.
      </P>
      <br />

      <StylesSection />
      <FeaturesSection />
      <FAQ />
      <br />
    </div>
  );
}
