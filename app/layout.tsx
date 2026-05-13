import type { Metadata, Viewport } from "next";
import {
  dancingScript,
  caveat,
  sacramento,
  playfairDisplay,
  cormorantGaramond,
  imFellEnglish,
  jost,
  loveYaLikeASister,
  dmSans,
} from "@/lib/fonts";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
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
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${dancingScript.variable} ${caveat.variable} ${sacramento.variable} ${playfairDisplay.variable} ${cormorantGaramond.variable} ${imFellEnglish.variable} ${jost.variable} ${loveYaLikeASister.variable} ${dmSans.variable} h-full antialiased`}
    >
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.svg" />
      </head>
      <body className="min-h-full flex flex-col bg-[#f8f4ee] text-stone-800">
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
