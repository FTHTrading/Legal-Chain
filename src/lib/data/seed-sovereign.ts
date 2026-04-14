// ══════════════════════════════════════════════════════════════════════════════
// Sovereign & International Jurisdiction Seed Data
// Covers: ICC, LCIA, UNCITRAL, ICSID + multi-regime compliance overlays
// FATF · MiCA · MAS PSA · ADGM FSRA · BIT / Vienna Convention
// ══════════════════════════════════════════════════════════════════════════════

import type { Namespace } from "@/lib/schemas/namespace";

// ── 1. Gulf Sovereign Fund — ICC Arbitration / ADGM (ICC-2026-GULF-001) ──

export const SEED_NAMESPACE_GULF_ICC: Namespace = {
  slug: "gulf-sovereign",
  matterId: "f1a2b3c4-d5e6-7890-abcd-111111111001",
  title: "ICC-2026-GULF-001",
  subtitle: "Gulf Sovereign Fund — Digital Asset Recovery",
  status: "active",
  createdAt: "2026-02-01T00:00:00Z",
  updatedAt: "2026-04-10T00:00:00Z",
  caseType: "sovereign_arbitration",
  jurisdiction: "ICC International Court of Arbitration / ADGM (Abu Dhabi Global Market)",
  statusSummary:
    "Active ICC arbitration — Abu Dhabi sovereign wealth vehicle recovering $2.4B in misappropriated digital assets from offshore exchange operator. Preliminary hearing completed. Asset-freeze applications lodged in ADGM, DIFC, and BVI simultaneously.",
  nextAction: "File ICC Memorial on Merits — due 2026-05-30",
  access: [
    {
      userId: "00000000-0000-0000-0000-000000000001",
      role: "counsel",
      grantedBy: "00000000-0000-0000-0000-000000000001",
      grantedAt: "2026-02-01T00:00:00Z",
      permissions: [
        "view_overview",
        "view_timeline",
        "view_documents",
        "view_evidence",
        "view_status",
        "view_milestones",
        "view_financials",
        "view_strategy",
        "view_privileged",
      ],
    },
    {
      userId: "client-gulf-swf-001",
      role: "client",
      grantedBy: "00000000-0000-0000-0000-000000000001",
      grantedAt: "2026-02-01T00:00:00Z",
      permissions: ["view_overview", "view_timeline", "view_status", "view_milestones", "send_messages"],
    },
  ],
  milestones: [
    {
      id: "ms-gulf-intake",
      title: "Sovereign Client Onboarding & KYC/AML Verification",
      status: "completed",
      completedAt: "2026-02-03T00:00:00Z",
      visibleToClient: true,
    },
    {
      id: "ms-gulf-icc-request",
      title: "ICC Request for Arbitration Filed",
      status: "completed",
      completedAt: "2026-02-15T00:00:00Z",
      visibleToClient: true,
    },
    {
      id: "ms-gulf-freeze",
      title: "Emergency Asset Freeze — ADGM Courts",
      status: "completed",
      completedAt: "2026-03-01T00:00:00Z",
      visibleToClient: true,
    },
    {
      id: "ms-gulf-freeze-bvi",
      title: "Mareva Injunction — BVI Commercial Court",
      status: "completed",
      completedAt: "2026-03-20T00:00:00Z",
      visibleToClient: true,
    },
    {
      id: "ms-gulf-forensics",
      title: "Blockchain Forensics — On-Chain Asset Tracing ($2.4B)",
      status: "in_progress",
      visibleToClient: true,
    },
    {
      id: "ms-gulf-memorial",
      title: "Memorial on Merits — ICC Submission",
      status: "pending",
      targetDate: "2026-05-30",
      visibleToClient: true,
    },
    {
      id: "ms-gulf-hearing",
      title: "ICC Arbitral Hearing on Merits",
      status: "pending",
      targetDate: "2026-10-01",
      visibleToClient: true,
    },
    {
      id: "ms-gulf-award",
      title: "ICC Final Award — Enforcement Phase",
      status: "pending",
      visibleToClient: true,
    },
  ],
  messages: [
    {
      id: "msg-gulf-001",
      namespaceSlug: "gulf-sovereign",
      fromUserId: "00000000-0000-0000-0000-000000000001",
      fromName: "Senior Arbitration Counsel",
      subject: "Case Status — ICC-2026-GULF-001",
      body:
        "Client,\n\nICCStatus Update — ICC-2026-GULF-001:\n\n✅ ICC Request for Arbitration accepted and registered\n✅ Emergency asset freeze granted by ADGM Court of First Instance\n✅ BVI Mareva injunction obtained over offshore accounts (~$340M secured)\n🔄 Blockchain forensic tracing ongoing — 47 wallets identified across BTC, ETH, TRON networks\n⏳ Memorial on Merits due 30 May 2026\n\nCompliance Frameworks Engaged:\n• FATF Recommendation 15 (VASP AML obligations)\n• ADGM FSRA MKT Rules 2015 (market manipulation)\n• UAE Federal Decree-Law No. 20 of 2018 (AML/CFT)\n• UNCITRAL Model Law on International Commercial Arbitration\n\nAssets under freeze: ~$340M (BVI); pending ADGM enforcement on further $420M.\n\n— Senior Arbitration Counsel",
      attachments: [],
      sentAt: "2026-04-10T09:00:00Z",
      privileged: true,
    },
  ],
  packets: [
    {
      id: "pkt-gulf-001",
      namespaceSlug: "gulf-sovereign",
      title: "ICC Case Package — Request for Arbitration",
      description: "Registered ICC Request, asset-freeze orders (ADGM + BVI), and forensic tracing summary",
      packetType: "case_summary",
      files: [
        {
          filename: "ICC-2026-GULF-001_Request_for_Arbitration.pdf",
          mimeType: "application/pdf",
          sizeBytes: 820000,
          hash: "a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0aa01",
        },
        {
          filename: "ADGM_Asset_Freeze_Order_2026-03-01.pdf",
          mimeType: "application/pdf",
          sizeBytes: 340000,
          hash: "b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0aa02",
        },
        {
          filename: "BVI_Mareva_Injunction_2026-03-20.pdf",
          mimeType: "application/pdf",
          sizeBytes: 290000,
          hash: "c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0aa03",
        },
        {
          filename: "Blockchain_Forensics_Interim_Report.pdf",
          mimeType: "application/pdf",
          sizeBytes: 1200000,
          hash: "d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0aa04",
        },
      ],
      generatedAt: "2026-04-01T10:00:00Z",
      generatedBy: "00000000-0000-0000-0000-000000000001",
      redactionLevel: "client_safe",
    },
  ],
};

