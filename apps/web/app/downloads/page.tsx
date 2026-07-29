import { Metadata } from "next";
import { H1, P } from "@workspace/ui/components/heading-with-anchor";
import {
  SiChromewebstore,
  SiFirefoxbrowser,
} from "@icons-pack/react-simple-icons";

export const metadata: Metadata = {
  title: "Downloads - UniGlyphs",
  description:
    "Download UniGlyphs for your browser. Available on Chrome Web Store and Firefox Add-ons.",
};

export default function DownloadsPage() {
  return (
    <div className="flex flex-col gap-8 py-8">
      <H1>Downloads</H1>
      <P>Install UniGlyphs on your preferred browser.</P>

      <div className="flex flex-col gap-4">
        <a
          href={process.env.NEXT_UNIGLYPHS_CHROME_WEB_STORE_URL}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-4 rounded-lg border p-4 transition-colors hover:bg-muted"
        >
          <SiChromewebstore className="size-8" />
          <div>
            <div className="font-semibold">Chrome / Chromium</div>
            <div className="text-sm text-muted-foreground">
              Works on Chrome, Edge, Brave, and other Chromium-based browsers.
            </div>
          </div>
        </a>

        <a
          href={process.env.NEXT_UNIGLYPHS_FIREFOX_ADDON_URL}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-4 rounded-lg border p-4 transition-colors hover:bg-muted"
        >
          <SiFirefoxbrowser className="size-8" />
          <div>
            <div className="font-semibold">Firefox</div>
            <div className="text-sm text-muted-foreground">
              Available on Firefox Add-ons (AMO).
            </div>
          </div>
        </a>
      </div>
    </div>
  );
}
