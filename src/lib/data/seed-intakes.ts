import type { Intake } from "@/lib/schemas/intake";

// ══════════════════════════════════════════════════════════════════════════════
// INTAKE 001: Tenant Habitability Complaint (Case 006)
// ══════════════════════════════════════════════════════════════════════════════

export const SEED_INTAKE_001_TENANT_HABITABILITY: Intake = {
  id: "intake-001-uuid",
  source: "web_form",
  status: "initial_review",

  // Contact info
  contactName: "Sarah Johnson",
  contactEmail: "sarah.johnson@email.com",
  contactPhone: "+1-317-555-0142",
  contactAddress: "[Indianapolis, IN]",

  // Case basics
  matterType: "civil_property",
  jurisdiction: "Indiana",
  briefDescription:
    "Tenant in Indianapolis rental unit experiencing active termite infestation inside apartment, ongoing construction with belongings boxed and displaced, missing smoke detectors, and landlord non-responsive to complaints. Seeking rent abatement and/or early lease termination.",
  urgency: "elevated",

  // Adverse parties
  adverseParties: [
    {
      name: "Landlord [Name]",
      role: "Property Owner",
      knownAddress: "[Property address]",
      knownCounsel: "None identified",
    },
  ],

  // Financial
  estimatedValue: 3600,
  retainerRequired: 500,
  feeStructure: "contingency",

  // Documents submitted
  submittedDocuments: [
    {
      filename: "pest-infestation-photos.zip",
      description: "Photos of termite mud tubes and damage inside unit",
      uploadedAt: "2026-04-10T14:32:00Z",
    },
    {
      filename: "maintenance-request-screenshots.pdf",
      description: "Screenshots of maintenance requests submitted to landlord",
      uploadedAt: "2026-04-10T14:35:00Z",
    },
    {
      filename: "lease-agreement.pdf",
      description: "Copy of current lease",
      uploadedAt: "2026-04-10T14:38:00Z",
    },
  ],

  // Timestamps
  createdAt: "2026-04-10T14:45:00Z",
  updatedAt: "2026-04-10T14:45:00Z",
  createdBy: "intake-system-uuid",
  createdByName: "UNYKORN AI Intake System",
};

// ══════════════════════════════════════════════════════════════════════════════
// INTAKE 002: Landlord Eviction & Non-Payment Recovery (Case 007)
// ══════════════════════════════════════════════════════════════════════════════

export const SEED_INTAKE_002_LANDLORD_EVICTION: Intake = {
  id: "intake-002-uuid",
  source: "phone",
  status: "initial_review",

  // Contact info
  contactName: "Michael Chen",
  contactEmail: "m.chen@propertymanagement.com",
  contactPhone: "+1-317-555-0156",
  contactAddress: "[Indianapolis, IN]",

  // Case basics
  matterType: "civil_property",
  jurisdiction: "Indiana",
  briefDescription:
    "Landlord seeking eviction and rent recovery against long-term tenant. Tenant initially paid reliably from 2019-2024, then experienced job loss. Pattern of late payments and partial catch-ups from late 2024 through early 2026. Tenant has now completely stopped all rent payments for 9+ months. Estimated arrears: ~$9,600 plus late fees. Landlord seeking possession and full judgment.",
  urgency: "elevated",

  // Adverse parties
  adverseParties: [
    {
      name: "Tenant [Name]",
      role: "Occupant",
      knownAddress: "[Property address]",
      knownCounsel: "Unknown",
    },
  ],

  // Financial
  estimatedValue: 10500,
  retainerRequired: 750,
  feeStructure: "hourly",

  // Documents submitted
  submittedDocuments: [
    {
      filename: "lease-agreement.pdf",
      description: "Signed residential lease with rent and default clauses",
      uploadedAt: "2026-04-10T09:15:00Z",
    },
    {
      filename: "payment-history-ledger.xlsx",
      description: "Complete payment history from 2019-present showing rent due, payments received, and arrears balance",
      uploadedAt: "2026-04-10T09:18:00Z",
    },
    {
      filename: "bank-statements-2024-2026.pdf",
      description: "Landlord bank statements showing rent deposits and pattern of non-payment",
      uploadedAt: "2026-04-10T09:22:00Z",
    },
    {
      filename: "communication-log.pdf",
      description: "Email and text messages documenting attempts to collect rent from tenant",
      uploadedAt: "2026-04-10T09:25:00Z",
    },
  ],

  // Timestamps
  createdAt: "2026-04-10T09:30:00Z",
  updatedAt: "2026-04-10T09:30:00Z",
  createdBy: "intake-system-uuid",
  createdByName: "UNYKORN AI Intake System",
};

// ══════════════════════════════════════════════════════════════════════════════
// INTAKE 003: Wrongful Foreclosure & Title Defense (Case 008)
// ══════════════════════════════════════════════════════════════════════════════

