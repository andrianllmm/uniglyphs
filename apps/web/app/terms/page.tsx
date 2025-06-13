import { TermsOfUse } from "@/components/legal/TermsOfUse";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Use | UniGlyphs",
  description: "UniGlyphs Terms of Use.",
};

export default function TermsPage() {
  return <TermsOfUse />;
}
