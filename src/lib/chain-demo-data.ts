/**
 * Demo seed data for the Legal-Chain explorer.
 * Shown when the Substrate node is offline so the explorer isn't empty.
 */

export const DEMO_STATS = {
  total_blocks: 247,
  total_events: 0,
  latest_block: 247,
  total_matters: 3,
  total_evidence: 12,
  total_documents: 8,
  total_approvals: 5,
  total_identities: 6,
  total_audit_entries: 34,
};

export const DEMO_BLOCKS = [
  { number: 247, hash: "0x9f3c…a4e1", parent_hash: "0x7b21…c8d0", extrinsics: 2, timestamp: "2026-07-03T14:22:10Z" },
  { number: 246, hash: "0x7b21…c8d0", parent_hash: "0x5e08…f7a3", extrinsics: 1, timestamp: "2026-07-03T14:22:04Z" },
  { number: 245, hash: "0x5e08…f7a3", parent_hash: "0x3d94…e6b2", extrinsics: 3, timestamp: "2026-07-03T14:21:58Z" },
  { number: 244, hash: "0x3d94…e6b2", parent_hash: "0x1ca7…d5c1", extrinsics: 1, timestamp: "2026-07-03T14:21:52Z" },
  { number: 243, hash: "0x1ca7…d5c1", parent_hash: "0x0b63…c4e0", extrinsics: 2, timestamp: "2026-07-03T14:21:46Z" },
  { number: 242, hash: "0x0b63…c4e0", parent_hash: "0xe952…b3df", extrinsics: 1, timestamp: "2026-07-03T14:21:40Z" },
  { number: 241, hash: "0xe952…b3df", parent_hash: "0xd841…a2ce", extrinsics: 4, timestamp: "2026-07-03T14:21:34Z" },
  { number: 240, hash: "0xd841…a2ce", parent_hash: "0xc730…91bd", extrinsics: 2, timestamp: "2026-07-03T14:21:28Z" },
];

export const DEMO_MATTERS = [
  { id: "MTR-001", title: "State v. Delcampo — Illegal Sentence Appeal", status: "Active", case_type: "Criminal Appeal", filed: "2026-04-15", evidence_count: 5 },
  { id: "MTR-002", title: "NTI-LEAVITT — TRON Crypto Fraud Recovery", status: "Active", case_type: "Crypto Fraud", filed: "2026-05-02", evidence_count: 4 },
  { id: "MTR-003", title: "169 Creamer Drive — Joint Venture Dispute", status: "Pre-Litigation", case_type: "Civil Property", filed: "2026-06-10", evidence_count: 3 },
];

export const DEMO_EVIDENCE = [
  { id: "EVD-001", matter: "MTR-001", type: "Sentencing Transcript", hash: "0xa3f1…8c4d", anchored: "2026-04-16", verified: true },
  { id: "EVD-002", matter: "MTR-001", type: "Statutory Analysis", hash: "0xb2e0…7b3c", anchored: "2026-04-17", verified: true },
  { id: "EVD-003", matter: "MTR-001", type: "Case Law Precedent", hash: "0xc1d9…6a2b", anchored: "2026-04-18", verified: true },
  { id: "EVD-004", matter: "MTR-001", type: "Judicial Record Review", hash: "0xd0c8…591a", anchored: "2026-04-20", verified: true },
  { id: "EVD-005", matter: "MTR-001", type: "Expert Witness Deposition", hash: "0xefb7…4809", anchored: "2026-04-22", verified: true },
  { id: "EVD-006", matter: "MTR-002", type: "TRON Transaction Trace", hash: "0xf0a6…37f8", anchored: "2026-05-03", verified: true },
  { id: "EVD-007", matter: "MTR-002", type: "Wallet Cluster Analysis", hash: "0x0195…26e7", anchored: "2026-05-04", verified: true },
  { id: "EVD-008", matter: "MTR-002", type: "Exchange KYC Records", hash: "0x1284…15d6", anchored: "2026-05-06", verified: true },
  { id: "EVD-009", matter: "MTR-002", type: "Timeline Reconstruction", hash: "0x2373…04c5", anchored: "2026-05-08", verified: true },
  { id: "EVD-010", matter: "MTR-003", type: "Property Deed", hash: "0x3462…f3b4", anchored: "2026-06-11", verified: true },
  { id: "EVD-011", matter: "MTR-003", type: "Joint Venture Agreement", hash: "0x4551…e2a3", anchored: "2026-06-12", verified: true },
  { id: "EVD-012", matter: "MTR-003", type: "Post-Closing Accounting", hash: "0x5640…d192", anchored: "2026-06-15", verified: true },
];

