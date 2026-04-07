import type { Metadata } from "next";

const NAMESPACE_META: Record<string, { title: string; description: string }> = {
  marquis: { title: "Marquis Client Portal", description: "Secure client workspace for Marquis v. Miller — property dispute, 169 Creamer Drive." },
  tronfraud: { title: "TRON Fraud Client Portal", description: "Secure client workspace for TRON crypto fraud investigation — blockchain forensics and recovery." },
  creamer: { title: "Creamer Drive Client Portal", description: "Secure client workspace for 169 Creamer Drive property dispute and recovery." },
};

export async function generateMetadata({ params }: { params: Promise<{ namespace: string }> }): Promise<Metadata> {
  const { namespace } = await params;
  const meta = NAMESPACE_META[namespace];
  if (!meta) return { title: "Portal — UNYKORN // LAW" };
  return {
    title: `${meta.title} | UNYKORN // LAW`,
    description: meta.description,
  };
}

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return children;
}
