import { z } from "zod";
import { AxisScore } from "./civil-legal-needs";

// ─── Criminal Severity Levels (impact + urgency, not blame) ─────────────────

export const CriminalSeverityLevel = z.enum([
  "level_1_record_exposure",        // old records, warrants, license suspensions
  "level_2_active_low_risk",        // open case, no major detention threat
  "level_3_liberty_threat",         // jail time realistic, family disruption
  "level_4_family_survival_threat", // felony exposure, custody loss, deportation
  "level_5_crisis_catastrophic",    // immediate liberty loss, permanent harm
]);
export type CriminalSeverityLevel = z.infer<typeof CriminalSeverityLevel>;

// ─── Charge Categories Per Level ────────────────────────────────────────────

export const Level1ChargeType = z.enum([
  "old_misdemeanor_record", "warrant_missed_court", "license_suspension_fines",
  "background_check_barrier", "probation_paperwork_violation",
  "expungement_sealing_need",
]);

export const Level2ChargeType = z.enum([
  "shoplifting_petty_theft", "simple_possession", "disorderly_conduct_trespass",
  "driving_suspended_license", "first_time_nonviolent_misdemeanor",
  "failure_to_appear_early",
]);

export const Level3ChargeType = z.enum([
  "repeated_misdemeanors", "probation_violation", "dui_dwi",
  "domestic_disturbance_no_injury", "juvenile_delinquency",
  "jail_time_realistic", "housing_or_employment_loss_threat",
]);

export const Level4ChargeType = z.enum([
  "felony_drug", "firearm_related", "burglary_robbery",
  "assault_battery_injury", "domestic_violence_protective_order_overlap",
  "child_neglect_endangerment_criminal", "immigration_triggering_charge",
]);

export const Level5ChargeType = z.enum([
  "homicide_attempted_homicide", "serious_violent_felony", "sexual_offense",
  "child_abuse_prosecution", "human_trafficking_exploitation",
  "major_conspiracy_organized_crime", "pretrial_detention_no_bond",
]);

// ─── 4-Axis Triage Model ───────────────────────────────────────────────────

export const CriminalTriageAxes = z.object({
  /** Warning → prison exposure. How much liberty is at stake right now? */
  libertyRisk: AxisScore,
  /** Housing, income, child care — will the family fall apart? */
  familyStabilityRisk: AxisScore,
  /** Immigration, licensing, benefits, record — downstream damage. */
  collateralConsequences: AxisScore,
  /** Warrant, hearing date, detention, violation clock — how fast? */
  timeSensitivity: AxisScore,
});
export type CriminalTriageAxes = z.infer<typeof CriminalTriageAxes>;

// ─── Severity Multipliers ───────────────────────────────────────────────────

export const SeverityMultiplier = z.enum([
  "child_removal_risk",
  "domestic_violence_protective_order",
  "immigration_consequences",
  "public_housing_termination",
  "license_loss",
  "pretrial_detention",
  "probation_parole_status",
  "mental_health_crisis",
  "addiction_crisis",
  "multiple_open_cases",
]);
export type SeverityMultiplier = z.infer<typeof SeverityMultiplier>;

// ─── Criminal Legal Need Record ─────────────────────────────────────────────

export const CriminalLegalNeedSchema = z.object({
  id: z.string().uuid(),
  intakeId: z.string().uuid(),
  matterId: z.string().uuid().optional(),

  /** Severity level (1–5) */
  severityLevel: CriminalSeverityLevel,
  /** Specific charge type within level */
  chargeType: z.string(),
  /** Charge description as stated */
  chargeDescription: z.string(),

  /** 4-axis triage scoring */
  triage: CriminalTriageAxes,
  /** Composite: weighted average (liberty risk weighted 1.5x) */
  compositeScore: z.number().min(1).max(10),

  /** Case context */
  jurisdiction: z.string(),
  courtName: z.string().optional(),
  caseNumber: z.string().optional(),
  nextHearingDate: z.string().datetime().optional(),
  isCurrentlyDetained: z.boolean().default(false),
  bondAmount: z.number().optional(),
  bondStatus: z.enum(["no_bond", "bond_set", "bond_posted", "released_or", "detained"]).optional(),

  /** Severity multipliers */
  multipliers: z.array(SeverityMultiplier).default([]),

  /** Collateral consequences identified */
  collateralFlags: z.array(z.enum([
    "immigration_deportation_risk",
    "sex_offender_registry",
    "firearm_prohibition",
    "professional_license_loss",
    "public_housing_bar",
    "student_financial_aid_loss",
    "employment_background_bar",
    "child_custody_impact",
    "driver_license_revocation",
    "voting_rights_impact",
  ])).default([]),

  /** Prior record context (not for blame — for realistic outcome assessment) */
  hasPriorConvictions: z.boolean().default(false),
  isOnProbationOrParole: z.boolean().default(false),
  hasOpenCasesElsewhere: z.boolean().default(false),

  /** Household context */
  dependentCount: z.number().int().min(0).default(0),
  isSoleProvider: z.boolean().default(false),
  hasMinorChildren: z.boolean().default(false),

  /** Disposition */
  status: z.enum([
    "identified", "triaged", "referred", "accepted",
    "in_progress", "resolved", "unresolved", "withdrawn",
  ]).default("identified"),

  /** Referral */
  referredTo: z.string().optional(),
  publicDefenderAssigned: z.boolean().default(false),
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
export type CriminalLegalNeed = z.infer<typeof CriminalLegalNeedSchema>;

// ─── Composite Score Computation ────────────────────────────────────────────

/** Liberty risk weighted 1.5x — losing freedom is the most acute harm. */
export function computeCriminalComposite(axes: CriminalTriageAxes): number {
  const { libertyRisk, familyStabilityRisk, collateralConsequences, timeSensitivity } = axes;
  const raw = (libertyRisk * 1.5 + familyStabilityRisk + collateralConsequences + timeSensitivity) / 4.5;
  return Math.round(raw * 10) / 10;
}

// ─── Level Baseline Scoring Defaults ────────────────────────────────────────

export const LEVEL_DEFAULTS: Record<CriminalSeverityLevel, {
  typicalLibertyRisk: number;
  typicalFamilyStabilityRisk: number;
}> = {
  level_1_record_exposure:        { typicalLibertyRisk: 2, typicalFamilyStabilityRisk: 3 },
  level_2_active_low_risk:        { typicalLibertyRisk: 3, typicalFamilyStabilityRisk: 4 },
  level_3_liberty_threat:         { typicalLibertyRisk: 6, typicalFamilyStabilityRisk: 7 },
  level_4_family_survival_threat: { typicalLibertyRisk: 8, typicalFamilyStabilityRisk: 9 },
  level_5_crisis_catastrophic:    { typicalLibertyRisk: 10, typicalFamilyStabilityRisk: 10 },
};

// ─── Multiplier Escalation ──────────────────────────────────────────────────

/** Each active multiplier adds +0.5 to composite (capped at 10). */
export function applyMultipliers(base: number, multipliers: SeverityMultiplier[]): number {
  const escalated = base + multipliers.length * 0.5;
  return Math.min(10, Math.round(escalated * 10) / 10);
}
