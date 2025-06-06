import React from "react";
import "@workspace/ui/globals.css";
import "@fontsource/noto-sans";
import "@fontsource/roboto";
import "@fontsource/inter";
import "@fontsource/merriweather";
import "@fontsource/playfair";
import "@fontsource/lora";
import { Metadata } from "next";
import { Providers } from "@/components/providers";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "UniGlyphs",
  description:
    "A browser extension to style Unicode text anywhere using a floating toolbar.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
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
