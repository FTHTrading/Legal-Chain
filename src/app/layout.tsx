import type { Metadata } from "next";
import { Playfair_Display, Cormorant_Garamond, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-cormorant",
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  weight: ["300", "400"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "UNYKORN // LAW — AI Legal Intelligence Platform",
  description: "26 autonomous AI agents fighting for the falsely accused. Web3-powered legal advocacy on Apostle Chain 7332. Zero cost. x402 funded. Relentless.",
  keywords: "AI legal defense, blockchain legal, x402, Apostle Chain, legal advocacy, wrongful conviction, criminal defense, civil litigation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`h-full antialiased ${playfair.variable} ${cormorant.variable} ${jetbrains.variable}`}>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>{children}</body>
    </html>
  );
}
