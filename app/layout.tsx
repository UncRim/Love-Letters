import type { Metadata, Viewport } from "next";
import {
  dancingScript,
  caveat,
  lovedByTheKing,
  lumanosimo,
  longCang,
  playfairDisplay,
  cormorantGaramond,
  imFellEnglish,
  jost,
  loveYaLikeASister,
  dmSans,
} from "@/lib/fonts";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import { SiteFooter } from "@/components/SiteFooter";
import "./globals.css";

export const metadata: Metadata = {
  title: "Inked.",
  description: "A private desk where letters are sealed in ink—permanent, intentional keepsakes.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Inked.",
  },
};

export const viewport: Viewport = {
  themeColor: "#fdf6e3",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${lovedByTheKing.variable} ${lumanosimo.variable} ${longCang.variable} ${dancingScript.variable} ${caveat.variable} ${playfairDisplay.variable} ${cormorantGaramond.variable} ${imFellEnglish.variable} ${jost.variable} ${loveYaLikeASister.variable} ${dmSans.variable} h-full antialiased`}
    >
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.svg" />
      </head>
      <body className="flex min-h-screen flex-col bg-[#f8f4ee] text-stone-800">
        <div className="flex min-h-0 flex-1 flex-col">{children}</div>
        <SiteFooter />
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
