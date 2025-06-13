import { ExternalLink } from "@workspace/ui/components/external-link";
import { H1, P } from "@workspace/ui/components/heading-with-anchor";

const lastUpdated = new Date(2025, 6, 13);

export function TermsOfUse() {
  return (
    <>
      <H1>Terms of Use</H1>

      <P>
        By using UniGlyphs, you agree to the following terms and conditions:
      </P>
      <P>
        The software is provided &quot;as is&quot;, without warranty of any
        kind.
      </P>
      <P>
        You are free to use, modify, and distribute it under the terms of the{" "}
        <ExternalLink href="https://github.com/andrianllmm/uniglyphs/blob/main/LICENSE">
          MIT License
        </ExternalLink>
        .
      </P>
      <P>
        We are not liable for any damages or losses arising from the use of this
        tool.
      </P>

      <P className="mt-4 text-sm text-muted-foreground">
        Last updated:{" "}
        {lastUpdated.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </P>
    </>
  );
}
