import { z } from "zod";

// ── Enums ──────────────────────────────────────────
export const MatterType = z.enum([
  "civil_joint_property_accounting",
  "civil_sale_proceeds_dispute",
  "civil_partition_accounting",
  "criminal_defense",
  "criminal_appeal",
  "crypto_fraud_recovery",
]);

export const MatterStatus = z.enum([
  "intake",
  "investigation",
  "pre_litigation",
  "litigation",
  "appeal",
  "enforcement",
  "closed",
]);

export const PartyRole = z.enum([
  "claimant",
  "respondent",
  "co_owner",
  "counsel",
  "witness",
  "expert",
  "escrow_agent",
]);

export const PropertyStatus = z.enum(["held", "sold", "disputed", "partitioned"]);

export const EvidenceStatus = z.enum(["alleged", "supported", "disputed", "verified"]);

export const ClaimStrength = z.enum(["strong", "moderate", "weak", "blocked"]);

export const VerificationStatus = z.enum(["unverified", "verified", "disputed"]);

// ── Party ──────────────────────────────────────────
export const PartySchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  role: PartyRole,
  currentState: z.string(),
  historicalState: z.string().optional(),
  ownershipInterest: z.string().optional(),
  counsel: z.string().optional(),
  serviceStatus: z.string().optional(),
  collectionRiskFlags: z.array(z.string()).default([]),
  contact: z.object({
    email: z.string().email().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
  }).optional(),
});

// ── Property Asset ─────────────────────────────────
export const PropertyAssetSchema = z.object({
  id: z.string().uuid(),
  address: z.string(),
  county: z.string(),
  state: z.string(),
  parcelId: z.string().optional(),
  status: PropertyStatus,
  acquisitionDate: z.string().optional(),
  saleDate: z.string().optional(),
  salePrice: z.number().optional(),
  currentValue: z.number().optional(),
  ownershipStructure: z.string().optional(),
});

// ── Claim Element ──────────────────────────────────
export const ClaimElementSchema = z.object({
  elementName: z.string(),
  requiredProof: z.string(),
  linkedFacts: z.array(z.string()),
  linkedEvidence: z.array(z.string()),
  missingEvidence: z.array(z.string()),
  defenseExposure: z.string().optional(),
  status: EvidenceStatus,
});

// ── Claim ──────────────────────────────────────────
export const ClaimSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  type: z.enum([
    "breach_of_written_contract",
    "accounting",
    "implied_contract",
    "unjust_enrichment",
    "money_had_and_received",
    "partition",
    "reimbursement_for_improvements",
    "breach_of_fiduciary_duty",
    "conversion",
  ]),
  strengthScore: ClaimStrength,
  limitationYears: z.number(),
  limitationExpiry: z.string().optional(),
  elements: z.array(ClaimElementSchema),
  statusNote: z.string().optional(),
});

// ── Evidence Item ──────────────────────────────────
export const EvidenceItemSchema = z.object({
  id: z.string().uuid(),
  category: z.enum([
    "deed",
    "settlement_statement",
    "escrow_disbursement",
    "invoice",
    "receipt",
    "bank_statement",
    "wire_confirmation",
    "communication",
    "tax_appraisal",
    "loan_document",
    "photo",
    "video",
    "expert_report",
    "contract",
    "entity_document",
    "other",
  ]),
  title: z.string(),
  description: z.string().optional(),
  dateObtained: z.string().optional(),
  dateOfDocument: z.string().optional(),
  status: EvidenceStatus,
  sourceParty: z.string().optional(),
  linkedClaims: z.array(z.string()).default([]),
  fileUrl: z.string().optional(),
  hashOnChain: z.string().optional(),
});

