import { z } from "zod";

// ── Communication Channel ──

export const CommChannel = z.enum([
  "email",
  "secure_message",
  "sms",
  "letter",
  "phone_note",
  "internal_note",
]);

// ── Communication Direction ──

export const CommDirection = z.enum(["outbound", "inbound", "internal"]);

// ── Communication Status ──

export const CommStatus = z.enum([
  "draft",
  "awaiting_approval",
  "approved",
  "scheduled",
  "sent",
  "delivered",
  "read",
  "bounced",
  "failed",
  "archived",
]);

// ── Email Draft ──

export const EmailDraftSchema = z.object({
  to: z.array(z.string().email()),
  cc: z.array(z.string().email()).default([]),
  bcc: z.array(z.string().email()).default([]),
  replyTo: z.string().email().optional(),
  subject: z.string(),
  bodyHtml: z.string(),
  bodyText: z.string().optional(),
  attachments: z.array(z.object({
    filename: z.string(),
    mimeType: z.string(),
    sizeBytes: z.number(),
    documentId: z.string().uuid().optional(),
    hash: z.string().optional(),
  })).default([]),
});
export type EmailDraft = z.infer<typeof EmailDraftSchema>;

// ── Communication Record ──

export const CommunicationSchema = z.object({
  id: z.string().uuid(),
  matterId: z.string().uuid(),
  matterTitle: z.string().optional(),
  namespaceSlug: z.string().optional(),

  // Type
  channel: CommChannel,
  direction: CommDirection,

  // Participants
  fromUserId: z.string().uuid().optional(),
  fromName: z.string(),
  fromEmail: z.string().email().optional(),
  toRecipients: z.array(z.object({
    name: z.string(),
    email: z.string().email().optional(),
    userId: z.string().uuid().optional(),
    role: z.string().optional(),
  })),

  // Content
  subject: z.string(),
  body: z.string(),
  bodyFormat: z.enum(["html", "markdown", "plaintext"]).default("markdown"),

  // Email-specific
  emailDraft: EmailDraftSchema.optional(),

  // Status and approval
  status: CommStatus,
  approvalId: z.string().uuid().optional(),

  // Content provenance
  generatedByAgent: z.string().optional(),
  confidenceScore: z.number().min(0).max(1).optional(),
  sourceCitations: z.array(z.string().uuid()).default([]),

  // Privileges
  privileged: z.boolean().default(false),
  workProduct: z.boolean().default(false),

  // Attachments
  attachments: z.array(z.object({
    id: z.string().uuid(),
    filename: z.string(),
    mimeType: z.string(),
    sizeBytes: z.number(),
    documentId: z.string().uuid().optional(),
  })).default([]),

  // Timestamps
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  sentAt: z.string().datetime().optional(),
  deliveredAt: z.string().datetime().optional(),
  readAt: z.string().datetime().optional(),
  scheduledFor: z.string().datetime().optional(),
  createdBy: z.string().uuid(),
  createdByName: z.string(),
});
export type Communication = z.infer<typeof CommunicationSchema>;