export const DEMO_DOCUMENTS = [
  { id: "DOC-001", matter: "MTR-001", title: "Motion to Correct Illegal Sentence", type: "Motion", hash: "0x7a3f…c1e8", filed: "2026-04-20" },
  { id: "DOC-002", matter: "MTR-001", title: "Memorandum of Law — F.S. 784.045", type: "Legal Brief", hash: "0x8b4e…d2f9", filed: "2026-04-22" },
  { id: "DOC-003", matter: "MTR-001", title: "Appendix of Sentencing Guidelines", type: "Exhibit", hash: "0x9c5d…e300", filed: "2026-04-25" },
  { id: "DOC-004", matter: "MTR-002", title: "Blockchain Forensic Report", type: "Expert Report", hash: "0xad6c…f411", filed: "2026-05-10" },
  { id: "DOC-005", matter: "MTR-002", title: "Demand Letter — Fund Recovery", type: "Correspondence", hash: "0xbe7b…0522", filed: "2026-05-15" },
  { id: "DOC-006", matter: "MTR-002", title: "TRON Network Analysis Exhibit", type: "Exhibit", hash: "0xcf8a…1633", filed: "2026-05-18" },
  { id: "DOC-007", matter: "MTR-003", title: "Pre-Litigation Demand", type: "Correspondence", hash: "0xd099…2744", filed: "2026-06-20" },
  { id: "DOC-008", matter: "MTR-003", title: "Property Valuation Report", type: "Expert Report", hash: "0xe1a8…3855", filed: "2026-06-25" },
];

export const DEMO_APPROVALS = [
  { id: "APR-001", matter: "MTR-001", action: "File Motion to Correct Sentence", approver: "Kevan Burns", status: "Approved", date: "2026-04-19" },
  { id: "APR-002", matter: "MTR-001", action: "Engage Expert Witness", approver: "Kevan Burns", status: "Approved", date: "2026-04-21" },
  { id: "APR-003", matter: "MTR-002", action: "Commission Blockchain Forensics", approver: "Kevan Burns", status: "Approved", date: "2026-05-05" },
  { id: "APR-004", matter: "MTR-002", action: "Issue Demand Letter", approver: "Kevan Burns", status: "Approved", date: "2026-05-14" },
  { id: "APR-005", matter: "MTR-003", action: "Authorize Pre-Litigation Research", approver: "Kevan Burns", status: "Approved", date: "2026-06-12" },
];

export const DEMO_IDENTITIES = [
  { id: "IDN-001", name: "Kevan Burns", role: "Chairman / Operator", verified: true, registered: "2026-04-01" },
  { id: "IDN-002", name: "MCP Legal Agent", role: "AI Agent — Research", verified: true, registered: "2026-04-01" },
  { id: "IDN-003", name: "x402 Executor", role: "AI Agent — Payments", verified: true, registered: "2026-04-01" },
  { id: "IDN-004", name: "Forensics Agent", role: "AI Agent — Blockchain Analysis", verified: true, registered: "2026-04-02" },
  { id: "IDN-005", name: "Compliance Agent", role: "AI Agent — Regulatory", verified: true, registered: "2026-04-02" },
  { id: "IDN-006", name: "Case Intake Agent", role: "AI Agent — Client Interface", verified: true, registered: "2026-04-03" },
];

export const DEMO_AUDIT = [
  { id: 34, action: "evidence.anchor", entity: "EVD-012", actor: "MCP Legal Agent", timestamp: "2026-06-15T10:30:00Z" },
  { id: 33, action: "document.file", entity: "DOC-008", actor: "MCP Legal Agent", timestamp: "2026-06-25T14:15:00Z" },
  { id: 32, action: "approval.grant", entity: "APR-005", actor: "Kevan Burns", timestamp: "2026-06-12T09:00:00Z" },
  { id: 31, action: "evidence.anchor", entity: "EVD-011", actor: "MCP Legal Agent", timestamp: "2026-06-12T08:45:00Z" },
  { id: 30, action: "matter.create", entity: "MTR-003", actor: "Case Intake Agent", timestamp: "2026-06-10T11:20:00Z" },
  { id: 29, action: "document.file", entity: "DOC-007", actor: "MCP Legal Agent", timestamp: "2026-06-20T16:00:00Z" },
  { id: 28, action: "evidence.anchor", entity: "EVD-010", actor: "MCP Legal Agent", timestamp: "2026-06-11T13:30:00Z" },
  { id: 27, action: "document.file", entity: "DOC-006", actor: "Forensics Agent", timestamp: "2026-05-18T11:00:00Z" },
  { id: 26, action: "document.file", entity: "DOC-005", actor: "MCP Legal Agent", timestamp: "2026-05-15T09:30:00Z" },
  { id: 25, action: "approval.grant", entity: "APR-004", actor: "Kevan Burns", timestamp: "2026-05-14T08:15:00Z" },
  { id: 24, action: "document.file", entity: "DOC-004", actor: "Forensics Agent", timestamp: "2026-05-10T14:00:00Z" },
  { id: 23, action: "evidence.anchor", entity: "EVD-009", actor: "Forensics Agent", timestamp: "2026-05-08T10:20:00Z" },
  { id: 22, action: "evidence.anchor", entity: "EVD-008", actor: "Forensics Agent", timestamp: "2026-05-06T15:45:00Z" },
  { id: 21, action: "approval.grant", entity: "APR-003", actor: "Kevan Burns", timestamp: "2026-05-05T09:00:00Z" },
  { id: 20, action: "evidence.anchor", entity: "EVD-007", actor: "Forensics Agent", timestamp: "2026-05-04T12:30:00Z" },
];

export function getDemoData(tab: string) {
  switch (tab) {
    case "blocks": return DEMO_BLOCKS;
    case "matters": return DEMO_MATTERS;
    case "evidence": return DEMO_EVIDENCE;
    case "documents": return DEMO_DOCUMENTS;
    case "approvals": return DEMO_APPROVALS;
    case "identities": return DEMO_IDENTITIES;
    case "audit": return DEMO_AUDIT;
    default: return [];
  }
}
