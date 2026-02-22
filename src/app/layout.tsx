import type { Metadata } from "next";
import { Instrument_Serif, Space_Grotesk, Inter, JetBrains_Mono, Noto_Serif_SC } from "next/font/google";
import "./globals.css";
import NoiseTexture from "@/components/NoiseTexture";
import ScrollProgress from "@/components/ScrollProgress";
import CustomCursor from "@/components/CustomCursor";
import { InkBlobCursor } from "@/components/InkBlobCursor";

const instrument = Instrument_Serif({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: "400",
  style: ["normal", "italic"],
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const notoSerifSC = Noto_Serif_SC({
  subsets: ["latin"],
  variable: "--font-cn",
  display: "swap",
  weight: "700",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Ethan Wu — Design Studio",
  description:
    "Ethan Wu is a design studio crafting brands, websites, and digital experiences. Based in Sydney.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${instrument.variable} ${spaceGrotesk.variable} ${inter.variable} ${jetbrains.variable} ${notoSerifSC.variable}`}
    >
      <body className="font-[family-name:var(--font-inter)]">
        <NoiseTexture />
        <ScrollProgress />
        <CustomCursor />
        <InkBlobCursor />
        {children}
      </body>
    </html>
  );
}