export const SEED_INTAKE_003_WRONGFUL_FORECLOSURE: Intake = {
  id: "intake-003-uuid",
  source: "walk_in",
  status: "screening",

  // Contact info
  contactName: "James & Patricia Rodriguez",
  contactEmail: "j.rodriguez.family@email.com",
  contactPhone: "+1-407-555-0189",
  contactAddress: "[Property address — jurisdiction TBD]",

  // Case basics
  matterType: "civil_property",
  jurisdiction: "[Unknown — need property location to determine]",
  briefDescription:
    "Occupants (likely heirs of deceased property owner) currently residing in family home. Unknown third party claiming to have foreclosed and purchased property at auction, now attempting to evict occupants. Occupants received NO notice of foreclosure, no eviction papers, no court documents. Deceased owner's mortgage allegedly paid off years ago. Third-party buyer has provided NO recorded deed, no foreclosure judgment, no proof of title. Occupants in possession; police called when buyer attempted to access property. Seeking to stay eviction and establish clear title in occupants/estate.",
  urgency: "emergency",

  // Adverse parties
  adverseParties: [
    {
      name: "Alleged Buyer / Foreclosure Claimant",
      role: "Unknown",
      knownAddress: "Unknown",
      knownCounsel: "Unknown",
    },
  ],

  // Financial
  estimatedValue: 500000,
  retainerRequired: 2500,
  feeStructure: "contingency",

  // Documents submitted
  submittedDocuments: [
    {
      filename: "police-incident-report.pdf",
      description: "Police report from incident where buyer attempted to enter/remove occupants",
      uploadedAt: "2026-04-10T16:42:00Z",
    },
    {
      filename: "occupant-statement.pdf",
      description: "Written statement from occupants describing lack of notice, history of residency, and family connection to deceased",
      uploadedAt: "2026-04-10T16:45:00Z",
    },
    {
      filename: "death-certificate.pdf",
      description: "Death certificate of original property owner",
      uploadedAt: "2026-04-10T16:48:00Z",
    },
  ],

  // Conflict check
  conflictCheck: {
    id: "cc-intake-003",
    checkedAt: "2026-04-10T16:50:00Z",
    checkedBy: "legal-staff-uuid",
    checkedByName: "UNYKORN Legal Screening",
    result: "clear",
    conflictingMatterIds: [],
    conflictingPartyNames: [],
    notes: "No known conflicts. Deceased borrower creates no conflict. Buyer identity unclear but no current clients involved.",
    waived: false,
  },

  // Timestamps
  createdAt: "2026-04-10T16:55:00Z",
  updatedAt: "2026-04-10T16:55:00Z",
  createdBy: "intake-system-uuid",
  createdByName: "UNYKORN AI Intake System",
};

// ══════════════════════════════════════════════════════════════════════════════
// DEMO CASES: Same as above but with MORE fields populated to show "in-progress" state
// ══════════════════════════════════════════════════════════════════════════════

export const DEMO_INTAKE_001_TENANT_HABITABILITY_PROGRESSED: Intake = {
  ...SEED_INTAKE_001_TENANT_HABITABILITY,
  id: "demo-intake-001-full",
  status: "initial_review",
  conflictCheck: {
    id: "cc-demo-01",
    checkedAt: "2026-04-10T15:00:00Z",
    checkedBy: "legal-staff-uuid",
    checkedByName: "UNYKORN Legal Screening",
    result: "clear",
    conflictingMatterIds: [],
    conflictingPartyNames: [],
    notes: "No conflicts. Tenant is pro bono eligible. Habitability claims are strong — Indiana law favors tenants.",
    waived: false,
  },
  assignedTo: "agent-research-002-uuid",
  assignedToName: "Research Agent (Habitability)",
  createdAt: "2026-04-08T10:00:00Z",
  updatedAt: "2026-04-10T15:15:00Z",
  screenedAt: "2026-04-10T15:10:00Z",
};

export const DEMO_INTAKE_002_LANDLORD_EVICTION_PROGRESSED: Intake = {
  ...SEED_INTAKE_002_LANDLORD_EVICTION,
  id: "demo-intake-002-full",
  status: "consultation_scheduled",
  conflictCheck: {
    id: "cc-demo-02",
    checkedAt: "2026-04-10T10:00:00Z",
    checkedBy: "legal-staff-uuid",
    checkedByName: "UNYKORN Legal Screening",
    result: "clear",
    conflictingMatterIds: [],
    conflictingPartyNames: [],
    notes: "No conflicts. Landlord is commercial client. Strong eviction case — clear non-payment, good documentation.",
    waived: false,
  },
  assignedTo: "agent-eviction-001-uuid",
  assignedToName: "Execution Agent (Eviction Specialist)",
  createdAt: "2026-04-05T13:30:00Z",
  updatedAt: "2026-04-10T10:15:00Z",
  screenedAt: "2026-04-10T10:05:00Z",
};

export const DEMO_INTAKE_003_WRONGFUL_FORECLOSURE_PROGRESSED: Intake = {
  ...SEED_INTAKE_003_WRONGFUL_FORECLOSURE,
  id: "demo-intake-003-full",
  status: "accepted",
  conflictCheck: {
    id: "cc-demo-03",
    checkedAt: "2026-04-10T17:00:00Z",
    checkedBy: "legal-staff-uuid",
    checkedByName: "UNYKORN Legal Screening",
    result: "clear",
    conflictingMatterIds: [],
    conflictingPartyNames: [],
    notes: "EMERGENCY — No conflicts. Wrongful foreclosure + title defect cases are high-value. Occupants need immediate injunction to prevent eviction.",
    waived: false,
  },
  assignedTo: "agent-emergency-001-uuid",
  assignedToName: "Emergency Litigation Agent",
  matterId: "case-008-uuid",
  createdAt: "2026-04-10T16:55:00Z",
  updatedAt: "2026-04-10T17:30:00Z",
  screenedAt: "2026-04-10T17:05:00Z",
  acceptedAt: "2026-04-10T17:25:00Z",
};

export const SEED_INTAKES = [SEED_INTAKE_001_TENANT_HABITABILITY, SEED_INTAKE_002_LANDLORD_EVICTION, SEED_INTAKE_003_WRONGFUL_FORECLOSURE];

export const DEMO_INTAKES = [
  DEMO_INTAKE_001_TENANT_HABITABILITY_PROGRESSED,
  DEMO_INTAKE_002_LANDLORD_EVICTION_PROGRESSED,
  DEMO_INTAKE_003_WRONGFUL_FORECLOSURE_PROGRESSED,
];
