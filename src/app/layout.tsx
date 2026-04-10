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
  title: "UNYKORN // LAW — Sovereign Legal Execution System",
  description: "Intake to action. Evidence to proof. Forensics to recovery. Draft to approval. Fast, mobile-first legal rescue apps — scan, report, protect, escalate.",
  keywords: "legal rescue apps, demand letter generator, crypto recovery, evidence preservation, legal intake, AI legal tools, emergency legal help",
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
