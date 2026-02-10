import React from "react";
import "@workspace/ui/globals.css";
import "@fontsource/noto-sans";
import "@fontsource/roboto";
import "@fontsource/inter";
import "@fontsource/merriweather";
import "@fontsource/playfair";
import "@fontsource/lora";
import { Metadata } from "next";
import { GoogleAnalytics } from "@next/third-parties/google";
import { Providers } from "@/components/providers";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "UniGlyphs",
  description:
    "A browser extension that lets you style text on any website using a dynamic toolbar.",
  keywords: [
    "text styling",
    "browser extension",
    "custom fonts",
    "font changer",
    "text editor",
    "floating toolbar",
    "unicode",
  ],
  authors: [
    { name: "Andrian Lloyd Maagma", url: "https://andrianllmm.github.io" },
  ],
  creator: "Andrian Lloyd Maagma",
  verification: {
    google: "OLTB6tZCygn9YxrUbII3TsDDnmCXnC3YZa2xmwWXjRU",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {process.env.NEXT_PUBLIC_GA_ID && (
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
        )}
      </head>
      <body className="font-custom antialiased">
        <Providers>
          <div className="container max-w-[640px] mx-auto flex flex-col">
            <Header />
            <div className="flex flex-col w-full min-h-screen">
              <main className="p-4 grow">{children}</main>
              <Footer />
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
