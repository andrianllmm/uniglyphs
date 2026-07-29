import { StylesSection } from "./StylesSection";
import { UnicodeSection } from "./UnicodeSection";
import { FeaturesSection } from "./FeaturesSection";
import { FAQ } from "./FAQ";
import { GlitchStyledText } from "@workspace/ui/components/glitch-styles";
import { ExternalLink } from "@workspace/ui/components/external-link";
import { H1, P } from "@workspace/ui/components/heading-with-anchor";

export function Docs({ className = "" }: { className?: string }) {
  return (
    <div className={className}>
      <H1>
        What is <GlitchStyledText text="UniGlyphs" />�
      </H1>
      <P className="leading-6">
        UniGlyphs is a browser extension that lets you{" "}
        <span className="border-dashed border-2 py-0.5 px-1">
          <abbr title="format">𝓯𝓸𝓻𝓶𝓪𝓽</abbr> text on any website
        </span>
        ,<br />
        like <ExternalLink href="https://facebook.com/">Facebook</ExternalLink>,
        using an inline toolbar.
      </P>
      <P className="text-muted-foreground leading-6">
        Whether it&apos;s a tweet, comment, or bio, UniGlyphs adds{" "}
        <span className="border-2 border-dashed py-0.5 px-1">𝕡𝕖𝕣𝕤𝕠𝕟𝕒𝕝𝕚𝕥𝕪</span>{" "}
        to your writings. No more copy-pasting from sketchy font sites.
      </P>
      <br />

      <H1>Getting Started</H1>
      <P>
        Install the UniGlyphs extension from the{" "}
        <ExternalLink href={process.env.NEXT_UNIGLYPHS_CHROME_WEB_STORE_URL}>
          Chrome Web Store
        </ExternalLink>{" "}
        or{" "}
        <ExternalLink href={process.env.NEXT_UNIGLYPHS_FIREFOX_ADDON_URL}>
          Firefox Add-ons
        </ExternalLink>
        . Once installed, you can activate the toolbar on any supported website.
      </P>
      <br />

      <StylesSection />
      <UnicodeSection />
      <FeaturesSection />
      <FAQ />
      <br />
    </div>
  );
}
