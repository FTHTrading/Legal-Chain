import { z } from "zod";

// ── Document Type ──

export const DocumentType = z.enum([
  "demand_letter",
  "motion",
  "brief",
  "memorandum",
  "complaint",
  "answer",
  "discovery_request",
  "discovery_response",
  "subpoena",
  "settlement_agreement",
  "affidavit",
  "declaration",
  "stipulation",
  "order",
  "notice",
  "correspondence",
  "report",
  "analysis",
  "timeline",
  "dossier",
  "client_update",
  "press_release",
  "internal_memo",
  "evidence_summary",
  "authority_table",
  "custom",
]);
export type DocumentTypeValue = z.infer<typeof DocumentType>;

// ── Document Status ──

export const DocumentStatus = z.enum([
  "generating",
  "draft",
  "in_review",
  "approved",
  "filed",
  "served",
  "superseded",
  "withdrawn",
  "archived",
]);

// ── Document Provenance ──

export const DocumentProvenanceSchema = z.object({
  // Source tracking
  sourceCitations: z.array(z.object({
    id: z.string().uuid(),
    citationType: z.string(),
    title: z.string(),
    reference: z.string(),
    verifiedAt: z.string().datetime().optional(),
    verifiedBy: z.string().uuid().optional(),
  })).default([]),

  // Evidence links
  evidenceLinks: z.array(z.string().uuid()).default([]),

  // Fact tags (semantic labels from the analysis)
  factTags: z.array(z.string()).default([]),

  // Review provenance
  reviewStatus: z.enum([
    "unreviewed",
    "ai_reviewed",
    "paralegal_reviewed",
    "attorney_reviewed",
    "partner_reviewed",
  ]).default("unreviewed"),

  // Confidence scoring
  confidenceScore: z.number().min(0).max(1).optional(),
  confidenceBreakdown: z.object({
    factualAccuracy: z.number().min(0).max(1).optional(),
    citationValidity: z.number().min(0).max(1).optional(),
    legalReasoning: z.number().min(0).max(1).optional(),
    completeness: z.number().min(0).max(1).optional(),
  }).optional(),

  // Generation metadata
  generatedBy: z.enum(["human", "agent", "hybrid"]),
  agentId: z.string().optional(),
  agentModel: z.string().optional(), // e.g., "gpt-4o", "claude-3.5-sonnet"
  generationPromptHash: z.string().optional(),
  generationTimestamp: z.string().datetime().optional(),
  editHistory: z.array(z.object({
    editorId: z.string().uuid(),
    editorName: z.string(),
    editType: z.enum(["manual", "ai_suggestion", "redline_accepted"]),
    timestamp: z.string().datetime(),
    summary: z.string().optional(),
  })).default([]),
});
export type DocumentProvenance = z.infer<typeof DocumentProvenanceSchema>;

// ── Document Version ──

export const DocumentVersionSchema = z.object({
  version: z.number().int().min(1),
  content: z.string(), // raw content (markdown or HTML)
  contentHash: z.string(), // SHA-256 of content
  createdAt: z.string().datetime(),
  createdBy: z.string().uuid(),
  createdByName: z.string(),
  changeNote: z.string().optional(),
  provenance: DocumentProvenanceSchema,
});
export type DocumentVersion = z.infer<typeof DocumentVersionSchema>;

// ── Legal Document ──

export const DocumentSchema = z.object({
  id: z.string().uuid(),
  matterId: z.string().uuid(),
  matterTitle: z.string().optional(),
  namespaceSlug: z.string().optional(),

  // Classification
  documentType: DocumentType,
  title: z.string(),
  subtitle: z.string().optional(),
  description: z.string().optional(),

  // Current content
  currentVersion: z.number().int().min(1).default(1),
  content: z.string(), // current version content
  contentFormat: z.enum(["markdown", "html", "plaintext"]).default("markdown"),

  // File reference (if stored as file)
  filename: z.string().optional(),
  mimeType: z.string().optional(),
  fileSizeBytes: z.number().optional(),
  fileHash: z.string().optional(), // SHA-256
  storagePath: z.string().optional(),

  // Status and workflow
  status: DocumentStatus,
  approvalId: z.string().uuid().optional(), // link to approval queue item

  // Provenance (current version)
  provenance: DocumentProvenanceSchema,

  // Version history
  versions: z.array(DocumentVersionSchema).default([]),

  // Jurisdiction and filing
  jurisdiction: z.string().optional(),
  courtName: z.string().optional(),
  caseNumber: z.string().optional(),
  filingDate: z.string().optional(),
  dueDate: z.string().optional(),

  // Access control
  privileged: z.boolean().default(false),
  redactionLevel: z.enum(["none", "client_safe", "family_safe", "public_safe"]).default("none"),
  visibleToClient: z.boolean().default(false),

  // Timestamps
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  createdBy: z.string().uuid(),
  createdByName: z.string(),
});
export type Document = z.infer<typeof DocumentSchema>;
