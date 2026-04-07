import { z } from "zod";

// ── Audit Action Category ──

export const AuditAction = z.enum([
  // Matter lifecycle
  "matter_created",
  "matter_updated",
  "matter_status_changed",
  "matter_assigned",
  "matter_archived",
  "matter_reopened",

  // Evidence
  "evidence_uploaded",
  "evidence_ingested",
  "evidence_verified",
  "evidence_challenged",
  "evidence_linked",
  "evidence_hash_recorded",
  "evidence_chain_extended",

  // Documents
  "document_generated",
  "document_edited",
  "document_reviewed",
  "document_approved",
  "document_rejected",
  "document_filed",
  "document_served",
  "document_versioned",

  // Approvals
  "approval_submitted",
  "approval_assigned",
  "approval_reviewed",
  "approval_approved",
  "approval_rejected",
  "approval_escalated",

  // Communications
  "email_drafted",
  "email_sent",
  "message_sent",
  "client_notified",

  // Research
  "research_query_executed",
  "citation_verified",
  "citation_invalidated",
  "authority_ranked",

  // Forensics
  "wallet_traced",
  "transaction_analyzed",
  "blockchain_evidence_recorded",

  // Auth
  "user_login",
  "user_logout",
  "permission_granted",
  "permission_revoked",
  "role_changed",
  "namespace_accessed",

  // Agent
  "agent_action_requested",
  "agent_action_completed",
  "agent_action_failed",
  "agent_escalated_to_human",

  // System
  "system_error",
  "workflow_started",
  "workflow_completed",
  "task_completed",
]);
export type AuditActionType = z.infer<typeof AuditAction>;

// ── Audit Entry (Immutable) ──

export const AuditEntrySchema = z.object({
  id: z.string().uuid(),
  timestamp: z.string().datetime(),

  // What happened
  action: AuditAction,
  category: z.enum([
    "matter",
    "evidence",
    "document",
    "approval",
    "communication",
    "research",
    "forensics",
    "auth",
    "agent",
    "workflow",
    "system",
  ]),

  // Who did it
  actorType: z.enum(["user", "agent", "system"]),
  actorId: z.string(), // user ID, agent ID, or "system"
  actorName: z.string(),
  actorRole: z.string().optional(),

  // Context
  matterId: z.string().uuid().optional(),
  namespaceSlug: z.string().optional(),
  resourceType: z.string().optional(), // "document", "evidence", "approval", etc.
  resourceId: z.string().uuid().optional(),

  // Details
  summary: z.string(), // human-readable description
  details: z.record(z.string(), z.unknown()).optional(), // structured metadata
  previousValue: z.string().optional(), // for changes: what it was before
  newValue: z.string().optional(), // for changes: what it is now

  // Integrity
  contentHash: z.string().optional(), // SHA-256 of the entry for tamper detection
  previousEntryHash: z.string().optional(), // hash chain for immutability

  // IP/session
  ipAddress: z.string().optional(),
  sessionId: z.string().uuid().optional(),
});
export type AuditEntry = z.infer<typeof AuditEntrySchema>;

// ── Audit Query Filters ──

export const AuditQuerySchema = z.object({
  matterId: z.string().uuid().optional(),
  namespaceSlug: z.string().optional(),
  actorId: z.string().optional(),
  actorType: z.enum(["user", "agent", "system"]).optional(),
  action: AuditAction.optional(),
  category: z.string().optional(),
  resourceType: z.string().optional(),
  resourceId: z.string().uuid().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  limit: z.number().int().min(1).max(1000).default(50),
  offset: z.number().int().min(0).default(0),
});
export type AuditQuery = z.infer<typeof AuditQuerySchema>;
