import type { Matter } from "@/lib/schemas/matter";
import { SEED_CASE_006_TENANT_HABITABILITY, SEED_CASE_007_LANDLORD_RECOVERY, SEED_CASE_008_WRONGFUL_FORECLOSURE } from "./seed-cases";

// ══════════════════════════════════════════════════════════════════════════════
// DEMO CASES: Progressed versions of seed cases showing research, investigation, and filing preparation
// ══════════════════════════════════════════════════════════════════════════════

// ──────────────────────────────────────────────────────────────────────────────
// DEMO CASE 006: Tenant Habitability — Investigation Complete, Ready for Filing
// ──────────────────────────────────────────────────────────────────────────────

export const DEMO_CASE_006_TENANT_HABITABILITY_INVESTIGATION_COMPLETE: Matter = {
  ...SEED_CASE_006_TENANT_HABITABILITY,
  id: "demo-case-006-investigation",
  status: "litigation",
  updatedAt: "2026-04-11T16:30:00Z",

  // Enhanced evidence with investigation findings
  evidence: [
    {
      id: "case-006-ev-pest-complaint",
      category: "communication",
      title: "Tenant Pest Control Complaint",
      description: "Maintenance request documenting termite infestation; submitted March 15, 2026",
      dateOfDocument: "2026-03-15",
      dateObtained: "2026-04-10",
      status: "verified",
      sourceParty: "case-006-tenant",
      linkedClaims: ["claim-006-warranty-habitability"],
    },
    {
      id: "case-006-ev-pest-inspection",
      category: "other",
      title: "Professional Pest Inspection Report",
      description:
        "Licensed pest control inspector issued report (April 8, 2026) confirming active termite mud tubes inside living room and bedroom, indicative of structural infestation. Recommended immediate treatment.",
      dateOfDocument: "2026-04-08",
      dateObtained: "2026-04-08",
      status: "verified",
      sourceParty: "case-006-tenant",
      linkedClaims: ["claim-006-warranty-habitability", "claim-006-code-violation"],
    },
    {
      id: "case-006-ev-pest-photos-verified",
      category: "other",
      title: "Photographic Evidence — Termite Damage (Verified April 9)",
      description: "Digital photos with metadata timestamps showing termite mud tubes, damage to drywall, and shelter tubes. No landlord remediation evident.",
      dateOfDocument: "2026-04-08",
      dateObtained: "2026-04-09",
      status: "verified",
      sourceParty: "case-006-tenant",
      linkedClaims: ["claim-006-warranty-habitability", "claim-006-code-violation"],
    },
    {
      id: "case-006-ev-construction-timeline",
      category: "other",
      title: "Construction Timeline — 3+ Months Ongoing Without Notice",
      description:
        "Photographic and email evidence showing construction started January 2026, belongings boxed January 15, 2026, no notice given prior. As of April 10, construction still ongoing. Interruption period: 3+ months.",
      dateOfDocument: "2026-01-15 to 2026-04-10",
      dateObtained: "2026-04-10",
      status: "verified",
      sourceParty: "case-006-tenant",
      linkedClaims: ["claim-006-quiet-enjoyment", "claim-006-constructive-eviction"],
    },
    {
      id: "case-006-ev-smoke-detector-verification",
      category: "other",
      title: "Missing Smoke Detector Verification (Inspected April 9, 2026)",
      description:
        "Verification that sleeping areas (master bedroom, secondary bedroom) lack working smoke detectors. No batteries installed, covers missing. Violates Ind. Code § 22-13-2-13.",
      dateOfDocument: "2026-04-09",
      dateObtained: "2026-04-09",
      status: "verified",
      sourceParty: "case-006-tenant",
      linkedClaims: ["claim-006-code-violation", "claim-006-warranty-habitability"],
    },
    {
      id: "case-006-ev-lease-verified",
      category: "contract",
      title: "Lease Agreement — Verified Copy",
      description: "Signed residential lease showing monthly rent $1,200, landlord obligations to maintain habitability, and 30-day termination provision.",
      dateOfDocument: "2025-03-01",
      dateObtained: "2026-04-01",
      status: "verified",
      sourceParty: "case-006-tenant",
      linkedClaims: ["claim-006-warranty-habitability", "claim-006-quiet-enjoyment"],
    },
    {
      id: "case-006-ev-landlord-comms-verified",
      category: "communication",
      title: "Landlord Communication Thread — Non-Response to Complaints (Verified)",
      description:
        "Email chain showing tenant complained about pest infestation on March 17, 2026, again on March 25, 2026. Landlord acknowledged receipt March 18 but no action taken as of April 10 (24+ days of non-remediation).",
      dateOfDocument: "2026-03-17 to 2026-04-10",
      dateObtained: "2026-04-10",
      status: "verified",
      sourceParty: "case-006-tenant",
      linkedClaims: [
        "claim-006-warranty-habitability",
        "claim-006-quiet-enjoyment",
        "claim-006-constructive-eviction",
      ],
    },
    {
      id: "case-006-ev-indiana-statute",
      category: "other",
      title: "Indiana Residential Tenancies Act — Statutory Authority",
      description:
        "Ind. Code § 32-31-1-1 et seq. Habitability requirement: landlord must maintain safe, sanitary, and fit unit. § 32-31-8-1: landlord has 14 days to cure after notice. Failure to cure = constructive eviction liability.",
      dateOfDocument: "Current statute",
      dateObtained: "2026-04-10",
      status: "verified",
      sourceParty: "case-006-tenant",
      linkedClaims: ["claim-006-warranty-habitability", "claim-006-quiet-enjoyment"],
    },
  ],

  jurisdictio: {
    propertyState: "Indiana",
    propertyCounty: "Marion",
    defendantCurrentState: "Indiana",
    transactionState: "Indiana",
    titleStillActive: true,
    recommendedForum: "Indiana Circuit Court (Marion County) Small Claims Division (if < $5,000) or Civil Division (if > $5,000)",
    reasonLog: [
      "Residential tenancy in Indiana",
      "Habitability claims governed by Ind. Code § 32-31-1-1 et seq.",
      "Rent abatement and constructive eviction available",
      "Case value: ~$3,600 (4 months × $900 abated rent @ 75% loss of use)",
    ],
    filingReadiness: [
      { item: "Pest inspection report", ready: true, notes: "Professional report dated April 8, 2026" },
      { item: "Smoke detector violation documentation", ready: true, notes: "Verified April 9; photos available" },
      { item: "Construction timeline & evidence", ready: true, notes: "3+ months documented with photos" },
      { item: "Lease copy", ready: true, notes: "Verified rental agreement" },
      { item: "Communication records (non-response)", ready: true, notes: "Email chain April 8-10" },
      { item: "Statutory authority (Ind. Code § 32-31)", ready: true, notes: "Statute & case law prepared" },
      {
        item: "Hearing preparation packet",
        ready: true,
        notes: "All evidence organized; hearing script drafted",
      },
    ],
  },

  recovery: {
    georgiaJudgmentPath: { status: "N/A — Indiana matter", nextSteps: [] },
    floridaDomesticationPath: { status: "N/A — Indiana matter", statute: "N/A", nextSteps: [] },
    floridaHomesteadRisk: { riskLevel: "N/A", notes: "N/A — residential lease, not ownership dispute" },
    nonHomesteadTargets: [
      {
        assetType: "Rent abatement (4 months)",
        description: "Estimated $3,600 (75% abatement × 4 months @ $1,200 monthly)",
        status: "ready_for_court",
      },
      {
        assetType: "Early lease termination (if constructive eviction)",
        description: "Exit lease without penalty; avoid future habitability litigation",
        status: "strong_position",
      },
    ],
    collectionReadiness: "ready_for_hearing",
  },

  damages: {
    claimantNetPosition: -3600,
    respondentNetPosition: 3600,
    verifiedSubtotal: 0,
    disputedSubtotal: 3600,
    estimatedCaseValue: 3600,
    prejudgmentInterestEligible: true,
  },
};

