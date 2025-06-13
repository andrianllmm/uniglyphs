import { Metadata } from "next";
import { PrivacyPolicy } from "@/components/legal/PrivacyPolicy";

export const metadata: Metadata = {
  title: "Privacy Policy | UniGlyphs",
  description: "UniGlyphs Privacy Policy.",
};

export default function PrivacyPage() {
  return <PrivacyPolicy />;
}
