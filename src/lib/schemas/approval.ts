import { z } from "zod";

// ── Approval Status Lifecycle ──
// draft → in_review → requires_source_check → requires_attorney_review → approved → sent/filed → archived

export const ApprovalStatus = z.enum([
  "draft",
  "in_review",
  "requires_source_check",
  "requires_attorney_review",
  "approved",
  "rejected",
  "sent",
  "filed",
  "archived",
]);
export type ApprovalStatusType = z.infer<typeof ApprovalStatus>;

// ── Approval Category ──

export const ApprovalCategory = z.enum([
  "outbound_email",
  "legal_filing",
  "demand_letter",
  "motion",
  "brief",
  "discovery_request",
  "discovery_response",
  "settlement_offer",
  "client_communication",
  "evidence_submission",
  "social_media_post",
  "press_release",
  "blockchain_transaction",
  "agent_action",
  "research_citation",
]);
export type ApprovalCategoryType = z.infer<typeof ApprovalCategory>;

// ── Source Citation (for provenance tracking) ──

export const SourceCitationSchema = z.object({
  id: z.string().uuid(),
  citationType: z.enum([
    "case_law",
    "statute",
    "regulation",
    "contract_clause",
    "deposition_excerpt",
    "evidence_item",
    "expert_opinion",
    "public_record",
    "blockchain_record",
    "ai_generated",
  ]),
  title: z.string(),
  reference: z.string(), // e.g., "42 U.S.C. § 1983", "Smith v. Jones, 123 F.3d 456"
  url: z.string().url().optional(),
  pageOrSection: z.string().optional(),
  content: z.string().optional(), // relevant excerpt
  verifiedAt: z.string().datetime().optional(),
  verifiedBy: z.string().uuid().optional(),
  confidenceScore: z.number().min(0).max(1).optional(),
  jurisdiction: z.string().optional(),
});
export type SourceCitation = z.infer<typeof SourceCitationSchema>;

// ── Redline Change ──

export const RedlineChangeSchema = z.object({
  id: z.string().uuid(),
  changeType: z.enum(["insertion", "deletion", "modification", "comment"]),
  location: z.string(), // section/paragraph reference
  originalText: z.string().optional(),
  newText: z.string().optional(),
  comment: z.string().optional(),
  authorId: z.string().uuid(),
  authorName: z.string(),
  createdAt: z.string().datetime(),
  accepted: z.boolean().optional(),
  acceptedBy: z.string().uuid().optional(),
  acceptedAt: z.string().datetime().optional(),
});
export type RedlineChange = z.infer<typeof RedlineChangeSchema>;

// ── Approval Review ──

export const ApprovalReviewSchema = z.object({
  id: z.string().uuid(),
  reviewerId: z.string().uuid(),
  reviewerName: z.string(),
  reviewerRole: z.string(),
  decision: z.enum(["approve", "reject", "request_changes", "escalate"]),
  comment: z.string().optional(),
  redlines: z.array(RedlineChangeSchema).default([]),
  createdAt: z.string().datetime(),
});
export type ApprovalReview = z.infer<typeof ApprovalReviewSchema>;

// ── Approval Queue Item ──

export const ApprovalItemSchema = z.object({
  id: z.string().uuid(),
  matterId: z.string().uuid(),
  matterTitle: z.string().optional(),
  namespaceSlug: z.string().optional(),

  // Content
  category: ApprovalCategory,
  title: z.string(),
  summary: z.string(), // plain-language description of what this is
  content: z.string(), // full text content (HTML/markdown)
  contentVersion: z.number().int().min(1).default(1),

  // Provenance
  sourceCitations: z.array(SourceCitationSchema).default([]),
  evidenceLinks: z.array(z.string().uuid()).default([]), // evidence item IDs
  factTags: z.array(z.string()).default([]), // semantic tags: "property_transfer", "fraud_indicator"
  confidenceScore: z.number().min(0).max(1).optional(),

  // Workflow
  status: ApprovalStatus,
  priority: z.enum(["low", "normal", "high", "urgent"]).default("normal"),
  assignedTo: z.string().uuid().optional(),
  assignedToName: z.string().optional(),
  requiredRole: z.string().optional(), // minimum role to approve
  escalatedFrom: z.string().uuid().optional(), // previous reviewer who escalated

  // Authoring
  createdBy: z.string().uuid(),
  createdByName: z.string(),
  createdByAgent: z.string().optional(), // agent ID if AI-generated
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),

  // Reviews
  reviews: z.array(ApprovalReviewSchema).default([]),
  redlines: z.array(RedlineChangeSchema).default([]),

  // Resolution
  approvedBy: z.string().uuid().optional(),
  approvedByName: z.string().optional(),
  approvedAt: z.string().datetime().optional(),
  rejectedBy: z.string().uuid().optional(),
  rejectionReason: z.string().optional(),
  sentAt: z.string().datetime().optional(),
  filedAt: z.string().datetime().optional(),

  // Deadline
  dueDate: z.string().optional(),
  courtDeadline: z.boolean().default(false),
});
export type ApprovalItem = z.infer<typeof ApprovalItemSchema>;
