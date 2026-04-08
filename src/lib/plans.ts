/**
 * Subscription Plans & Pricing Configuration
 *
 * Introductory $25/mo full-access plan, à la carte services,
 * first-100-signups special, and Web3 payment options.
 */

import { AGENT_NETWORK } from "./data/seed";

// ── Plan Types ──

export interface Plan {
  id: string;
  name: string;
  tagline: string;
  price: number;               // monthly USD
  originalPrice?: number;      // show crossed-out if discounted
  interval: "month" | "year" | "one_time";
  features: string[];
  highlighted?: boolean;
  badge?: string;
  stripePriceId?: string;      // populated from env
  limit?: number;              // e.g. first 100 signups
  currentSignups?: number;
}

export interface AlaCarteService {
  id: string;
  name: string;
  description: string;
  price: number;
  unit: string;                // "per document", "per case", "per hour", etc.
  stripePriceId?: string;
  category: "research" | "drafting" | "forensics" | "filing" | "consultation";
}

// ── Subscription Plans ──

export const PLANS: Plan[] = [
  {
    id: "intro-monthly",
    name: "Founder Access",
    tagline: "Full platform access at our introductory rate",
    price: 25,
    originalPrice: 99,
    interval: "month",
    features: [
      `Full AI agent access (${AGENT_NETWORK.total} agents)`,
      "Unlimited case analysis",
      "RAG-powered legal research",
      "Document drafting & review",
      "Evidence chain tracking",
      "Forensic analysis tools",
      "Web3 wallet integration",
      "Apostle Chain x402 protocol",
      "Priority support",
      "All future features included",
    ],
    highlighted: true,
    badge: "FIRST 100 — FOUNDERS RATE",
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_INTRO_PRICE_ID,
    limit: 100,
    currentSignups: 0,
  },
  {
    id: "standard-monthly",
    name: "Standard",
    tagline: "Full access after founders spots are filled",
    price: 99,
    interval: "month",
    features: [
      `Full AI agent access (${AGENT_NETWORK.total} agents)`,
      "Unlimited case analysis",
      "RAG-powered legal research",
      "Document drafting & review",
      "Evidence chain tracking",
      "Forensic analysis tools",
      "Web3 wallet integration",
      "Apostle Chain x402 protocol",
      "Standard support",
    ],
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_STANDARD_PRICE_ID,
  },
  {
    id: "enterprise",
    name: "Enterprise / Law Firm",
    tagline: "White-glove deployment for firms & legal departments",
    price: 0,
    interval: "month",
    features: [
      "Everything in Standard",
      "Multi-seat licensing",
      "Custom agent training",
      "Dedicated instance",
      "SLA & compliance reporting",
      "On-premise deployment option",
      "API access & integrations",
      "24/7 priority support",
    ],
    badge: "CONTACT US",
  },
];

// ── À La Carte Services ──

export const ALA_CARTE: AlaCarteService[] = [
  {
    id: "legal-research",
    name: "AI Legal Research",
    description: "Deep case law, statute, and precedent research with RAG pipeline",
    price: 49,
    unit: "per research query",
    category: "research",
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_RESEARCH_PRICE_ID,
  },
  {
    id: "document-draft",
    name: "Document Drafting",
    description: "AI-drafted demand letters, motions, briefs with attorney review queue",
    price: 99,
    unit: "per document",
    category: "drafting",
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_DRAFTING_PRICE_ID,
  },
  {
    id: "forensic-trace",
    name: "Blockchain Forensic Trace",
    description: "TRON/ETH/Polygon wallet tracing, fund flow analysis, risk scoring",
    price: 199,
    unit: "per investigation",
    category: "forensics",
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_FORENSICS_PRICE_ID,
  },
  {
    id: "case-strategy",
    name: "AI Case Strategy Session",
    description: "AI-powered claim viability, risk assessment, and litigation strategy",
    price: 149,
    unit: "per matter",
    category: "consultation",
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_STRATEGY_PRICE_ID,
  },
  {
    id: "evidence-analysis",
    name: "Evidence Analysis",
    description: "AI evidence classification, authenticity assessment, privilege screening",
    price: 79,
    unit: "per evidence set",
    category: "filing",
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_EVIDENCE_PRICE_ID,
  },
];

// ── Helpers ──

export function getFounderPlan(): Plan {
  return PLANS[0];
}

export function isFounderSpotsAvailable(): boolean {
  const plan = getFounderPlan();
  return (plan.currentSignups ?? 0) < (plan.limit ?? 100);
}

export function founderSpotsRemaining(): number {
  const plan = getFounderPlan();
  return (plan.limit ?? 100) - (plan.currentSignups ?? 0);
}

// ── Web3 Payment Config ──

export const WEB3_CONFIG = {
  chainId: 7332,
  chainName: "Apostle Chain",
  rpcUrl: process.env.NEXT_PUBLIC_APOSTLE_RPC || "https://apostle.unykorn.org",
  nativeCurrency: { name: "ATP", symbol: "ATP", decimals: 18 },
  acceptedTokens: [
    { symbol: "ATP", decimals: 18, label: "Apostle Token" },
    { symbol: "USDF", decimals: 7, label: "USDF Stablecoin" },
  ],
  paymentWallet: process.env.NEXT_PUBLIC_PAYMENT_WALLET || "",
} as const;

export const POLYGON_CONFIG = {
  chainId: 137,
  chainName: "Polygon Mainnet",
  rpcUrl: process.env.NEXT_PUBLIC_POLYGON_RPC || "https://polygon-rpc.com",
  nativeCurrency: { name: "MATIC", symbol: "POL", decimals: 18 },
  acceptedTokens: [
    { symbol: "USDC", decimals: 6, label: "USD Coin", contract: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359" },
  ],
  paymentWallet: process.env.NEXT_PUBLIC_POLYGON_PAYMENT_WALLET || "",
  blockExplorer: "https://polygonscan.com",
} as const;

export const SUPPORTED_CHAINS = [
  { ...WEB3_CONFIG, id: "apostle" },
  { ...POLYGON_CONFIG, id: "polygon" },
] as const;
