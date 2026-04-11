// ── UNYKORN LAW — Firm Identity Configuration ──
// Single source of truth for all firm identity across the platform.
// Used in: PDFs, emails, footers, headers, letters, contact pages, receipts.

export const FIRM = {
  name: "UNYKORN LAW",
  legalName: "UNYKORN // LAW",
  tagline: "Intake to action. Evidence to proof. Forensics to recovery.",

  address: {
    street: "5655 Peachtree Pkwy",
    city: "Peachtree",
    state: "GA",
    zip: "30099",
    full: "5655 Peachtree Pkwy, Peachtree, GA 30099",
    oneLine: "5655 Peachtree Pkwy, Peachtree, GA 30099",
  },

  // ── Contact ──
  phone: {
    main: "",  // placeholder — populate when assigned
    intake: "", // intake-specific line
  },

  // ── Email Identities ──
  email: {
    support: "support@unykorn.law",
    intake: "intake@unykorn.law",
    cases: "cases@unykorn.law",
    evidence: "evidence@unykorn.law",
    approvals: "approvals@unykorn.law",
    recovery: "recovery@unykorn.law",
    research: "research@unykorn.law",
    status: "status@unykorn.law",
    alerts: "alerts@unykorn.law",
    noreply: "noreply@unykorn.law",
  },

  // ── Dynamic Matter Aliases ──
  matterEmail: (matterId: string) => `matter-${matterId}@unykorn.law`,
  caseEmail: (caseRef: string) => `case-${caseRef}@unykorn.law`,
  proofEmail: (matterId: string) => `proof-${matterId}@unykorn.law`,

  // ── Web ──
  url: "https://unykorn.law",
  domain: "unykorn.law",

  // ── Legal / Footer ──
  disclaimer:
    "This communication is from UNYKORN LAW. It may contain confidential or privileged information. If you are not the intended recipient, please delete this message and notify the sender immediately. Nothing in this communication constitutes legal advice unless a formal engagement agreement has been executed.",
  copyright: `© ${new Date().getFullYear()} UNYKORN. All Rights Reserved.`,
  founding: "EST. MMXXVI",

  // ── Signature Block Defaults ──
  signature: {
    firm: "UNYKORN // LAW",
    address: "5655 Peachtree Pkwy, Peachtree, GA 30099",
    email: "cases@unykorn.law",
    tagline: "Autonomous AI Legal Intelligence",
    protocol: "x402 Protocol · Chain 7332 · ATP Reserve",
  },
} as const;

export type FirmIdentity = typeof FIRM;
