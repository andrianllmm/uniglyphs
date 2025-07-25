import React from "react";
import Link from "next/link";
import { FontSelect } from "@workspace/ui/components/font-select";
import { GlitchStyledText } from "@workspace/ui/components/glitch-styles";
import { Button } from "@workspace/ui/components/button";
import { DownloadIcon } from "lucide-react";

export function Header() {
  return (
    <header className="flex sticky top-0 z-50 h-14 w-full items-center border-b-2 border-dotted bg-background/80 backdrop-blur-lg animate-in slide-in-from-top fade-in duration-800">
      <div className="w-full p-4 flex items-center justify-between gap-2">
        <h1 className="text-xl font-semibold tracking-wider select-none">
          <Link href="/">
            <GlitchStyledText
              text="𝔘𝐧𝗂𝒢𝑙𝗒𝕡h𝚜"
              intervalDuration={100}
              duration={1500}
            />
          </Link>
        </h1>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="p-1"
            title="GitHub"
            asChild
          >
            <a
              href="https://github.com/andrianllmm/uniglyphs"
              target="_blank"
              rel="noreferrer"
              className="flex gap-1"
            >
              <svg
                role="img"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
              >
                <title>GitHub</title>
                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
              </svg>
            </a>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="p-1"
            title="Install"
            asChild
          >
            <a
              href={process.env.NEXT_UNIGLYPHS_CHROME_WEB_STORE_URL}
              target="_blank"
              rel="noreferrer"
            >
              <DownloadIcon size={4} />
            </a>
          </Button>

          <FontSelect />
        </div>
      </div>
    </header>
  );
}