// ──────────────────────────────────────────────────────────────────────────────
// DEMO CASE 007: Landlord Eviction — N4 Service Complete, Ready to File Unlawful Detainer
// ──────────────────────────────────────────────────────────────────────────────

export const DEMO_CASE_007_LANDLORD_EVICTION_READY_TO_FILE: Matter = {
  ...SEED_CASE_007_LANDLORD_RECOVERY,
  id: "demo-case-007-filing-prepared",
  status: "litigation",
  updatedAt: "2026-04-11T09:00:00Z",

  evidence: [
    {
      id: "case-007-ev-lease-executed",
      category: "contract",
      title: "Signed Lease Agreement",
      description:
        "Residential lease dated March 1, 2025 (annual renewal). Rent: $1,067/month, due 1st of each month. Late fee: 10% ($106.70) if paid after 5th. Eviction clause: landlord may evict for non-payment after 10-day N4 cure period.",
      dateOfDocument: "2025-03-01",
      dateObtained: "2026-04-01",
      status: "verified",
      sourceParty: "case-007-landlord-claimant",
      linkedClaims: ["claim-007-non-payment", "claim-007-eviction-notice", "claim-007-damages-rent"],
    },
    {
      id: "case-007-ev-ledger-itemized",
      category: "other",
      title: "Itemized Payment Ledger (2019–Present, Verified by Bank Records)",
      description:
        "Month-by-month ledger showing rent due, payments received, and arrears balance. Historical pattern: 2019–2023 = on-time payments. July 2024 = first payment 15 days late (job loss trigger). August 2024 – March 2026 = sporadic late payments and partial payments. April – August 2026 = zero payments. Current arrears: $9,603 unpaid rent + $480 late fees = $10,083 total.",
      dateOfDocument: "Ongoing",
      dateObtained: "2026-04-10",
      status: "verified",
      sourceParty: "case-007-landlord-claimant",
      linkedClaims: ["claim-007-non-payment", "claim-007-damages-rent"],
    },
    {
      id: "case-007-ev-bank-deposits",
      category: "other",
      title: "Bank Statement Evidence of Payment Gaps",
      description:
        "Landlord's business account statements (March 2025 – April 2026) showing clear gaps in monthly deposits. Consistent deposits March–June 2024, then gaps begin August 2024. No deposits April–August 2026.",
      dateOfDocument: "2025-03 to 2026-08",
      dateObtained: "2026-04-10",
      status: "verified",
      sourceParty: "case-007-landlord-claimant",
      linkedClaims: ["claim-007-non-payment"],
    },
    {
      id: "case-007-ev-n4-notice-served",
      category: "communication",
      title: "N4 Notice to Pay or Quit — Served April 9, 2026",
      description:
        "Official Indiana N4 notice (form per state statute) delivered to tenant (hand-delivered, front door posting, property manager present as witness). Notice demands rent payment of $10,083 (9 months + fees) within 10 days (by April 19, 2026) OR tenant must vacate premises.",
      dateOfDocument: "2026-04-09",
      dateObtained: "2026-04-09",
      status: "verified",
      sourceParty: "case-007-landlord-claimant",
      linkedClaims: ["claim-007-eviction-notice"],
    },
    {
      id: "case-007-ev-service-affidavit",
      category: "communication",
      title: "Affidavit of Service — N4 Notice",
      description:
        "Signed affidavit by property manager attesting to hand-delivery of N4 notice to tenant on April 9, 2026 at 2:15 PM. Tenant present, accepted notice, no response/promise given.",
      dateOfDocument: "2026-04-09",
      dateObtained: "2026-04-09",
      status: "verified",
      sourceParty: "case-007-landlord-claimant",
      linkedClaims: ["claim-007-eviction-notice"],
    },
    {
      id: "case-007-ev-property-condition",
      category: "other",
      title: "Property Condition Report — No Landlord Habitability Defects",
      description:
        "Property inspection confirms unit is clean, maintained, all utilities functioning, HVAC working, no code violations, no safety defects. Confirms no tenant set-off claims based on habitability.",
      dateOfDocument: "2026-04-08",
      dateObtained: "2026-04-08",
      status: "verified",
      sourceParty: "case-007-landlord-claimant",
      linkedClaims: ["claim-007-eviction-notice"],
    },
    {
      id: "case-007-ev-eviction-filing-template",
      category: "other",
      title: "Unlawful Detainer Complaint (Drafted, Ready to File)",
      description:
        "Complete complaint for unlawful detainer per Indiana Rules of Civil Procedure. Includes: lease copy as exhibit, ledger, N4 proof of service, demand for possession + judgment.",
      dateOfDocument: "2026-04-11 (drafted)",
      dateObtained: "2026-04-11",
      status: "verified",
      sourceParty: "case-007-landlord-claimant",
      linkedClaims: ["claim-007-eviction-notice"],
    },
  ],

  deadlines: [
    {
      id: "case-007-dl-n4-cure-period-expiry",
      title: "N4 Cure Period Expires (if no payment by this date, file complaint)",
      date: "2026-04-19",
      type: "custom",
      status: "active",
    },
    {
      id: "case-007-dl-eviction-filing",
      title: "FILE Unlawful Detainer Complaint in Marion County Circuit Court",
      date: "2026-04-20",
      type: "filing",
      status: "pending",
    },
    {
      id: "case-007-dl-hearing",
      title: "Eviction Hearing (court will set within 20 days of filing)",
      date: "2026-05-10",
      type: "hearing",
      status: "estimated",
    },
  ],

  jurisdiction: {
    propertyState: "Indiana",
    propertyCounty: "Marion",
    defendantCurrentState: "Indiana",
    transactionState: "Indiana",
    titleStillActive: true,
    recommendedForum: "Indiana Circuit Court (Marion County) — Eviction Docket",
    reasonLog: [
      "N4 properly served April 9, 2026",
      "Cure period 10 days (expires April 19, 2026)",
      "File complaint immediately after expiration if no payment",
      "Eviction hearing typically scheduled for 14-21 days after filing",
    ],
    filingReadiness: [
      { item: "Signed lease", ready: true, notes: "Verified copy on file" },
      { item: "Payment ledger", ready: true, notes: "Itemized and verified by bank records" },
      { item: "N4 notice", ready: true, notes: "Properly served April 9, 2026" },
      { item: "Service affidavit", ready: true, notes: "Signed by property manager" },
      { item: "Unlawful detainer complaint", ready: true, notes: "Drafted and ready to file" },
      { item: "Filing fee payment", ready: true, notes: "$125-200 budget allocated" },
      { item: "Hearing presentation packet", ready: true, notes: "Ledger, lease, service proof, photos of property condition" },
    ],
  },

  recovery: {
    georgiaJudgmentPath: { status: "N/A — Indiana matter", nextSteps: [] },
    floridaDomesticationPath: { status: "N/A — Indiana matter", statute: "N/A", nextSteps: [] },
    floridaHomesteadRisk: { riskLevel: "N/A", notes: "Eviction, not judgment collection" },
    nonHomesteadTargets: [
      {
        assetType: "Possession judgment",
        description: "Court order requiring tenant to vacate within 10 days of judgment",
        status: "ready_to_file",
      },
      {
        assetType: "Monetary judgment",
        description: "Judgment for $10,083 (9 months rent + late fees + court costs)",
        status: "ready_to_file",
      },
      {
        assetType: "Writ of possession",
        description: "Sheriff execution of judgment; lockout and property restoration",
        status: "post_judgment",
      },
    ],
    collectionReadiness: "ready_to_file_complaint",
  },

  damages: {
    claimantNetPosition: 10083,
    respondentNetPosition: -10083,
    verifiedSubtotal: 10083,
    disputedSubtotal: 0,
    estimatedCaseValue: 10083,
    prejudgmentInterestEligible: true,
  },
};

