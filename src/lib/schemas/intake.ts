import { z } from "zod";

// ── Intake Source ──

export const IntakeSource = z.enum([
  "web_form",
  "phone",
  "email",
  "referral",
  "walk_in",
  "social_media",
  "chatbot",
  "partner_firm",
]);

// ── Intake Status ──

export const IntakeStatus = z.enum([
  "new",
  "screening",
  "conflict_check",
  "initial_review",
  "consultation_scheduled",
  "accepted",
  "declined",
  "referred_out",
  "withdrawn",
]);

// ── Conflict Check Result ──

export const ConflictCheckSchema = z.object({
  id: z.string().uuid(),
  checkedAt: z.string().datetime(),
  checkedBy: z.string().uuid(),
  checkedByName: z.string(),
  result: z.enum(["clear", "potential_conflict", "conflict_found"]),
  conflictingMatterIds: z.array(z.string().uuid()).default([]),
  conflictingPartyNames: z.array(z.string()).default([]),
  notes: z.string().optional(),
  waived: z.boolean().default(false),
  waivedBy: z.string().uuid().optional(),
  waivedAt: z.string().datetime().optional(),
});
export type ConflictCheck = z.infer<typeof ConflictCheckSchema>;

// ── Intake Record ──

export const IntakeSchema = z.object({
  id: z.string().uuid(),
  source: IntakeSource,
  status: IntakeStatus,

  // Contact info
  contactName: z.string(),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().optional(),
  contactAddress: z.string().optional(),

  // Case basics
  matterType: z.enum([
    "civil_property",
    "criminal_appeal",
    "wrongful_charge",
    "crypto_fraud",
    "smart_contract",
    "personal_injury",
    "business_dispute",
    "family_law",
    "immigration",
    "other",
  ]),
  jurisdiction: z.string().optional(),
  briefDescription: z.string(),
  urgency: z.enum(["routine", "elevated", "urgent", "emergency"]).default("routine"),

  // Adverse parties
  adverseParties: z.array(z.object({
    name: z.string(),
    role: z.string().optional(),
    knownAddress: z.string().optional(),
    knownCounsel: z.string().optional(),
  })).default([]),

  // Financial
  estimatedValue: z.number().optional(),
  retainerRequired: z.number().optional(),
  feeStructure: z.enum(["hourly", "flat_fee", "contingency", "hybrid", "pro_bono"]).optional(),

  // Conflict check
  conflictCheck: ConflictCheckSchema.optional(),

  // Documents submitted
  submittedDocuments: z.array(z.object({
    filename: z.string(),
    description: z.string().optional(),
    uploadedAt: z.string().datetime(),
  })).default([]),

  // Assignment
  assignedTo: z.string().uuid().optional(),
  assignedToName: z.string().optional(),
  reviewedBy: z.string().uuid().optional(),
  reviewedByName: z.string().optional(),

  // Resolution
  matterId: z.string().uuid().optional(), // if accepted → created matter
  declineReason: z.string().optional(),
  referralFirmName: z.string().optional(),

  // Timestamps
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  screenedAt: z.string().datetime().optional(),
  acceptedAt: z.string().datetime().optional(),
  declinedAt: z.string().datetime().optional(),
  createdBy: z.string().uuid(),
  createdByName: z.string(),
});
export type Intake = z.infer<typeof IntakeSchema>;
