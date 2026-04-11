/**
 * Marketing System Configuration
 * Widget app inventory, ICP definitions, and orchestrator constants.
 */

import type { WidgetAppId, ChannelType } from "@prisma/client";

// ── Widget App Inventory ─────────────────────────────────────────────

export interface WidgetAppProfile {
  id: WidgetAppId;
  name: string;
  route: string;
  tagline: string;
  targetBuyer: string;
  painPoint: string;
  urgencyLevel: "critical" | "high" | "medium";
  avgLeadValueCents: number;
  trustBarriers: string[];
  shortestPath: string;
  channels: ChannelType[];
}

export const WIDGET_APPS: WidgetAppProfile[] = [
  {
    id: "emergency_intake",
    name: "Emergency Intake",
    route: "/rapid-intake",
    tagline: "Arrested? Start your defense in 60 seconds.",
    targetBuyer: "Individuals facing criminal charges or arrest",
    painPoint: "Just arrested, confused, scared, need a lawyer NOW",
    urgencyLevel: "critical",
    avgLeadValueCents: 500_000, // $5,000
    trustBarriers: ["Is this real?", "Will my info be safe?", "How fast can I get help?"],
    shortestPath: "Google Ads → Landing Page → Intake Form → Attorney Call",
    channels: ["paid_search", "paid_social", "seo", "retargeting"],
  },
  {
    id: "demand_letter",
    name: "Demand Letter Now",
    route: "/demand-letter",
    tagline: "AI-drafted demand letter in minutes, attorney-reviewed.",
    targetBuyer: "Individuals or small businesses owed money or wronged",
    painPoint: "Need to send a formal legal demand but can't afford a full retainer",
    urgencyLevel: "high",
    avgLeadValueCents: 200_000, // $2,000
    trustBarriers: ["Is it legally valid?", "Will it actually work?", "Do I need a real lawyer?"],
    shortestPath: "SEO/Content → Comparison Page → Demand Builder → Upsell",
    channels: ["seo", "organic_social", "email_outbound", "paid_search"],
  },
  {
    id: "crypto_recovery",
    name: "Crypto Recovery",
    route: "/crypto-recovery",
    tagline: "Trace, freeze, and recover stolen crypto assets.",
    targetBuyer: "Crypto fraud victims, rug-pull targets, exchange dispute holders",
    painPoint: "Lost crypto to scam/hack, don't know where to start",
    urgencyLevel: "high",
    avgLeadValueCents: 1_000_000, // $10,000
    trustBarriers: ["Can you actually recover it?", "Is this a scam too?", "What's your track record?"],
    shortestPath: "Reddit/Twitter → Authority Content → Free Trace Report → Retainer",
    channels: ["organic_social", "seo", "direct_outreach", "partnership"],
  },
  {
    id: "evidence_drop",
    name: "Evidence Drop",
    route: "/evidence-timeline",
    tagline: "Securely upload and timeline your evidence.",
    targetBuyer: "Clients with active cases needing to submit evidence",
    painPoint: "Have evidence but no organized way to submit and track it",
    urgencyLevel: "medium",
    avgLeadValueCents: 300_000, // $3,000
    trustBarriers: ["Is it encrypted?", "Who can see my files?", "Will it hold up in court?"],
    shortestPath: "Case Portal → Evidence Upload → Timeline View → Attorney Review",
    channels: ["email_outbound", "sms_outbound", "retargeting"],
  },
  {
    id: "status_help",
    name: "Status + Help",
    route: "/client-status",
    tagline: "Check your case status and get instant help.",
    targetBuyer: "Existing clients and their families",
    painPoint: "Anxious about case progress, need updates without calling",
    urgencyLevel: "medium",
    avgLeadValueCents: 100_000, // $1,000 (retention/upsell value)
    trustBarriers: ["Is this info current?", "Can I talk to someone?"],
    shortestPath: "SMS/Email → Status Page → Help Chat → Upsell Services",
    channels: ["sms_outbound", "email_outbound"],
  },
];

// ── Revenue Priority Order ───────────────────────────────────────────

export const REVENUE_PRIORITY: WidgetAppId[] = [
  "crypto_recovery",     // Highest ticket: $10K avg
  "emergency_intake",    // Urgent + high volume: $5K avg
  "demand_letter",       // Self-serve funnel: $2K avg
  "evidence_drop",       // Active-case upsell: $3K avg
  "status_help",         // Retention/upsell: $1K avg
];

// ── Marketing Agent IDs ──────────────────────────────────────────────

export const MARKETING_AGENT_IDS = {
  revenueCommander: "mkt-revenue-commander",
  marketIntelligence: "mkt-market-intelligence",
  offerStrategy: "mkt-offer-strategy",
  funnelArchitect: "mkt-funnel-architect",
  contentEngine: "mkt-content-engine",
  outreach: "mkt-outreach",
  paidAcquisition: "mkt-paid-acquisition",
  conversionOps: "mkt-conversion-ops",
  analytics: "mkt-analytics",
  brandCompliance: "mkt-brand-compliance",
} as const;

// ── Orchestrator Constants ───────────────────────────────────────────

export const MARKETING_CONSTANTS = {
  /** Maximum concurrent campaigns per widget app */
  maxCampaignsPerApp: 5,
  /** Lead score threshold for auto-qualification */
  autoQualifyScore: 70,
  /** Days before a lead is marked stale */
  staleDays: 14,
  /** Budget approval threshold (cents) — above this requires supervising_attorney */
  budgetApprovalThresholdCents: 500_00, // $500
  /** Confidence threshold for auto-approving generated assets */
  autoApproveConfidence: 0.92,
} as const;