// ── 2. EU Institutional Fund — LCIA / MiCA Regulatory Defense (LCIA-2026-EU-001) ──

export const SEED_NAMESPACE_EU_LCIA: Namespace = {
  slug: "eu-mica",
  matterId: "f1a2b3c4-d5e6-7890-abcd-222222222002",
  title: "LCIA-2026-EU-001",
  subtitle: "EU Institutional Fund — MiCA Regulatory Defense",
  status: "active",
  createdAt: "2026-01-15T00:00:00Z",
  updatedAt: "2026-04-10T00:00:00Z",
  caseType: "regulatory_enforcement_defense",
  jurisdiction: "LCIA Arbitration / England & Wales (governing law) / EU Multi-State Enforcement",
  statusSummary:
    "Active multi-jurisdictional regulatory defense — €890M European institutional asset manager responding to coordinated ESMA and national-competent-authority enforcement action under MiCA, AMLD6, and EMIR Refit. LCIA arbitration commenced against co-regulator for procedural overreach. GDPR data-transfer challenge filed in parallel.",
  nextAction: "Respond to ESMA Follow-On Information Request — due 2026-05-10",
  access: [
    {
      userId: "00000000-0000-0000-0000-000000000001",
      role: "counsel",
      grantedBy: "00000000-0000-0000-0000-000000000001",
      grantedAt: "2026-01-15T00:00:00Z",
      permissions: [
        "view_overview",
        "view_timeline",
        "view_documents",
        "view_evidence",
        "view_status",
        "view_milestones",
        "view_financials",
        "view_strategy",
        "view_privileged",
      ],
    },
    {
      userId: "client-eu-fund-001",
      role: "client",
      grantedBy: "00000000-0000-0000-0000-000000000001",
      grantedAt: "2026-01-15T00:00:00Z",
      permissions: ["view_overview", "view_timeline", "view_status", "view_milestones", "send_messages"],
    },
  ],
  milestones: [
    {
      id: "ms-eu-intake",
      title: "Client Onboarding — GDPR-Compliant Data Processing Agreement",
      status: "completed",
      completedAt: "2026-01-17T00:00:00Z",
      visibleToClient: true,
    },
    {
      id: "ms-eu-mica-analysis",
      title: "MiCA Compliance Gap Analysis (Regulation EU 2023/1114)",
      status: "completed",
      completedAt: "2026-02-01T00:00:00Z",
      visibleToClient: true,
    },
    {
      id: "ms-eu-esma-response",
      title: "Initial ESMA Information Request Response Filed",
      status: "completed",
      completedAt: "2026-02-28T00:00:00Z",
      visibleToClient: true,
    },
    {
      id: "ms-eu-lcia-file",
      title: "LCIA Arbitration Request Filed — Procedural Overreach Challenge",
      status: "completed",
      completedAt: "2026-03-10T00:00:00Z",
      visibleToClient: true,
    },
    {
      id: "ms-eu-gdpr",
      title: "GDPR Art. 9 / Art. 46 Challenge — Data Transfer to Non-Adequate Jurisdiction",
      status: "in_progress",
      visibleToClient: true,
    },
    {
      id: "ms-eu-esma-followup",
      title: "ESMA Follow-On Information Request Response",
      status: "pending",
      targetDate: "2026-05-10",
      visibleToClient: true,
    },
    {
      id: "ms-eu-emir",
      title: "EMIR Refit Derivatives Reporting Remediation",
      status: "pending",
      targetDate: "2026-06-01",
      visibleToClient: true,
    },
    {
      id: "ms-eu-resolution",
      title: "Settlement / Supervisory Commitment Agreement",
      status: "pending",
      visibleToClient: true,
    },
  ],
  messages: [
    {
      id: "msg-eu-001",
      namespaceSlug: "eu-mica",
      fromUserId: "00000000-0000-0000-0000-000000000001",
      fromName: "EU Regulatory Counsel",
      subject: "Regulatory Defense Strategy — LCIA-2026-EU-001",
      body:
        "Client,\n\nMulti-Jurisdiction Regulatory Defense — LCIA-2026-EU-001:\n\n✅ MiCA compliance gap analysis complete — 3 material gaps identified, remediation plan submitted\n✅ Initial ESMA response filed — substantive defenses raised\n✅ LCIA arbitration commenced against co-regulator procedural overreach\n🔄 GDPR Art. 9 challenge — data transfer to US SEC under SCCs contested\n⏳ ESMA follow-on information request due 10 May 2026\n⏳ EMIR Refit derivatives reporting remediation — 60-day corrective plan\n\nKey Compliance Frameworks:\n• MiCA — Regulation (EU) 2023/1114 (Crypto-Asset Service Provider licensing)\n• AMLD6 — Directive (EU) 2018/843 (6th Anti-Money Laundering)\n• EMIR Refit — Regulation (EU) 2019/834 (derivatives reporting)\n• GDPR — Regulation (EU) 2016/679 Arts. 9 & 46 (data transfers)\n• MAR — Regulation (EU) 596/2014 (market abuse)\n• LCIA Arbitration Rules 2020\n\nExposure: €890M AUM; administrative fines up to 5% of annual turnover (MiCA Art. 111) avoided if remediation accepted.\n\n— EU Regulatory Counsel",
      attachments: [],
      sentAt: "2026-04-10T10:00:00Z",
      privileged: true,
    },
  ],
  packets: [
    {
      id: "pkt-eu-001",
      namespaceSlug: "eu-mica",
      title: "MiCA Compliance Package — Gap Analysis & Remediation Plan",
      description: "Full MiCA gap analysis, ESMA filings, LCIA request, and GDPR challenge submission",
      packetType: "case_summary",
      files: [
        {
          filename: "MiCA_Compliance_Gap_Analysis_2026.pdf",
          mimeType: "application/pdf",
          sizeBytes: 960000,
          hash: "e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0bb01",
        },
        {
          filename: "ESMA_Response_Initial_2026-02-28.pdf",
          mimeType: "application/pdf",
          sizeBytes: 540000,
          hash: "f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0bb02",
        },
        {
          filename: "LCIA-2026-EU-001_Request_for_Arbitration.pdf",
          mimeType: "application/pdf",
          sizeBytes: 680000,
          hash: "a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0bb03",
        },
        {
          filename: "GDPR_Art46_Challenge_SCCs.pdf",
          mimeType: "application/pdf",
          sizeBytes: 420000,
          hash: "b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0bb04",
        },
      ],
      generatedAt: "2026-04-10T11:00:00Z",
      generatedBy: "00000000-0000-0000-0000-000000000001",
      redactionLevel: "client_safe",
    },
  ],
};

