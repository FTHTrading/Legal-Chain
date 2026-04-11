import type { Matter } from "@/lib/schemas/matter";

// ══════════════════════════════════════════════════════════════════════════════
// CASE 005: Alisha Prather — Distressed Single Parent, Unexpected Medical Bills
// Type: Financial Hardship / Debt Collection Defense / Property Preservation
// Status: Intake / Consultation
// ══════════════════════════════════════════════════════════════════════════════

/**
 * CASE NARRATIVE:
 * Alisha Prather is a single mother of two (ages 9 and 12) living in a rental property in Indianapolis, Indiana.
 * She has been consistently employed for 7 years in health care administration, earning ~$42,000/year.
 * In January 2025, her youngest child required emergency surgery following an accident.
 * Despite health insurance, medical bills totaled ~$18,000. Insurance covered only $12,000, leaving $6,000 in personal debt.
 * Alisha paid the medical bill in installments from her savings account (now depleted).
 * In April 2025, she experienced a period of unpaid leave (30 days) while managing her child's recovery.
 * During that period, she was unable to pay rent. She communicated with her landlord immediately.
 * Landlord agreed to defer April rent, originally due May 1.
 * May 2025: Alisha resumed work; landlord expected full May rent + deferred April amount (~$2,134 total) by June 1.
 * Alisha was able to pay only $1,500 by June 1.
 * June 2025 – Present (April 2026): Pattern of partial payments and catch-ups.
 * Current situation: Alisha is approximately $2,800 behind; landlord has filed N8 notice (persistent late payment).
 * Alisha cannot afford to catch up; income covers basic living expenses only.
 * PROBLEM: If eviction proceeds, she will be homeless with her two children.
 * OPPORTUNITY: She has been employed continuously, has steady income, and is willing to commit to modified payment plan.
 * UNYKORN's role: (A) Defend against eviction, (B) Negotiate payment plan, (C) Preserve family housing.
 */

