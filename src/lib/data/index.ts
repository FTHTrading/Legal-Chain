// ══════════════════════════════════════════════════════════════════════════════
// Seed Data Index — All Cases, Intakes, and Demo Matter Templates
// Centralized export for integration into UNYKORN Legal-Chain platform
// ══════════════════════════════════════════════════════════════════════════════

export { SEED_MATTER_CREAMER } from "./seed";
export { SEED_FORENSIC_CRYPTO_NTI_2026_001 } from "./seed-platform";

// New seed cases (Cases 006, 007, 008)
export { SEED_CASE_006_TENANT_HABITABILITY, SEED_CASE_007_LANDLORD_RECOVERY, SEED_CASE_008_WRONGFUL_FORECLOSURE, SEED_CASES } from "./seed-cases";

// Case 005 (Alisha Prather - Hardship Defense)
export { SEED_CASE_005_ALISHA_PRATHER, SEED_CASES_WITH_ALISHA } from "./case-005-alisha-prather";

// Delcampo Appeal (Case with full fact pattern)
export { CASE_OVERVIEW, CASE_ACTORS, FACTS_TIMELINE, DEFENSE_CLAIMS, APPELLANT_ARGUMENTS, PROSECUTION_STRATEGY, EVIDENCE_LEDGER, LEGAL_RESEARCH } from "./delcampo-case";

// Seed intakes (new cases 006, 007, 008 + demo versions showing progression)
export { SEED_INTAKE_001_TENANT_HABITABILITY, SEED_INTAKE_002_LANDLORD_EVICTION, SEED_INTAKE_003_WRONGFUL_FORECLOSURE, SEED_INTAKES, DEMO_INTAKE_001_TENANT_HABITABILITY_PROGRESSED, DEMO_INTAKE_002_LANDLORD_EVICTION_PROGRESSED, DEMO_INTAKE_003_WRONGFUL_FORECLOSURE_PROGRESSED, DEMO_INTAKES } from "./seed-intakes";

// Demo cases (progressed versions showing investigation/litigation stages)
export { DEMO_CASE_006_TENANT_HABITABILITY_INVESTIGATION_COMPLETE, DEMO_CASE_007_LANDLORD_EVICTION_READY_TO_FILE, DEMO_CASE_008_WRONGFUL_FORECLOSURE_TRO_FILED, DEMO_CASES } from "./seed-demo-cases";

// ── Aggregate exports for convenience ──

import type { Matter } from "@/lib/schemas/matter";
import type { Intake } from "@/lib/schemas/intake";

// ── Imports for aggregate arrays ──

import { SEED_CASE_005_ALISHA_PRATHER, SEED_CASES } from "./case-005-alisha-prather";
import { SEED_CASE_006_TENANT_HABITABILITY, SEED_CASE_007_LANDLORD_RECOVERY, SEED_CASE_008_WRONGFUL_FORECLOSURE } from "./seed-cases";
import { SEED_INTAKE_001_TENANT_HABITABILITY, SEED_INTAKE_002_LANDLORD_EVICTION, SEED_INTAKE_003_WRONGFUL_FORECLOSURE, DEMO_INTAKE_001_TENANT_HABITABILITY_PROGRESSED, DEMO_INTAKE_002_LANDLORD_EVICTION_PROGRESSED, DEMO_INTAKE_003_WRONGFUL_FORECLOSURE_PROGRESSED } from "./seed-intakes";
import { DEMO_CASE_006_TENANT_HABITABILITY_INVESTIGATION_COMPLETE, DEMO_CASE_007_LANDLORD_EVICTION_READY_TO_FILE, DEMO_CASE_008_WRONGFUL_FORECLOSURE_TRO_FILED, DEMO_CASES } from "./seed-demo-cases";

/**
 * All seed cases in one place
 * Includes: 005 (Alisha Prather hardship), 006 (tenant habitability), 007 (landlord recovery), 008 (wrongful foreclosure)
 * Usage: Import individual cases by name, or use ALL_SEED_CASES for UI templates, training data
 */
export const ALL_SEED_CASES: Matter[] = [
  SEED_CASE_005_ALISHA_PRATHER,
  SEED_CASE_006_TENANT_HABITABILITY,
  SEED_CASE_007_LANDLORD_RECOVERY,
  SEED_CASE_008_WRONGFUL_FORECLOSURE,
];

/**
 * All intake forms (seed)
 * Shows initial client submission data: 001 (tenant), 002 (landlord), 003 (foreclosure occupant)
 * Usage: Use as templates for intake form validation, data structure reference, onboarding examples
 */
export const ALL_SEED_INTAKES: Intake[] = [
  SEED_INTAKE_001_TENANT_HABITABILITY,
  SEED_INTAKE_002_LANDLORD_EVICTION,
  SEED_INTAKE_003_WRONGFUL_FORECLOSURE,
];

/**
 * Demo intakes showing progression
 * Each intake progresses from initial submission → screening complete → assigned to agent
 * Usage: Show intake workflow in UI, demo case progression, agent assignment examples
 */
export const ALL_DEMO_INTAKES: Intake[] = [
  DEMO_INTAKE_001_TENANT_HABITABILITY_PROGRESSED,
  DEMO_INTAKE_002_LANDLORD_EVICTION_PROGRESSED,
  DEMO_INTAKE_003_WRONGFUL_FORECLOSURE_PROGRESSED,
];

/**
 * Demo cases showing full litigation lifecycle
 * Each case progresses from investigation → filing → hearing preparation
 * 006: Investigation complete (evidence verified), 007: Filing prep (N4 served), 008: Emergency TRO filed
 * Usage: Training dataset for AI agents, UI demo workflows, filing readiness checklists
 */
export const ALL_DEMO_CASES: Matter[] = [
  DEMO_CASE_006_TENANT_HABITABILITY_INVESTIGATION_COMPLETE,
  DEMO_CASE_007_LANDLORD_EVICTION_READY_TO_FILE,
  DEMO_CASE_008_WRONGFUL_FORECLOSURE_TRO_FILED,
];