// ──────────────────────────────────────────────────────────────────────────────
// DEMO CASE 008: Wrongful Foreclosure — Emergency TRO Filed, Title Search Complete
// ──────────────────────────────────────────────────────────────────────────────

export const DEMO_CASE_008_WRONGFUL_FORECLOSURE_TRO_FILED: Matter = {
  ...SEED_CASE_008_WRONGFUL_FORECLOSURE,
  id: "demo-case-008-tro-active",
  status: "litigation",
  updatedAt: "2026-04-11T14:00:00Z",

  evidence: [
    {
      id: "case-008-ev-death-cert-verified",
      category: "other",
      title: "Death Certificate — Verified Copy",
      description: "Certified death certificate showing original borrower deceased March 15, 2022 (4+ years ago). Property is estate asset.",
      dateOfDocument: "2022-03-15",
      dateObtained: "2026-04-10",
      status: "verified",
      sourceParty: "case-008-occupant",
      linkedClaims: [
        "claim-008-defective-foreclosure",
        "claim-008-due-process-failure",
        "claim-008-quiet-title",
      ],
    },
    {
      id: "case-008-ev-title-report-no-lien",
      category: "other",
      title: "Title Report — NO LIEN ON RECORD (Verified by County Recorder)",
      description:
        "Full title search from county recorder showing chain of title back to original borrower. NO mortgage lien, NO foreclosure notice, NO trustee sale documented. Property appears to show free and clear title in deceased's name (or estate).",
      dateOfDocument: "2026-04-10",
      dateObtained: "2026-04-10",
      status: "verified",
      sourceParty: "case-008-occupant",
      linkedClaims: ["claim-008-defective-foreclosure", "claim-008-quiet-title"],
    },
    {
      id: "case-008-ev-no-foreclosure-filing",
      category: "other",
      title: "Court Records Search — NO FORECLOSURE CASE FILED",
      description:
        "Search of circuit/probate court records in property jurisdiction shows zero foreclosure filings against property or deceased borrower's name. No case number. No judgment. No lien lis pendens.",
      dateOfDocument: "2026-04-10",
      dateObtained: "2026-04-10",
      status: "verified",
      sourceParty: "case-008-occupant",
      linkedClaims: ["claim-008-defective-foreclosure", "claim-008-due-process-failure"],
    },
    {
      id: "case-008-ev-police-report-verified",
      category: "other",
      title: "Police Incident Report — Buyer's Trespass Attempt (Verified)",
      description:
        "Police report from April 8, 2026 documenting buyer attempting to enter property, occupants' resistance, police response. Buyer claimed ownership but had no documentation to present to officers. Police did not remove occupants; incident terminated.",
      dateOfDocument: "2026-04-08",
      dateObtained: "2026-04-08",
      status: "verified",
      sourceParty: "case-008-occupant",
      linkedClaims: ["claim-008-trespass-wrongful-eviction"],
    },
    {
      id: "case-008-ev-occupant-residency",
      category: "communication",
      title: "Affidavit of Occupant Residency & Family Connection",
      description:
        "Sworn affidavit from occupants stating: (1) continuous residency since 2010 (16 years), (2) relationship to deceased (children of original borrower), (3) no notice of foreclosure, (4) no eviction papers, (5) daily occupation and use of property.",
      dateOfDocument: "2026-04-10",
      dateObtained: "2026-04-10",
      status: "verified",
      sourceParty: "case-008-occupant",
      linkedClaims: [
        "claim-008-defective-foreclosure",
        "claim-008-due-process-failure",
        "claim-008-quiet-title",
      ],
    },
    {
      id: "case-008-ev-emergency-tro",
      category: "other",
      title: "Temporary Restraining Order (TRO) — GRANTED April 10, 2026",
      description:
        "Emergency TRO filed and granted by Circuit Judge forbidding buyer from further trespass, entry, or eviction attempts for 14 days pending hearing on Preliminary Injunction. Gives occupants breathing room for full quiet title action.",
      dateOfDocument: "2026-04-10",
      dateObtained: "2026-04-10",
      status: "verified",
      sourceParty: "case-008-occupant",
      linkedClaims: [
        "claim-008-defective-foreclosure",
        "claim-008-due-process-failure",
        "claim-008-trespass-wrongful-eviction",
      ],
    },
  ],

  deadlines: [
    {
      id: "case-008-dl-tro-expiry",
      title: "TRO Expires (if no PI granted) / PI Hearing Scheduled",
      date: "2026-04-24",
      type: "hearing",
      status: "active",
    },
    {
      id: "case-008-dl-quiet-title-filing",
      title: "Quiet Title Action — Full Complaint Filed (if not filed yet)",
      date: "2026-04-15",
      type: "filing",
      status: "pending",
    },
    {
      id: "case-008-dl-discovery",
      title: "Discovery — Demand Buyer for Proof of Title",
      date: "2026-05-01",
      type: "custom",
      status: "pending",
    },
  ],

  jurisdiction: {
    propertyState: "[Jurisdiction confirmed via title report — [FL/GA/Other]]",
    propertyCounty: "[County confirmed via title report]",
    defendantCurrentState: "[Unknown — not relevant to title action]",
    transactionState: "[Property jurisdiction]",
    titleStillActive: true,
    recommendedForum:
      "Circuit Court of [Property Jurisdiction] — Real Property Division. TRO issued; Preliminary Injunction hearing scheduled.",
    reasonLog: [
      "No valid foreclosure lien found",
      "No court foreclosure case filed",
      "Due process violation (no notice to occupants/estate)",
      "Title defect = quiet title jurisdiction",
      "Emergency relief (TRO) obtained to prevent wrongful eviction",
    ],
    filingReadiness: [
      { item: "Title report (no lien)", ready: true, notes: "Verified by county record search" },
      { item: "Court records search (no case)", ready: true, notes: "Verified no foreclosure filing" },
      { item: "TRO order (granted)", ready: true, notes: "In effect for 14 days" },
      { item: "Occupant affidavits", ready: true, notes: "Sworn statements of residency & heirship" },
      { item: "Police report", ready: true, notes: "Evidence of buyer's trespass attempt" },
      { item: "Quiet title complaint", ready: true, notes: "Ready to file or filed" },
      {
        item: "Preliminary Injunction briefing",
        ready: true,
        notes: "Legal memorandum arguing likelihood of success on merits",
      },
    ],
  },

  recovery: {
    georgiaJudgmentPath: {
      status: "[If Georgia] Quiet title action under O.C.G.A. § 29-3-1 et seq. TRO active.",
      nextSteps: [
        "File quiet title complaint by April 15, 2026",
        "Seek Preliminary Injunction at TRO hearing (April 24)",
        "Serve buyer with complaint & discovery demands",
        "Motion practice on title issues",
      ],
    },
    floridaDomesticationPath: {
      status: "[If Florida] Quiet title action under Fla. Stat. § 65.021. TRO active.",
      statute: "Fla. Stat. § 65.021 and Fla. Rule Civ. P. 1.500",
      nextSteps: [
        "File quiet title complaint by April 15, 2026",
        "Seek Preliminary Injunction at TRO hearing (April 24)",
        "Serve buyer with complaint & discovery demands",
        "Summary judgment motion on title defect",
      ],
    },
    floridaHomesteadRisk: {
      riskLevel: "ZERO — occupant with valid estate interest cannot be ousted by trespasser",
      notes: "Buyer has no valid title; homestead statute does not apply to invalid foreclosure claims",
    },
    nonHomesteadTargets: [
      {
        assetType: "Preliminary Injunction (TRO extension)",
        description: "Court order making TRO permanent pending trial; buyer forbidden from any property access",
        status: "hearing_scheduled_april_24",
      },
      {
        assetType: "Quiet Title Judgment",
        description: "Final court order declaring occupants (or estate) own property free of any claim by buyer",
        status: "complaint_ready_to_file",
      },
      {
        assetType: "Damages for trespass/wrongful eviction",
        description: "If buyer caused any harm via unlawful entry/threats, damages recoverable",
        status: "secondary_claim",
      },
    ],
    collectionReadiness: "tro_active_full_litigation_underway",
  },

  damages: {
    claimantNetPosition: 500000,
    respondentNetPosition: -500000,
    verifiedSubtotal: 0,
    disputedSubtotal: 500000,
    estimatedCaseValue: 500000,
    prejudgmentInterestEligible: true,
  },
};

export const DEMO_CASES = [
  DEMO_CASE_006_TENANT_HABITABILITY_INVESTIGATION_COMPLETE,
  DEMO_CASE_007_LANDLORD_EVICTION_READY_TO_FILE,
  DEMO_CASE_008_WRONGFUL_FORECLOSURE_TRO_FILED,
];
