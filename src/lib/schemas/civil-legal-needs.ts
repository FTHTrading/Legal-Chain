import { z } from "zod";

// ─── Civil Legal Need Categories (LSC Justice Gap data) ─────────────────────

export const CivilLegalCategory = z.enum([
  "consumer_debt",        // 50% of low-income households
  "health_care",          // 39%
  "public_benefits",      // 34%
  "housing",              // 33% overall, 43% renter households
  "family_safety",        // 26% overall, 44% w/ children under 12
  "education",            // 19% overall, 42% w/ students
  "employment",           // lower frequency, highest damage
  "disability_records",   // disability + ID/records blocking access
  "wills_estates",        // recurring after death, guardianship, transfers
]);
export type CivilLegalCategory = z.infer<typeof CivilLegalCategory>;

// ─── Impact + Urgency Axes ──────────────────────────────────────────────────

/** 1–10 scoring on each axis */
export const AxisScore = z.number().int().min(1).max(10);

export const CivilTriageAxes = z.object({
  /** How quickly must this be addressed? Utility shutoff, eviction, benefit termination. */
  timeSensitivity: AxisScore,
  /** Will this lead to homelessness, family separation, or loss of basic needs? */
  stabilityRisk: AxisScore,
  /** Does inaction create cascading harm — lost benefits, criminal exposure, record damage? */
  collateralConsequences: AxisScore,
  /** Are children, disabled persons, elderly, or domestic violence survivors involved? */
  vulnerablePartyFactor: AxisScore,
});
export type CivilTriageAxes = z.infer<typeof CivilTriageAxes>;

// ─── Sub-Issue Types Per Category ───────────────────────────────────────────

export const ConsumerDebtIssue = z.enum([
  "medical_debt", "utility_shutoff", "creditor_harassment", "scam_fraud",
  "repossession", "billing_dispute", "garnishment", "payday_lending",
  "debt_collection_lawsuit", "credit_reporting_error", "bankruptcy_need",
]);

export const HealthCareIssue = z.enum([
  "insurance_denial", "wrong_medical_bill", "medication_access",
  "medicaid_eligibility", "provider_dispute", "mental_health_access",
  "disability_accommodation", "nursing_home_issue",
]);

export const PublicBenefitsIssue = z.enum([
  "snap_denial", "tanf_termination", "unemployment_dispute",
  "disability_income", "ssi_ssdi", "stimulus_relief",
  "medicaid_denial", "benefit_overpayment", "appeal_deadline",
]);

export const HousingIssue = z.enum([
  "eviction_defense", "unsafe_conditions", "rent_dispute",
  "foreclosure", "subsidy_voucher", "landlord_retaliation",
  "lockout", "lease_violation", "fair_housing_discrimination",
  "public_housing_termination", "utility_included_dispute",
]);

export const FamilySafetyIssue = z.enum([
  "domestic_violence_protection", "custody", "child_support",
  "guardianship", "child_safety", "divorce", "visitation",
  "teen_parent_rights", "elder_abuse", "stalking_protection",
]);

export const EducationIssue = z.enum([
  "school_enrollment", "special_education_iep", "discipline_expulsion",
  "transportation_access", "school_records", "bullying_harassment",
  "college_financial_aid", "student_loan_dispute",
]);

export const EmploymentIssue = z.enum([
  "wage_theft", "wrongful_termination", "unemployment_denial",
  "leave_retaliation", "workplace_safety", "discrimination",
  "workers_compensation", "independent_contractor_misclass",
]);

export const DisabilityRecordsIssue = z.enum([
  "id_documents", "vital_records", "name_change",
  "disability_accommodation", "record_correction",
  "background_check_error", "immigration_documents",
]);

export const WillsEstatesIssue = z.enum([
  "will_creation", "guardianship_designation", "estate_administration",
  "power_of_attorney", "advance_directive", "property_transfer",
  "beneficiary_dispute",
]);

// ─── Civil Legal Need Record ────────────────────────────────────────────────