// ── 3. Singapore MAS — UNCITRAL Stablecoin Reserve Dispute (UNCITRAL-2026-APAC-001) ──

export const SEED_NAMESPACE_APAC_UNCITRAL: Namespace = {
  slug: "apac-mas",
  matterId: "f1a2b3c4-d5e6-7890-abcd-333333333003",
  title: "UNCITRAL-2026-APAC-001",
  subtitle: "Singapore MAS — Cross-Border Stablecoin Reserve Dispute",
  status: "active",
  createdAt: "2026-01-20T00:00:00Z",
  updatedAt: "2026-04-10T00:00:00Z",
  caseType: "regulatory_arbitration",
  jurisdiction: "UNCITRAL Model Law Arbitration / Singapore International Commercial Court (SICC) / MAS Regulatory Overlay",
  statusSummary:
    "UNCITRAL Model Law arbitration before Singapore International Commercial Court — MAS enforcement action against digital payment institution contesting stablecoin reserve adequacy (SGD 1.2B). Parallel PDPA complaint filed regarding unauthorized data sharing with FATF correspondent agencies. SICC granted interim stay of MAS licence suspension pending arbitration.",
  nextAction: "File UNCITRAL Statement of Claim — due 2026-05-15",
  access: [
    {
      userId: "00000000-0000-0000-0000-000000000001",
      role: "counsel",
      grantedBy: "00000000-0000-0000-0000-000000000001",
      grantedAt: "2026-01-20T00:00:00Z",
      permissions: [
        "view_overview",
        "view_timeline",
        "view_documents",
        "view_evidence",
        "view_status",
        "view_milestones",
        "view_financials",
        "view_strategy",
        "view_privileged",
      ],
    },
    {
      userId: "client-apac-dpi-001",
      role: "client",
      grantedBy: "00000000-0000-0000-0000-000000000001",
      grantedAt: "2026-01-20T00:00:00Z",
      permissions: ["view_overview", "view_timeline", "view_status", "view_milestones", "send_messages"],
    },
  ],
  milestones: [
    {
      id: "ms-apac-intake",
      title: "Client Onboarding — MAS-Supervised Entity Due Diligence",
      status: "completed",
      completedAt: "2026-01-22T00:00:00Z",
      visibleToClient: true,
    },
    {
      id: "ms-apac-psa-audit",
      title: "Payment Services Act 2019 Compliance Audit",
      status: "completed",
      completedAt: "2026-02-10T00:00:00Z",
      visibleToClient: true,
    },
    {
      id: "ms-apac-sicc-stay",
      title: "SICC Interim Stay of MAS Licence Suspension Granted",
      status: "completed",
      completedAt: "2026-03-05T00:00:00Z",
      visibleToClient: true,
    },
    {
      id: "ms-apac-pdpa",
      title: "PDPA Complaint Filed — Unauthorized FATF Data Sharing",
      status: "completed",
      completedAt: "2026-03-15T00:00:00Z",
      visibleToClient: true,
    },
    {
      id: "ms-apac-reserve-report",
      title: "Independent Reserve Adequacy Report (Big 4 Auditor)",
      status: "in_progress",
      visibleToClient: true,
    },
    {
      id: "ms-apac-soc",
      title: "UNCITRAL Statement of Claim Filed — SICC",
      status: "pending",
      targetDate: "2026-05-15",
      visibleToClient: true,
    },
    {
      id: "ms-apac-hearing",
      title: "SICC Merits Hearing",
      status: "pending",
      targetDate: "2026-11-01",
      visibleToClient: true,
    },
    {
      id: "ms-apac-award",
      title: "UNCITRAL Award — Licence Reinstatement / Compensation",
      status: "pending",
      visibleToClient: true,
    },
  ],
  messages: [
    {
      id: "msg-apac-001",
      namespaceSlug: "apac-mas",
      fromUserId: "00000000-0000-0000-0000-000000000001",
      fromName: "Singapore Regulatory Counsel",
      subject: "SICC Stay Granted — UNCITRAL-2026-APAC-001",
      body:
        "Client,\n\nAPAC Regulatory Dispute Status — UNCITRAL-2026-APAC-001:\n\n✅ MAS Payment Services Act 2019 compliance audit complete — reserve shortfall disputed\n✅ SICC interim stay of MAS licence suspension GRANTED (pending arbitration)\n✅ PDPA complaint filed — unauthorized data transfer to FATF correspondent agencies\n🔄 Independent reserve adequacy report commissioned — Big Four auditor engaged\n⏳ UNCITRAL Statement of Claim due 15 May 2026\n\nKey Compliance Frameworks:\n• MAS Payment Services Act 2019 (PSA) — s. 29 reserve requirements\n• Payment Services (Amendment) Act 2021 (PS(A)A) — stablecoin issuer rules\n• PDPA — Personal Data Protection Act 2012 (Singapore)\n• FATF Recommendation 15 — VASP travel rule obligations\n• UNCITRAL Model Law on International Commercial Arbitration (Singapore 2012 adoption)\n• Singapore International Commercial Court Rules 2021\n\nSGD 1.2B reserve adequacy at issue — MAS contends 18% shortfall; independent auditor engaged to rebut.\n\n— Singapore Regulatory Counsel",
      attachments: [],
      sentAt: "2026-04-10T11:30:00Z",
      privileged: true,
    },
  ],
  packets: [
    {
      id: "pkt-apac-001",
      namespaceSlug: "apac-mas",
      title: "UNCITRAL Proceeding Package — SICC Filing",
      description: "PSA compliance audit, SICC interim stay order, PDPA complaint, and reserve adequacy brief",
      packetType: "case_summary",
      files: [
        {
          filename: "PSA_Compliance_Audit_2026.pdf",
          mimeType: "application/pdf",
          sizeBytes: 780000,
          hash: "c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0cc01",
        },
        {
          filename: "SICC_Interim_Stay_Order_2026-03-05.pdf",
          mimeType: "application/pdf",
          sizeBytes: 220000,
          hash: "d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0cc02",
        },
        {
          filename: "PDPA_Complaint_FATF_Data_Sharing.pdf",
          mimeType: "application/pdf",
          sizeBytes: 310000,
          hash: "e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0cc03",
        },
        {
          filename: "Reserve_Adequacy_Preliminary_Brief.pdf",
          mimeType: "application/pdf",
          sizeBytes: 490000,
          hash: "f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0cc04",
        },
      ],
      generatedAt: "2026-04-10T12:00:00Z",
      generatedBy: "00000000-0000-0000-0000-000000000001",
      redactionLevel: "client_safe",
    },
  ],
};

