import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "UNYKORN // LAW — AI Legal Intelligence Platform",
  description: "350 autonomous AI agents fighting for the falsely accused. Web3-powered legal advocacy on Apostle Chain 7332. Zero cost. x402 funded. Relentless.",
  keywords: "AI legal defense, blockchain legal, x402, Apostle Chain, legal advocacy, wrongful conviction, criminal defense, civil litigation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400&family=JetBrains+Mono:wght@300;400&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>{children}</body>
    </html>
  );
}
