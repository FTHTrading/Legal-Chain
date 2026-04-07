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
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
