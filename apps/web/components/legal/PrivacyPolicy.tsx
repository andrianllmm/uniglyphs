import { H1, P } from "@workspace/ui/components/heading-with-anchor";

const lastUpdated = new Date(2025, 5, 13);

export function PrivacyPolicy() {
  return (
    <>
      <H1 className="text-2xl font-bold mb-4">Privacy Policy</H1>

      <P>
        UniGlyphs does not collect, store, or share any personal information.
      </P>
      <P>
        We do not use cookies, analytics, or any form of third-party tracking.
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