export const SEED_CASE_005_ALISHA_PRATHER: Matter = {
  id: "case-005-uuid",
  matterId: "UNY-RES-2026-005",
  title: "Alisha Prather — Single Mother, Medical Hardship, Eviction Defense & Payment Plan Negotiation",
  type: "civil_joint_property_accounting",
  status: "intake",
  forumState: "Indiana",
  likelyCounty: "Marion",
  createdAt: "2026-04-01T10:00:00Z",
  updatedAt: "2026-04-11T14:30:00Z",

  property: {
    id: "case-005-property-alisha",
    address: "[Residential Unit — Indianapolis, IN]",
    county: "Marion",
    state: "Indiana",
    parcelId: "[Pending]",
    status: "held",
    acquisitionDate: "[Lease commenced 2023]",
    ownershipStructure: "Landlord-owned; Alisha and children as tenants",
  },

  parties: [
    {
      id: "case-005-party-alisha",
      name: "Alisha Ann Prather",
      role: "claimant",
      currentState: "Indiana",
      historicalState: "Indiana (born and raised)",
      ownershipInterest: "Leaseholder; primary household occupant",
      counsel: "UNYKORN Advocacy Legal",
      serviceStatus: "Single mother, employed, actively engaged in case",
      collectionRiskFlags: ["Recent medical hardship ($6K out-of-pocket medical debt)", "Depleted savings account", "Income covers basic expenses only"],
    },
    {
      id: "case-005-party-landlord-alisha",
      name: "Landlord [Name / Entity]",
      role: "respondent",
      currentState: "Indiana",
      historicalState: "Indiana",
      ownershipInterest: "Freehold owner / property manager",
      counsel: "Unknown; may have private counsel",
      serviceStatus: "Filed N8 notice (persistent late payment); eviction hearing scheduled [TBD]",
      collectionRiskFlags: ["N8 notice filed", "No apparent willingness to negotiate payment plan", "Standard collection posture"],
    },
  ],

  claims: [
    {
      id: "claim-005-hardship-equity",
      name: "Equitable Hardship & Good Faith Cure Availability",
      type: "implied_contract",
      strengthScore: "strong",
      limitationYears: 4,
      elements: [
        {
          elementName: "Documented external hardship (medical emergency)",
          requiredProof:
            "Accident report, hospital records, medical bills, proof insurance denial for portion of cost ($6K out-of-pocket)",
          linkedFacts: [
            "January 2025: child surgery ($18K total)",
            "Insurance covered $12K; tenant responsible for $6K",
            "Depleted savings to pay medical debt",
            "30-day unpaid leave to manage recovery",
          ],
          linkedEvidence: [],
          missingEvidence: [
            "Hospital discharge summary",
            "Medical bills + insurance EOB",
            "Proof of medical debt payment from tenant accounts",
          ],
          defenseExposure: "Must prove causation: medical hardship → inability to pay rent (not vice versa)",
          status: "alleged",
        },
        {
          elementName: "Long-term employment history & income stability",
          requiredProof: "Pay stubs, employer letter, 7+ years continuous employment in same role",
          linkedFacts: ["Employed since 2018", "Health care administrator", "Gross income ~$42K/year", "No prior defaults"],
          linkedEvidence: [],
          missingEvidence: ["Recent pay stubs (3-6 months)", "Employment verification letter", "Tax returns (2024-2025)"],
          defenseExposure: "Income must be verified and current; letter from employer strengthens claim",
          status: "alleged",
        },
        {
          elementName: "Good faith ongoing payments during hardship",
          requiredProof:
            "Payment ledger showing tenant made partial/catch-up payments from May 2025–present, demonstrating commitment and ability to resume full payments",
          linkedFacts: [
            "April 2025: $0 (medical leave)",
            "May–June 2025: $1,500 paid (partial; full was $1,067 × 2)",
            "July 2025–April 2026: sporadic payments averaging $800–$1,400/month",
            "Current arrears: ~$2,800",
          ],
          linkedEvidence: [],
          missingEvidence: ["Clean itemized payment ledger", "Tenant bank statement showing outgoing rent payments"],
          defenseExposure: "Partial payments demonstrate willingness; full default would be much weaker",
          status: "alleged",
        },
        {
          elementName: "Reasonable payment plan available to cure",
          requiredProof: "Tenant has submitted or is willing to submit written payment plan proposal: catch up arrears over 6–12 months while paying current rent",
          linkedFacts: ["Arrears ~$2,800", "Monthly income ~$3,500 gross (~$2,600 net)", "Current rent $1,067", "Proposed plan: $200/month + full current rent until caught up"],
          linkedEvidence: [],
          missingEvidence: ["Written payment plan proposal", "Tenant's sworn affidavit committing to plan"],
          defenseExposure: "Plan must be realistic and affordable; excessive burden weakens claim",
          status: "alleged",
        },
        {
          elementName: "Dependent children at risk of homelessness",
          requiredProof:
            "Evidence that eviction will render tenant and two minor children homeless; hardship on children is significant equitable factor",
          linkedFacts: ["Two children, ages 9 and 12", "No known alternative housing", "Single-parent household", "N8 eviction would render all three homeless"],
          linkedEvidence: [],
          missingEvidence: [
            "Birth certificates of children",
            "School enrollment records (confirming residency + continuity)",
            "Housing search documentation (showing difficulty finding affordable alternative)",
          ],
          defenseExposure: "Courts favor protecting children; this is significant equity lever",
          status: "alleged",
        },
      ],
      statusNote:
        "Indiana law does NOT explicitly provide a 'hardship defense' to eviction, but courts have discretion to consider hardship when deciding relief (e.g., extending payment plan opportunity). Best strategy: negotiate payment plan before hearing; if landlord refuses, argue at hearing that court should use discretion to allow cure plan.",
    },
    {
      id: "claim-005-waiver-course-dealing",
      name: "Waiver or Course of Dealing — Landlord's Prior Agreement to Defer April Rent",
      type: "implied_contract",
      strengthScore: "moderate",
      limitationYears: 4,
      elements: [
        {
          elementName: "Landlord agreed to defer April 2025 rent (verbal or written agreement)",
          requiredProof: "Email, text, or phone record showing landlord consented to delay April payment to May/June",
          linkedFacts: ["April 2025: 30-day unpaid leave; tenant requested extension", "Landlord agreed (allegedly)", "No written confirmation"],
          linkedEvidence: [],
          missingEvidence: ["Email from landlord confirming deferment agreement", "Tenant's notes from conversation", "Any lease amendment"],
          defenseExposure: "Verbal agreements are hard to prove; written confirmation essential",
          status: "alleged",
        },
        {
          elementName: "Course of dealing: tenant has made substantial catch-up payments since then",
          requiredProof: "Pattern of deferment + catch-ups shows understanding between parties that hardship is temporary",
          linkedFacts: ["May–June: tenant caught up with $1,500", "Ongoing partial/catch-up payments", "No prior eviction threats"],
          linkedEvidence: [],
          missingEvidence: ["Ledger showing payments trending upward"],
          defenseExposure: "Course of dealing argument is moderate-strength; depends on pattern",
          status: "alleged",
        },
      ],
      statusNote:
        "If landlord previously agreed to defer rent, they may be estopped from claiming strict non-payment. Argument is secondary but useful if evidence is strong.",
    },
    {
      id: "claim-005-n8-procedural-defect",
      name: "N8 Notice Procedural Defects or Improper Service",
      type: "implied_contract",
      strengthScore: "moderate",
      limitationYears: 4,
      elements: [
        {
          elementName: "N8 notice was improperly served or contains defects",
          requiredProof: "Service was irregular (not per statute), or notice contains error (wrong amount, wrong address, wrong name)",
          linkedFacts: ["N8 filed [date TBD]", "Tenant may not have received proper notice"],
          linkedEvidence: [],
          missingEvidence: ["Copy of N8 notice as served", "Proof of service documentation"],
          defenseExposure: "Procedural defects can delay/reset eviction; technical but not dispositive",
          status: "alleged",
        },
      ],
      statusNote: "Check N8 notice for defects; even minor errors can buy time or force re-service.",
    },
    {
      id: "claim-005-counterclaim-habitability",
      name: "Counterclaim (if applicable): Breach of Habitability / Maintenance Duties",
      type: "breach_of_written_contract",
      strengthScore: "weak",
      limitationYears: 4,
      elements: [
        {
          elementName: "Unit has undisclosed habitability defects (if any)",
          requiredProof: "Evidence of safety issues, pest infestation, code violations, or broken appliances",
          linkedFacts: ["Tenant reports [unknown — need inspection]"],
          linkedEvidence: [],
          missingEvidence: ["Inspection by tenant or neutral party"],
          defenseExposure: "Only valid if defects are REAL and DOCUMENTED; false claims damage credibility",
          status: "alleged",
        },
      ],
      statusNote:
        "Do NOT raise frivolous counterclaims. Only pursue if genuine habitability breach is documented. Risk: looks like retaliation if not solid.",
    },
  ],

  evidence: [
    {
      id: "case-005-ev-medical-bills",
      category: "other",
      title: "Hospital & Medical Bills (January 2025 Surgery)",
      description: "Itemized medical bills totaling ~$18,000; insurance EOB showing $12,000 covered, $6,000 tenant responsibility",
      dateOfDocument: "2025-01 to 2025-04",
      dateObtained: "2026-04-01",
      status: "alleged",
      sourceParty: "case-005-party-alisha",
      linkedClaims: ["claim-005-hardship-equity"],
    },
    {
      id: "case-005-ev-bank-statements",
      category: "other",
      title: "Alisha's Bank Statements (2025–Present)",
      description: "Personal bank account statements showing medical payments, depleted savings, and recent rent payments",
      dateOfDocument: "2025-01 to 2026-04",
      dateObtained: "2026-04-01",
      status: "alleged",
      sourceParty: "case-005-party-alisha",
      linkedClaims: ["claim-005-hardship-equity"],
    },
    {
      id: "case-005-ev-employment-letter",
      category: "other",
      title: "Employment Verification Letter",
      description: "Letter from employer confirming continuous employment since 2018, current role, gross income ~$42K/year, good standing",
      dateOfDocument: "2026-04",
      dateObtained: "2026-04-01",
      status: "alleged",
      sourceParty: "case-005-party-alisha",
      linkedClaims: ["claim-005-hardship-equity"],
    },
    {
      id: "case-005-ev-pay-stubs",
      category: "other",
      title: "Recent Pay Stubs (6 months)",
      description: "Pay stubs from October 2025 – April 2026 showing consistent income, no gaps (except unpaid leave in April 2025)",
      dateOfDocument: "2025-10 to 2026-04",
      dateObtained: "2026-04-01",
      status: "alleged",
      sourceParty: "case-005-party-alisha",
      linkedClaims: ["claim-005-hardship-equity"],
    },
    {
      id: "case-005-ev-payment-ledger",
      category: "other",
      title: "Rent Payment History Ledger (2023–Present)",
      description: "Complete record showing 2 years of on-time payments (2023–2024), then April 2025 gap (medical leave), then sporadic payments thereafter. Clean through April 2024; stress pattern visible May 2025+",
      dateOfDocument: "2023-01 to 2026-04",
      dateObtained: "2026-04-01",
      status: "alleged",
      sourceParty: "case-005-party-alisha",
      linkedClaims: ["claim-005-hardship-equity", "claim-005-waiver-course-dealing"],
    },
    {
      id: "case-005-ev-lease",
      category: "contract",
      title: "Residential Lease Agreement (Executed)",
      description: "Current lease; rent $1,067/month due 1st of month; default clause; N8 notice provision",
      dateOfDocument: "2023 (annual renewal)",
      dateObtained: "2026-04-01",
      status: "alleged",
      sourceParty: "case-005-party-alisha",
      linkedClaims: ["claim-005-hardship-equity"],
    },
    {
      id: "case-005-ev-n8-notice",
      category: "communication",
      title: "N8 Notice (Persistent Late Payment Notice)",
      description: "Copy of N8 notice served on Alisha citing pattern of late payments; N8 hearing scheduled [date TBD]",
      dateOfDocument: "[Service date TBD]",
      dateObtained: "2026-04-01",
      status: "alleged",
      sourceParty: "case-005-party-alisha",
      linkedClaims: ["claim-005-n8-procedural-defect"],
    },
    {
      id: "case-005-ev-landlord-comms",
      category: "communication",
      title: "Landlord Communications (Email/Text History)",
      description: "All communications between Alisha and landlord showing requests for help, partial payment offerings, landlord responses (or lack thereof)",
      dateOfDocument: "2025-04 to 2026-04",
      dateObtained: "2026-04-01",
      status: "alleged",
      sourceParty: "case-005-party-alisha",
      linkedClaims: ["claim-005-hardship-equity", "claim-005-waiver-course-dealing"],
    },
    {
      id: "case-005-ev-children-docs",
      category: "other",
      title: "Children's Birth Certificates & School Enrollment",
      description: "Proof that Alisha has two dependents (ages 9 & 12) currently in enrolled in school; establishes family unit and housing stability concern",
      dateOfDocument: "[Children's DOBs]",
      dateObtained: "2026-04-01",
      status: "alleged",
      sourceParty: "case-005-party-alisha",
      linkedClaims: ["claim-005-hardship-equity"],
    },
    {
      id: "case-005-ev-property-condition",
      category: "other",
      title: "Property Condition Inspection (if pursuing counterclaim)",
      description: "Photos and notes documenting any habitability issues to support counterclaim (if applicable)",
      dateOfDocument: "[Inspection date TBD]",
      dateObtained: "[TBD]",
      status: "alleged",
      sourceParty: "case-005-party-alisha",
      linkedClaims: ["claim-005-counterclaim-habitability"],
    },
    {
      id: "case-005-ev-payment-plan-proposal",
      category: "communication",
      title: "Written Payment Plan Proposal",
      description: "Alisha's signed commitment to pay $200/month toward arrears plus full $1,067 current rent until caught up, with timeline to complete in 14 months (by June 2027)",
      dateOfDocument: "2026-04-11",
      dateObtained: "2026-04-11",
      status: "alleged",
      sourceParty: "case-005-party-alisha",
      linkedClaims: ["claim-005-hardship-equity"],
    },
  ],

  ledger: [
    {
      id: "case-005-ledger-april-2025",
      amount: 0,
      date: "2025-04-01",
      payor: "Alisha",
      payee: "Landlord",
      category: "other",
      description: "April 2025 rent waived (medical hardship & unpaid leave); deferred to May/June",
      verificationStatus: "unverified",
      party: "claimant",
    },
    {
      id: "case-005-ledger-may-2025-payment",
      amount: 1500,
      date: "2025-06-01",
      payor: "Alisha",
      payee: "Landlord",
      category: "other",
      description: "May catch-up payment ($1,500 of $2,134 owed); partial but demonstrates commitment",
      verificationStatus: "unverified",
      party: "claimant",
    },
    {
      id: "case-005-ledger-ongoing-payments",
      amount: 9200,
      date: "2026-04-01",
      payor: "Alisha",
      payee: "Landlord",
      category: "other",
      description: "Payments made May 2025–April 2026 (partial and full); total ~$9,200 of $13,000 potentially owed",
      verificationStatus: "unverified",
      party: "claimant",
    },
    {
      id: "case-005-ledger-arrears",
      amount: -2800,
      date: "2026-04-01",
      payor: "Alisha",
      payee: "Landlord",
      category: "other",
      description: "Current arrears (unpaid rent + late fees): ~$2,800",
      verificationStatus: "unverified",
      party: "claimant",
    },
  ],

  deadlines: [
    {
      id: "case-005-dl-n8-hearing",
      title: "N8 Eviction Hearing (Persistent Late Payment)",
      date: "2026-05-01",
      type: "hearing",
      status: "scheduled",
    },
    {
      id: "case-005-dl-payment-plan-submission",
      title: "Submit Payment Plan Proposal to Landlord + Court (if permitted)",
      date: "2026-04-20",
      type: "custom",
      status: "pending",
    },
    {
      id: "case-005-dl-evidence-package",
      title: "Prepare Evidence Package: Medical bills, employment letter, pay stubs, payment history, children docs",
      date: "2026-04-25",
      type: "custom",
      status: "pending",
    },
  ],

  jurisdiction: {
    propertyState: "Indiana",
    propertyCounty: "Marion",
    defendantCurrentState: "Indiana",
    transactionState: "Indiana",
    titleStillActive: true,
    recommendedForum: "Indiana Circuit Court (Marion County) — Small Claims or Civil Division (depending on amount sought by landlord)",
    reasonLog: [
      "Residential tenancy in Indiana",
      "N8 notice (persistent late payment) triggers eviction procedure under Ind. Code § 32-31-1-1 et seq.",
      "Courts have discretion to consider hardship and good faith cure when deciding eviction",
      "Family status (single mother, two children) is equitable consideration",
    ],
    filingReadiness: [
      { item: "Medical bills + insurance EOB", ready: false, notes: "Document the $6K out-of-pocket hardship" },
      { item: "Employment verification", ready: false, notes: "Confirm stable income & continuous employment" },
      { item: "Pay stubs", ready: false, notes: "Show current income capacity" },
      { item: "Payment ledger", ready: false, notes: "Clean, itemized, court-ready" },
      { item: "Children's documentation", ready: false, notes: "Birth certs + school enrollment" },
      { item: "Payment plan proposal", ready: false, notes: "Written, signed, realistic" },
      { item: "Lease copy", ready: false, notes: "Standard" },
      { item: "N8 notice (original)", ready: false, notes: "Check for procedural defects" },
      { item: "Hearing presentation script", ready: false, notes: "Emotional but organized; focus on children + stability" },
    ],
  },

  recovery: {
    georgiaJudgmentPath: { status: "N/A — Indiana matter", nextSteps: [] },
    floridaDomesticationPath: { status: "N/A — Indiana matter", statute: "N/A", nextSteps: [] },
    floridaHomesteadRisk: { riskLevel: "N/A", notes: "Residential tenancy, not ownership dispute" },
    nonHomesteadTargets: [
      {
        assetType: "Eviction defense",
        description: "Defeat N8 eviction by demonstrating hardship, good faith payments, and ability/commitment to cure via payment plan",
        status: "primary_objective",
      },
      {
        assetType: "Negotiated payment plan",
        description: "Secure landlord agreement (or court order) to accept $200/month + full current rent until arrears cured (14 months total)",
        status: "secondary_objective",
      },
      {
        assetType: "Housing preservation",
        description: "Keep Alisha and her two children stably housed; avoid homelessness and disruption to children's schooling",
        status: "core_equity",
      },
    ],
    collectionReadiness: "initial_assessment_hearing_support",
  },

  damages: {
    claimantNetPosition: -2800,
    respondentNetPosition: 2800,
    verifiedSubtotal: 0,
    disputedSubtotal: 2800,
    estimatedCaseValue: 2800,
    prejudgmentInterestEligible: false,
  },
};

export const SEED_CASES_WITH_ALISHA = [SEED_CASE_005_ALISHA_PRATHER];
