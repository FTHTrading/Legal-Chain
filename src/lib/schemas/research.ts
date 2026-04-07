import { z } from "zod";

// ── Research Query Type ──

export const ResearchQueryType = z.enum([
  "case_law_search",
  "statute_lookup",
  "regulation_search",
  "authority_analysis",
  "opposing_authority",
  "jurisdiction_comparison",
  "legal_standard",
  "precedent_chain",
  "fact_pattern_match",
  "damages_analysis",
  "procedural_research",
  "expert_search",
]);

// ── Authority Strength ──

export const AuthorityStrength = z.enum([
  "binding",        // controlling authority in same jurisdiction
  "persuasive",     // non-binding but influential
  "secondary",      // treatises, law review articles
  "distinguishable", // similar but factually different
  "adverse",        // supports opposing party
  "superseded",     // overruled or replaced
]);

// ── Legal Authority ──

export const LegalAuthoritySchema = z.object({
  id: z.string().uuid(),
  title: z.string(), // case name or statute title
  citation: z.string(), // formal legal citation
  authorityType: z.enum([
    "case",
    "statute",
    "regulation",
    "constitutional_provision",
    "treatise",
    "law_review",
    "restatement",
    "administrative_ruling",
    "executive_order",
  ]),

  // Strength and relevance
  strength: AuthorityStrength,
  relevanceScore: z.number().min(0).max(1),
  jurisdiction: z.string(),
  court: z.string().optional(),
  dateDecided: z.string().optional(),

  // Content
  holdingSummary: z.string(), // key holding or rule statement
  relevantExcerpts: z.array(z.object({
    text: z.string(),
    pageOrSection: z.string().optional(),
  })).default([]),

  // Links
  linkedClaims: z.array(z.string().uuid()).default([]),
  linkedElements: z.array(z.string().uuid()).default([]),

  // Verification
  verified: z.boolean().default(false),
  verifiedAt: z.string().datetime().optional(),
  verifiedBy: z.string().uuid().optional(),
  goodLaw: z.boolean().default(true), // not overruled/superseded
  shepardized: z.boolean().default(false),
  shepardizedAt: z.string().datetime().optional(),

  // Source
  sourceDatabase: z.string().optional(), // "westlaw", "lexis", "courtlistener", "ai_generated"
  url: z.string().url().optional(),
});
export type LegalAuthority = z.infer<typeof LegalAuthoritySchema>;

// ── Research Query ──

export const ResearchQuerySchema = z.object({
  id: z.string().uuid(),
  matterId: z.string().uuid(),
  matterTitle: z.string().optional(),

  // Query
  queryType: ResearchQueryType,
  query: z.string(), // natural language research question
  jurisdiction: z.string().optional(),
  jurisdictionFilter: z.array(z.string()).default([]),
  topicTags: z.array(z.string()).default([]),
  dateRange: z.object({
    start: z.string().optional(),
    end: z.string().optional(),
  }).optional(),

  // Assignment
  assignedTo: z.string().uuid().optional(),
  assignedToName: z.string().optional(),
  assignedToAgent: z.string().optional(), // agent ID

  // Status
  status: z.enum([
    "pending",
    "in_progress",
    "completed",
    "needs_review",
    "reviewed",
    "incorporated",
  ]),

  // Results
  authorities: z.array(LegalAuthoritySchema).default([]),
  resultSummary: z.string().optional(),
  confidenceScore: z.number().min(0).max(1).optional(),
  totalResults: z.number().int().optional(),

  // Metadata
  createdBy: z.string().uuid(),
  createdByName: z.string(),
  createdAt: z.string().datetime(),
  completedAt: z.string().datetime().optional(),
  reviewedBy: z.string().uuid().optional(),
  reviewedAt: z.string().datetime().optional(),
});
export type ResearchQuery = z.infer<typeof ResearchQuerySchema>;

// ── Authority Table (per matter) ──

export const AuthorityTableSchema = z.object({
  matterId: z.string().uuid(),
  matterTitle: z.string(),
  authorities: z.array(LegalAuthoritySchema),
  lastUpdated: z.string().datetime(),
  updatedBy: z.string().uuid(),
});
export type AuthorityTable = z.infer<typeof AuthorityTableSchema>;