export const CivilLegalNeedSchema = z.object({
  id: z.string().uuid(),
  intakeId: z.string().uuid(),
  matterId: z.string().uuid().optional(),

  /** Primary category */
  category: CivilLegalCategory,
  /** Specific sub-issue */
  subIssue: z.string(),     // validated per category at runtime

  /** Triage scoring — 4 axes, 1–10 each */
  triage: CivilTriageAxes,
  /** Composite score: average of 4 axes, auto-computed */
  compositeScore: z.number().min(1).max(10),

  /** Narrative */
  description: z.string(),
  /** Immediate deadline if any */
  deadline: z.string().datetime().optional(),
  deadlineType: z.enum([
    "court_hearing", "benefit_termination", "eviction_date",
    "utility_shutoff", "appeal_deadline", "statute_of_limitations",
    "other",
  ]).optional(),

  /** Household context */
  householdSize: z.number().int().min(1).optional(),
  hasMinorChildren: z.boolean().default(false),
  hasElderlyMember: z.boolean().default(false),
  hasDisabledMember: z.boolean().default(false),
  isDomesticViolenceSurvivor: z.boolean().default(false),
  isVeteran: z.boolean().default(false),
  primaryLanguage: z.string().default("English"),
  annualHouseholdIncome: z.number().optional(),
  povertyLevelPercent: z.number().optional(), // e.g., 125 = 125% FPL

  /** Severity multipliers */
  multipliers: z.array(z.enum([
    "child_removal_risk",
    "domestic_violence",
    "immigration_consequences",
    "public_housing_termination",
    "license_loss",
    "pretrial_detention",
    "probation_parole_status",
    "mental_health_crisis",
    "addiction_crisis",
    "multiple_open_cases",
    "homelessness_risk",
    "medical_emergency",
  ])).default([]),

  /** Disposition */
  status: z.enum([
    "identified", "triaged", "referred", "accepted",
    "in_progress", "resolved", "unresolved", "withdrawn",
  ]).default("identified"),

  /** Referral tracking */
  referredTo: z.string().optional(),
  referralOrganization: z.string().optional(),
  proBonoEligible: z.boolean().default(false),

  /** Timestamps */
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  triageCompletedAt: z.string().datetime().optional(),
  resolvedAt: z.string().datetime().optional(),

  /** Attribution */
  createdBy: z.string().uuid(),
  triagedBy: z.string().uuid().optional(),
});
export type CivilLegalNeed = z.infer<typeof CivilLegalNeedSchema>;

// ─── Composite Score Computation ────────────────────────────────────────────

export function computeCivilComposite(axes: CivilTriageAxes): number {
  const { timeSensitivity, stabilityRisk, collateralConsequences, vulnerablePartyFactor } = axes;
  const raw = (timeSensitivity + stabilityRisk + collateralConsequences + vulnerablePartyFactor) / 4;
  return Math.round(raw * 10) / 10;
}

// ─── Category Urgency Defaults (from LSC data) ─────────────────────────────

export const CATEGORY_URGENCY_DEFAULTS: Record<CivilLegalCategory, {
  typicalTimeSensitivity: number;
  typicalStabilityRisk: number;
}> = {
  housing:           { typicalTimeSensitivity: 9, typicalStabilityRisk: 9 },
  family_safety:     { typicalTimeSensitivity: 9, typicalStabilityRisk: 9 },
  public_benefits:   { typicalTimeSensitivity: 8, typicalStabilityRisk: 8 },
  employment:        { typicalTimeSensitivity: 7, typicalStabilityRisk: 8 },
  consumer_debt:     { typicalTimeSensitivity: 6, typicalStabilityRisk: 7 },
  health_care:       { typicalTimeSensitivity: 7, typicalStabilityRisk: 7 },
  education:         { typicalTimeSensitivity: 6, typicalStabilityRisk: 6 },
  disability_records:{ typicalTimeSensitivity: 5, typicalStabilityRisk: 6 },
  wills_estates:     { typicalTimeSensitivity: 4, typicalStabilityRisk: 5 },
};
