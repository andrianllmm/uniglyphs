import { Metadata } from "next";
import { ExternalLink } from "@workspace/ui/components/external-link";
import { H1, P } from "@workspace/ui/components/heading-with-anchor";

export const metadata: Metadata = {
  title: "Contact | UniGlyphs",
  description: "Get in touch with UniGlyphs.",
};

export default function ContactPage() {
  return (
    <>
      <H1>Contact</H1>
      <P>
        UniGlyphs would love to hear from you. If you have any questions,
        feedback, or suggestions about UniGlyphs, feel free to reach out.
      </P>
      <P>
        You can email directly at{" "}
        <ExternalLink
          href="mailto:maagmaandrian@gmail.com"
          className="font-bold border-2 border-dashed py-0.5 px-1"
        >
          maagmaandrian@gmail.com
        </ExternalLink>
        .
      </P>
    </>
  );
}