// ── Ledger Entry ───────────────────────────────────
export const LedgerEntrySchema = z.object({
  id: z.string().uuid(),
  amount: z.number(),
  date: z.string(),
  payor: z.string(),
  payee: z.string().optional(),
  category: z.enum([
    "sale_proceeds",
    "closing_disbursement",
    "improvement",
    "repair",
    "carrying_cost",
    "loan_offset",
    "management_fee",
    "rent_profit",
    "marketing_expense",
    "tax_payment",
    "insurance",
    "other",
  ]),
  description: z.string(),
  sourceDocument: z.string().optional(),
  verificationStatus: VerificationStatus,
  disputeNote: z.string().optional(),
  party: z.enum(["claimant", "respondent", "joint"]),
});

// ── Deadline ───────────────────────────────────────
export const DeadlineSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  date: z.string(),
  type: z.enum(["filing", "response", "hearing", "limitation", "discovery", "custom"]),
  status: z.enum(["pending", "met", "missed", "extended"]),
  notes: z.string().optional(),
});

// ── Jurisdiction Assessment ────────────────────────
export const JurisdictionSchema = z.object({
  propertyState: z.string(),
  propertyCounty: z.string(),
  defendantCurrentState: z.string(),
  transactionState: z.string(),
  titleStillActive: z.boolean(),
  recommendedForum: z.string(),
  reasonLog: z.array(z.string()),
  filingReadiness: z.array(z.object({
    item: z.string(),
    ready: z.boolean(),
    notes: z.string().optional(),
  })),
});

// ── Recovery Path ──────────────────────────────────
export const RecoveryPathSchema = z.object({
  georgiaJudgmentPath: z.object({
    status: z.string(),
    nextSteps: z.array(z.string()),
  }),
  floridaDomesticationPath: z.object({
    status: z.string(),
    statute: z.string(),
    nextSteps: z.array(z.string()),
  }),
  floridaHomesteadRisk: z.object({
    riskLevel: z.enum(["low", "medium", "high", "unknown"]),
    notes: z.string(),
  }),
  nonHomesteadTargets: z.array(z.object({
    assetType: z.string(),
    description: z.string(),
    status: z.string(),
  })),
  collectionReadiness: z.enum(["not_started", "in_progress", "ready"]),
});

// ── Damages Model ──────────────────────────────────
export const DamagesModelSchema = z.object({
  claimantNetPosition: z.number(),
  respondentNetPosition: z.number(),
  verifiedSubtotal: z.number(),
  disputedSubtotal: z.number(),
  estimatedCaseValue: z.number(),
  prejudgmentInterestEligible: z.boolean(),
  prejudgmentInterestAmount: z.number().optional(),
});

// ── Full Matter ────────────────────────────────────
export const MatterSchema = z.object({
  id: z.string().uuid(),
  matterId: z.string(),
  title: z.string(),
  type: MatterType,
  status: MatterStatus,
  forumState: z.string(),
  likelyCounty: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  property: PropertyAssetSchema,
  parties: z.array(PartySchema),
  claims: z.array(ClaimSchema),
  evidence: z.array(EvidenceItemSchema),
  ledger: z.array(LedgerEntrySchema),
  deadlines: z.array(DeadlineSchema),
  jurisdiction: JurisdictionSchema,
  recovery: RecoveryPathSchema,
  damages: DamagesModelSchema,
});

// ── Inferred Types ─────────────────────────────────
export type Matter = z.infer<typeof MatterSchema>;
export type Party = z.infer<typeof PartySchema>;
export type PropertyAsset = z.infer<typeof PropertyAssetSchema>;
export type Claim = z.infer<typeof ClaimSchema>;
export type ClaimElement = z.infer<typeof ClaimElementSchema>;
export type EvidenceItem = z.infer<typeof EvidenceItemSchema>;
export type LedgerEntry = z.infer<typeof LedgerEntrySchema>;
export type Deadline = z.infer<typeof DeadlineSchema>;
export type Jurisdiction = z.infer<typeof JurisdictionSchema>;
export type RecoveryPath = z.infer<typeof RecoveryPathSchema>;
export type DamagesModel = z.infer<typeof DamagesModelSchema>;