// ── 4. Sovereign Treasury — ICSID BIT Arbitration (ICSID-2026-LATAM-001) ──

export const SEED_NAMESPACE_LATAM_ICSID: Namespace = {
  slug: "latam-bit",
  matterId: "f1a2b3c4-d5e6-7890-abcd-444444444004",
  title: "ICSID-2026-LATAM-001",
  subtitle: "Sovereign Treasury — BIT Arbitration — Digital Infrastructure",
  status: "active",
  createdAt: "2026-01-05T00:00:00Z",
  updatedAt: "2026-04-10T00:00:00Z",
  caseType: "bilateral_investment_treaty",
  jurisdiction:
    "ICSID (International Centre for Settlement of Investment Disputes) / Bilateral Investment Treaty / Vienna Convention on the Law of Treaties",
  statusSummary:
    "ICSID Convention Art. 25 BIT arbitration — sovereign state treasury asserting $3.1B claim for expropriation and denial of fair and equitable treatment against technology infrastructure operator. Preliminary jurisdiction phase: claimant state challenging admissibility of respondent's MFN clause defences. Three-member ICSID tribunal constituted.",
  nextAction: "Submit Claimant's Jurisdictional Counter-Memorial — due 2026-06-01",
  access: [
    {
      userId: "00000000-0000-0000-0000-000000000001",
      role: "counsel",
      grantedBy: "00000000-0000-0000-0000-000000000001",
      grantedAt: "2026-01-05T00:00:00Z",
      permissions: [
        "view_overview",
        "view_timeline",
        "view_documents",
        "view_evidence",
        "view_status",
        "view_milestones",
        "view_financials",
        "view_strategy",
        "view_privileged",
      ],
    },
    {
      userId: "client-latam-treasury-001",
      role: "client",
      grantedBy: "00000000-0000-0000-0000-000000000001",
      grantedAt: "2026-01-05T00:00:00Z",
      permissions: ["view_overview", "view_timeline", "view_status", "view_milestones", "send_messages"],
    },
  ],
  milestones: [
    {
      id: "ms-latam-notice",
      title: "Notice of Dispute Filed Under BIT Art. 8",
      status: "completed",
      completedAt: "2026-01-08T00:00:00Z",
      visibleToClient: true,
    },
    {
      id: "ms-latam-icsid-reg",
      title: "ICSID Registration of Arbitration Request",
      status: "completed",
      completedAt: "2026-01-25T00:00:00Z",
      visibleToClient: true,
    },
    {
      id: "ms-latam-tribunal",
      title: "Three-Member ICSID Tribunal Constituted",
      status: "completed",
      completedAt: "2026-02-20T00:00:00Z",
      visibleToClient: true,
    },
    {
      id: "ms-latam-juris-memorial",
      title: "Respondent's Preliminary Objections to Jurisdiction Filed",
      status: "completed",
      completedAt: "2026-03-15T00:00:00Z",
      visibleToClient: true,
    },
    {
      id: "ms-latam-expert-valuation",
      title: "Independent Quantum Expert — $3.1B Expropriation Valuation Report",
      status: "in_progress",
      visibleToClient: true,
    },
    {
      id: "ms-latam-counter-memorial",
      title: "Claimant's Jurisdictional Counter-Memorial",
      status: "pending",
      targetDate: "2026-06-01",
      visibleToClient: true,
    },
    {
      id: "ms-latam-juris-hearing",
      title: "ICSID Jurisdictional Hearing",
      status: "pending",
      targetDate: "2026-09-01",
      visibleToClient: true,
    },
    {
      id: "ms-latam-merits",
      title: "Merits Phase — Memorial on Expropriation & FET Claims",
      status: "pending",
      visibleToClient: true,
    },
    {
      id: "ms-latam-award",
      title: "ICSID Final Award — Annulment / Enforcement Phase",
      status: "pending",
      visibleToClient: true,
    },
  ],
  messages: [
    {
      id: "msg-latam-001",
      namespaceSlug: "latam-bit",
      fromUserId: "00000000-0000-0000-0000-000000000001",
      fromName: "International Arbitration Lead",
      subject: "Tribunal Constituted — ICSID-2026-LATAM-001",
      body:
        "Client,\n\nICSID BIT Arbitration Status — ICSID-2026-LATAM-001:\n\n✅ BIT Notice of Dispute filed under Art. 8 cooling-off period satisfied\n✅ ICSID Secretariat — Request for Arbitration registered\n✅ Three-member tribunal constituted (President: Dr. A. Pellet, Arbitrators: Prof. C. McLachlan & Mr. B. Stern)\n✅ Respondent's preliminary jurisdictional objections received — MFN clause challenge, forum selection objection\n🔄 Independent quantum valuation expert engaged — Discounted Cash Flow (DCF) model for $3.1B digital infrastructure\n⏳ Jurisdictional Counter-Memorial due 1 June 2026\n\nKey Legal Standards:\n• ICSID Convention Art. 25 — jurisdiction (national of another Contracting State, investment)\n• BIT Arts. 3 (FET), 4 (expropriation), 8 (dispute resolution)\n• Vienna Convention on the Law of Treaties Arts. 31-32 — treaty interpretation\n• ILC Articles on State Responsibility Arts. 4-11 (attribution)\n• Chorzów Factory standard — full reparation for unlawful expropriation\n• ICSID Arbitration Rule 41(5) — preliminary objection procedures\n\nRisk: Respondent's MFN route to US-model BIT fork-in-road clause under analysis — seeking precedent distinguishing CMS Gas v Argentina and Sempra v Argentina.\n\n— International Arbitration Lead",
      attachments: [],
      sentAt: "2026-04-10T14:00:00Z",
      privileged: true,
    },
  ],
  packets: [
    {
      id: "pkt-latam-001",
      namespaceSlug: "latam-bit",
      title: "ICSID Preliminary Phase Package",
      description: "BIT notice, ICSID registration, tribunal constitution order, jurisdiction objections analysis, and quantum valuation brief",
      packetType: "case_summary",
      files: [
        {
          filename: "BIT_Notice_of_Dispute_Art8_2026-01-08.pdf",
          mimeType: "application/pdf",
          sizeBytes: 380000,
          hash: "a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0dd01",
        },
        {
          filename: "ICSID_Registration_2026-01-25.pdf",
          mimeType: "application/pdf",
          sizeBytes: 150000,
          hash: "b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0dd02",
        },
        {
          filename: "Tribunal_Constitution_Order_2026-02-20.pdf",
          mimeType: "application/pdf",
          sizeBytes: 190000,
          hash: "c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0dd03",
        },
        {
          filename: "Jurisdictional_Objections_Analysis.pdf",
          mimeType: "application/pdf",
          sizeBytes: 870000,
          hash: "d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0dd04",
        },
        {
          filename: "Quantum_Valuation_Preliminary_Brief_DCF_3B.pdf",
          mimeType: "application/pdf",
          sizeBytes: 1100000,
          hash: "e7f8a9b0c1d2e3f4a5b6c7d8e9f0dd05",
        },
      ],
      generatedAt: "2026-04-10T14:30:00Z",
      generatedBy: "00000000-0000-0000-0000-000000000001",
      redactionLevel: "client_safe",
    },
  ],
};
