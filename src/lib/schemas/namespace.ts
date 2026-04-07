import { z } from "zod";

// ── Namespace Status ──

export const NamespaceStatus = z.enum([
  "provisioning",
  "active",
  "suspended",
  "archived",
  "closed",
]);

// ── Access Grant ──

export const NamespaceAccessSchema = z.object({
  userId: z.string().uuid(),
  role: z.enum(["owner", "counsel", "staff", "client", "family", "expert", "read_only"]),
  grantedBy: z.string().uuid(),
  grantedAt: z.string().datetime(),
  expiresAt: z.string().datetime().optional(),
  permissions: z.array(z.enum([
    "view_overview",
    "view_timeline",
    "view_documents",
    "view_evidence",
    "view_status",
    "view_milestones",
    "download_packets",
    "send_messages",
    "view_financials",
    "view_strategy",
    "view_privileged",
  ])),
});
export type NamespaceAccess = z.infer<typeof NamespaceAccessSchema>;

// ── Milestone ──

export const MilestoneSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  description: z.string().optional(),
  status: z.enum(["pending", "in_progress", "completed", "blocked"]),
  targetDate: z.string().optional(),
  completedAt: z.string().datetime().optional(),
  visibleToClient: z.boolean().default(true),
});
export type Milestone = z.infer<typeof MilestoneSchema>;

// ── Secure Message ──

export const SecureMessageSchema = z.object({
  id: z.string().uuid(),
  namespaceSlug: z.string(),
  fromUserId: z.string().uuid(),
  fromName: z.string(),
  toUserId: z.string().uuid().optional(), // broadcast if omitted
  subject: z.string(),
  body: z.string(),
  attachments: z.array(z.object({
    id: z.string().uuid(),
    filename: z.string(),
    mimeType: z.string(),
    sizeBytes: z.number(),
    hash: z.string(), // SHA-256
  })).default([]),
  sentAt: z.string().datetime(),
  readAt: z.string().datetime().optional(),
  privileged: z.boolean().default(false),
});
export type SecureMessage = z.infer<typeof SecureMessageSchema>;

// ── Download Packet ──

export const DownloadPacketSchema = z.object({
  id: z.string().uuid(),
  namespaceSlug: z.string(),
  title: z.string(),
  description: z.string().optional(),
  packetType: z.enum([
    "case_summary",
    "evidence_binder",
    "authority_table",
    "timeline_report",
    "filing_packet",
    "client_update",
    "full_case_package",
    "custom",
  ]),
  files: z.array(z.object({
    filename: z.string(),
    mimeType: z.string(),
    sizeBytes: z.number(),
    hash: z.string(),
  })),
  generatedAt: z.string().datetime(),
  generatedBy: z.string().uuid(),
  approvedBy: z.string().uuid().optional(),
  approvedAt: z.string().datetime().optional(),
  downloadedAt: z.string().datetime().optional(),
  downloadedBy: z.string().uuid().optional(),
  expiresAt: z.string().datetime().optional(),
  redactionLevel: z.enum(["none", "client_safe", "family_safe", "public_safe"]).default("none"),
});
export type DownloadPacket = z.infer<typeof DownloadPacketSchema>;

// ── Client Namespace (Sovereign Workspace) ──

export const NamespaceSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/).min(3).max(64),
  matterId: z.string().uuid(),
  title: z.string(),
  subtitle: z.string().optional(),
  status: NamespaceStatus,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),

  // Access control
  access: z.array(NamespaceAccessSchema),

  // Client-facing content
  milestones: z.array(MilestoneSchema).default([]),
  messages: z.array(SecureMessageSchema).default([]),
  packets: z.array(DownloadPacketSchema).default([]),

  // Display
  caseType: z.string(),
  jurisdiction: z.string().optional(),
  statusSummary: z.string().optional(), // plain-language status for client
  nextAction: z.string().optional(),
  lastUpdated: z.string().datetime().optional(),
});
export type Namespace = z.infer<typeof NamespaceSchema>;
