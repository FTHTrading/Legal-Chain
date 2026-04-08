"use client";

import { v4 as uuidv4 } from "uuid";
import { SEED_INTAKES, SEED_APPROVALS, SEED_WORKFLOW_INTAKE } from "./data/seed-platform";
import { ACTIVE_CASES, AGENT_NETWORK } from "./data/seed";
import { truthKernel } from "./kernel";

// ─── Types ──────────────────────────────────────────────────────────────────

export type IntakeStatus = "new" | "under_review" | "accepted" | "rejected" | "pending_conflict_check" | "conflict_cleared" | "needs_information" | "scheduled" | "archived";
export type ApprovalStatus = "draft" | "in_review" | "requires_source_check" | "requires_attorney_review" | "approved" | "rejected" | "sent" | "filed" | "archived";
export type TaskStatus = "pending" | "in_progress" | "waiting_approval" | "approved" | "completed" | "blocked" | "cancelled" | "failed" | "skipped";
export type CommStatus = "draft" | "pending_review" | "approved" | "sent" | "delivered" | "read" | "failed" | "archived" | "recalled" | "bounced";
export type Priority = "critical" | "high" | "medium" | "low" | "routine";

export interface IntakeRecord {
  id: string;
  caseReference: string;
  clientName: string;
  email: string;
  phone: string;
  matterType: string;
  urgency: Priority;
  description: string;
  status: IntakeStatus;
  createdAt: string;
  updatedAt: string;
  conflictCheck?: { status: string; adverseParties: string[]; cleared: boolean; waived: boolean };
  assignedTo?: string;
  notes: string[];
  submittedDocuments: string[];
}

export interface ApprovalRecord {
  id: string;
  title: string;
  category: string;
  status: ApprovalStatus;
  priority: Priority;
  summary: string;
  confidenceScore: number;
  submittedBy: string;
  createdAt: string;
  updatedAt: string;
  matterId?: string;
  contentVersion: number;
  citations: Array<{ source: string; citationType: string; pinCite?: string; retrievedAt: string; confidence: number }>;
  evidenceLinks: string[];
  redlines: Array<{ original: string; proposed: string; reason: string; accepted?: boolean }>;
  reviews: Array<{ reviewerId: string; role: string; decision: string; comments: string; timestamp: string }>;
}

export interface TaskRecord {
  id: string;
  title: string;
  workflowType: string;
  status: TaskStatus;
  priority: Priority;
  assignedToAgent: string;
  description: string;
  dependsOn: string[];
  inputs: Record<string, unknown>;
  outputs: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface CommRecord {
  id: string;
  channel: string;
  status: CommStatus;
  subject: string;
  body: string;
  to: string;
  from: string;
  privileged: boolean;
  workProduct: boolean;
  matterId: string;
  createdAt: string;
  updatedAt: string;
  sentAt?: string;
  tags: string[];
}

export interface AuditRecord {
  id: string;
  timestamp: string;
  action: string;
  category: string;
  actor: string;
  actorType: "human" | "agent" | "system";
  resourceType: string;
  resourceId: string;
  description: string;
  contentHash: string;
  previousEntryHash: string;
  metadata: Record<string, unknown>;
}

export interface ResearchQuery {
  id: string;
  queryType: "case_law" | "statute" | "regulation" | "secondary_source" | "brief_analysis";
  query: string;
  jurisdiction: string;
  status: "pending" | "completed" | "saved";
  resultCount: number;
  createdAt: string;
  matterId?: string;
}

export interface Notification {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

// ─── Storage Keys ──────────────────────────────────────────────────────────

const KEYS = {
  intakes: "unykorn_intakes",
  approvals: "unykorn_approvals",
  tasks: "unykorn_tasks",
  communications: "unykorn_communications",
  audit: "unykorn_audit",
  notifications: "unykorn_notifications",
  research: "unykorn_research",
} as const;

// ─── Persistence ──────────────────────────────────────────────────────────

function load<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function save<T>(key: string, data: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    // Storage full or unavailable — silently fail
  }
}

// ─── Hash Chain ──────────────────────────────────────────────────────────

async function sha256(message: string): Promise<string> {
  if (typeof window === "undefined") return "0".repeat(64);
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

// ─── Seed Transforms ──────────────────────────────────────────────────────

function seedIntakes(): IntakeRecord[] {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return SEED_INTAKES.map((s: any) => ({
    id: s.id,
    caseReference: s.caseReference || `INT-2026-${s.id.split("-").pop()?.slice(0, 3).toUpperCase() || "000"}`,
    clientName: s.contactName || `${s.contactInfo?.firstName || ""} ${s.contactInfo?.lastName || ""}`.trim() || "Unknown",
    email: s.contactEmail || s.contactInfo?.email || "",
    phone: s.contactPhone || s.contactInfo?.phone || "",
    matterType: s.matterType,
    urgency: (s.urgency || "routine") as Priority,
    description: s.briefDescription || s.description || "",
    status: (s.status || "new") as IntakeStatus,
    createdAt: s.createdAt,
    updatedAt: s.updatedAt || s.createdAt,
    conflictCheck: s.conflictCheck ? { status: s.conflictCheck.result || "pending", adverseParties: s.conflictCheck.conflictingPartyNames || [], cleared: s.conflictCheck.result === "clear", waived: s.conflictCheck.waived || false } : undefined,
    assignedTo: s.assignedTo,
    notes: s.notes || [],
    submittedDocuments: Array.isArray(s.submittedDocuments) ? s.submittedDocuments.map((d: string | { filename: string }) => typeof d === "string" ? d : d.filename) : [],
  }));
}

function seedApprovals(): ApprovalRecord[] {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return SEED_APPROVALS.map((s: any) => ({
    id: s.id,
    title: s.title,
    category: s.category,
    status: s.status as ApprovalStatus,
    priority: (s.priority || "routine") as Priority,
    summary: s.summary,
    confidenceScore: s.confidenceScore ?? 0,
    submittedBy: s.createdByName || s.submittedBy || "System",
    createdAt: s.createdAt,
    updatedAt: s.updatedAt,
    matterId: s.matterId,
    contentVersion: s.contentVersion || 1,
    citations: (s.sourceCitations || s.citations || []).map((c: Record<string, string>) => ({ source: c.title || "", citationType: c.citationType || "", pinCite: c.reference || "", retrievedAt: s.createdAt, confidence: 1 })),
    evidenceLinks: s.evidenceLinks || [],
    redlines: s.redlines || [],
    reviews: (s.reviews || []).map((r: Record<string, string>) => ({ reviewerId: r.reviewerId || "", role: r.reviewerRole || r.role || "", decision: r.decision || "", comments: r.comment || r.comments || "", timestamp: r.createdAt || r.timestamp || "" })),
  }));
}

function seedTasks(): TaskRecord[] {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return SEED_WORKFLOW_INTAKE.tasks.map((t: any) => ({
    id: t.id,
    title: t.title,
    workflowType: t.taskType || t.workflowType || "intake_pipeline",
    status: (t.status === "awaiting_approval" ? "waiting_approval" : t.status) as TaskStatus,
    priority: (t.priority || "normal") as Priority,
    assignedToAgent: t.assignedToAgent || "unassigned",
    description: t.notes || t.description || "",
    dependsOn: t.dependsOn || [],
    inputs: {},
    outputs: {},
    createdAt: t.createdAt,
    updatedAt: t.updatedAt || t.createdAt,
    completedAt: t.completedAt,
  }));
}

function seedCommunications(): CommRecord[] {
  return [
    {
      id: uuidv4(),
      channel: "email",
      status: "draft" as CommStatus,
      subject: "Property Inspection Report — 169 Creamer Drive",
      body: "Dear Mr. Miller,\n\nPlease find attached the independent property inspection report for 169 Creamer Drive, Covington, GA 30014. The report documents the current condition of the property and identifies repair items that may be relevant to the post-closing proceeds dispute.\n\nKey findings include water damage to the master bathroom subfloor, HVAC unit requiring replacement, and roof repairs needed on the south-facing section.\n\nPlease review and contact our office with any questions.\n\nBest regards,\nLegal Operations Team",
      to: "troy.miller@email.com",
      from: "ops@unykorn.org",
      privileged: false,
      workProduct: false,
      matterId: "creamer-drive-169",
      createdAt: "2026-03-28T14:00:00Z",
      updatedAt: "2026-03-28T14:00:00Z",
      tags: ["client-communication", "property-inspection"],
    },
    {
      id: uuidv4(),
      channel: "email",
      status: "pending_review" as CommStatus,
      subject: "RE: Demand Letter — Post-Closing Proceeds",
      body: "To Counsel for Respondent,\n\nThis firm represents Troy Miller in connection with the post-closing proceeds dispute arising from the sale of real property located at 169 Creamer Drive, Covington, Newton County, Georgia 30014.\n\nOur client demands the immediate release of $1,000,000 in post-closing proceeds currently held in escrow. The seller's claimed offsets totaling $47,000 are disputed as follows:\n\n1. Repair credits ($15,000) — Pre-existing conditions per O.C.G.A. § 44-14-2\n2. HOA arrears ($8,000) — Seller obligation per closing agreement\n3. Utility adjustments ($4,000) — Contestable proration methodology\n4. Inspection remediation ($20,000) — Exceeds reasonable scope\n\nPlease respond within fourteen (14) business days.\n\nVery truly yours,",
      to: "opposing.counsel@lawfirm.com",
      from: "legal@unykorn.org",
      privileged: true,
      workProduct: true,
      matterId: "creamer-drive-169",
      createdAt: "2026-03-25T10:30:00Z",
      updatedAt: "2026-04-01T09:15:00Z",
      tags: ["demand-letter", "attorney-privileged", "opposing-counsel"],
    },
    {
      id: uuidv4(),
      channel: "email",
      status: "approved" as CommStatus,
      subject: "TRON Fraud Investigation Update — NTI-LEAVITT-2026-001",
      body: "Dear Ms. Leavitt,\n\nWe are writing to update you on the status of the cryptocurrency fraud investigation (Case Reference: NTI-LEAVITT-2026-001).\n\nOur forensic analysis team has traced $36,150 in USDT across the TRON and Ethereum blockchains. We have identified 4 suspect wallets involved in the scheme, with evidence of layering through cross-chain bridges.\n\nCurrent recovery estimate: $12,000 (33% of traced value).\n\nNext steps:\n1. File complaint with IC3 (FBI Internet Crime Complaint Center)\n2. Submit blockchain evidence package to Tether for potential asset freeze\n3. Coordinate with TRON Foundation compliance team\n\nWe will schedule a call this week to discuss strategy.\n\nBest regards,\nForensic Investigation Team",
      to: "client.leavitt@email.com",
      from: "forensics@unykorn.org",
      privileged: false,
      workProduct: false,
      matterId: "nti-leavitt-2026",
      createdAt: "2026-04-02T16:45:00Z",
      updatedAt: "2026-04-05T11:20:00Z",
      sentAt: undefined,
      tags: ["client-update", "forensics", "tron-fraud"],
    },
    // ── Troy Miller / 169 Creamer Drive Communications ──
    {
      id: uuidv4(),
      channel: "email",
      status: "sent" as CommStatus,
      subject: "Formal Demand — Post-Closing Proceeds Reconciliation, 169 Creamer Drive",
      body: "Michael,\n\nI am writing to formally request a full accounting and reconciliation of the post-closing proceeds from the sale of 169 Creamer Drive, Alpharetta, GA 30004.\n\nAs you know, I invested over $65,000 in improvements to the property that directly increased the sale price by approximately $100,000. I also carried approximately $60,000 in additional SBA valuation costs at $1,250/month over ~48 months, invested $6,800 in painting and labor during COVID to prepare the property for sale, managed all tenants, and handled ongoing maintenance.\n\nI acknowledge the $50,000 loan and $3,500 remaining on the auto and boom loans as offsets. I also acknowledge your improvements (A/C, roof, asphalt) which you verbally estimated at approximately $35,000, though no documentation has been provided despite requests.\n\nThe jointly held funds from closing — approximately $1,000,000 — need to be reconciled and distributed according to our agreement. Please provide a full accounting within 30 days.\n\nTroy Miller\nPresident/CEO, etrenzik\n678-467-5515\nCAGE Code: 6SCL2",
      to: "michael@bestlyfegroup.com",
      from: "tmiller@etrenzik.com",
      privileged: false,
      workProduct: false,
      matterId: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      createdAt: "2026-03-30T12:00:00Z",
      updatedAt: "2026-03-30T12:00:00Z",
      sentAt: "2026-03-30T12:00:00Z",
      tags: ["demand", "client-authored", "creamer-drive"],
    },
    {
      id: uuidv4(),
      channel: "email",
      status: "draft" as CommStatus,
      subject: "Engagement Letter — Troy Miller / 169 Creamer Drive Property Dispute",
      body: "Dear Mr. Miller,\n\nThank you for retaining UNYKORN // LAW to represent you in connection with the post-closing proceeds dispute arising from the sale of 169 Creamer Drive, Alpharetta, Georgia 30004.\n\nScope of Representation:\nWe will represent you in pursuing claims against Michael Walser for breach of contract, equitable accounting, unjust enrichment, money had and received, and reimbursement for improvements related to the jointly held post-closing proceeds.\n\nFee Structure:\nThis matter will be handled on a contingency basis. Our fee shall be [percentage]% of the gross recovery obtained through settlement, judgment, or other resolution.\n\nEstimated Case Value:\nBased on our preliminary analysis, the estimated net recovery is approximately $143,300, subject to verification of all claimed amounts and discovery of respondent's assets.\n\nNext Steps:\n1. Execute this engagement letter\n2. Provide all documentation (closing statement, improvement invoices, bank statements, loan docs)\n3. We will draft and send a formal 30-day demand letter via certified mail\n4. If no response, prepare complaint for Forsyth County Superior Court\n\nPlease review, sign, and return at your earliest convenience.\n\nVery truly yours,\nKevan Burns\nUNYKORN // LAW",
      to: "tmiller@etrenzik.com",
      from: "legal@unykorn.org",
      privileged: true,
      workProduct: true,
      matterId: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      createdAt: "2026-04-07T09:00:00Z",
      updatedAt: "2026-04-07T09:00:00Z",
      tags: ["engagement-letter", "attorney-privileged", "creamer-drive"],
    },
    {
      id: uuidv4(),
      channel: "email",
      status: "draft" as CommStatus,
      subject: "Document Request — 169 Creamer Drive Post-Closing Dispute",
      body: "Dear Troy,\n\nTo build the strongest possible case, we need the following documents at your earliest convenience:\n\n1. CRITICAL — Closing/Settlement Statement (HUD-1 or Closing Disclosure)\n   - This shows how the ~$1M in proceeds was disbursed at closing\n\n2. Deed History — Any deeds showing ownership structure\n\n3. Written Communications — All emails, texts, and messages with Michael Walser regarding:\n   - The profit-split agreement\n   - Expense reconciliation terms\n   - His acknowledgment of your improvements\n\n4. Improvement Documentation:\n   - Invoices, receipts, and contractor agreements for the $65K+ in improvements\n   - Photos before/after improvements\n   - $6,800 painting/COVID prep invoices\n\n5. SBA Records:\n   - Monthly payment records showing the $1,250/mo carrying costs\n   - SBA valuation documents\n\n6. Loan Documentation:\n   - $50,000 loan documents\n   - Auto and boom loan records ($3,500 remaining)\n\n7. Bank Statements — Showing all payments made toward the property\n\n8. Tenant Management Records — Lease agreements, rent collected, management communications\n\n9. Michael Walser's Florida Address — Needed for service of process\n\nPlease send whatever you have — even partial records help build timeline and establish facts.\n\nBest regards,\nLegal Operations Team\nUNYKORN // LAW",
      to: "tmiller@etrenzik.com",
      from: "ops@unykorn.org",
      privileged: false,
      workProduct: false,
      matterId: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      createdAt: "2026-04-07T10:00:00Z",
      updatedAt: "2026-04-07T10:00:00Z",
      tags: ["document-request", "client-communication", "creamer-drive"],
    },
    {
      id: uuidv4(),
      channel: "secure_message",
      status: "draft" as CommStatus,
      subject: "Case Strategy Update — Filing Timeline",
      body: "Troy,\n\nQuick update on your case strategy:\n\n• COMPLETED: Conflict check — clear, no adverse relationships\n• COMPLETED: Georgia cotenant law research — strong authorities support your claims\n• IN PROGRESS: Formal demand letter (attorney review queue)\n• PENDING: Document collection from you (see separate email)\n• PENDING: Damages model (blocked until we receive your records)\n\nTimeline:\n- Demand letter response deadline: April 30, 2026\n- If no response: file complaint in Forsyth County Superior Court (May 2026)\n- Discovery phase: 3-6 months\n- Trial/resolution: 12-18 months\n\nIMPORTANT: Georgia has a 6-year statute of limitations on written contract claims and 4 years on unjust enrichment. We need to confirm when the breach occurred to ensure we file within the window.\n\nLet me know if you have questions.\n\n— Legal Ops",
      to: "tmiller@etrenzik.com",
      from: "ops@unykorn.org",
      privileged: true,
      workProduct: true,
      matterId: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      createdAt: "2026-04-07T14:00:00Z",
      updatedAt: "2026-04-07T14:00:00Z",
      tags: ["strategy-update", "attorney-privileged", "creamer-drive"],
    },
    {
      id: uuidv4(),
      channel: "letter",
      status: "draft" as CommStatus,
      subject: "Certified Mail Demand — Michael Walser, 169 Creamer Drive Post-Closing Proceeds",
      body: "VIA CERTIFIED MAIL — RETURN RECEIPT REQUESTED\n\nMichael Walser\n[Florida Address TBD]\n\nRe: Demand for Accounting and Distribution of Post-Closing Proceeds\n    169 Creamer Drive, Alpharetta, Georgia 30004\n\nDear Mr. Walser:\n\nThis firm represents Troy Miller in connection with the above-referenced matter. Mr. Miller is a co-owner/joint venture partner in the property formerly located at 169 Creamer Drive, Alpharetta, Georgia 30004, Forsyth County.\n\nPursuant to Georgia law, including O.C.G.A. § 23-2-70 (equitable accounting between cotenants), we hereby demand that you provide a complete and verified accounting of all post-closing proceeds from the sale of the above property within thirty (30) days of your receipt of this letter.\n\nOur client's verified contributions include:\n• $65,000+ in property improvements\n• $60,000 in SBA valuation carrying costs ($1,250/mo × ~48 months)\n• $6,800 in painting and labor (COVID sale preparation)\n• Full tenant management and ongoing maintenance\n\nAcknowledged offsets:\n• ($50,000) — loan associated with Mr. Miller\n• ($3,500) — remaining auto and boom loans\n\nYour claimed improvements (A/C, roof, asphalt) estimated verbally at ~$35,000 remain unverified. No documentation has been provided despite repeated requests.\n\nIf a satisfactory accounting and equitable distribution is not received within 30 days, we are authorized to file suit in the Superior Court of Forsyth County, Georgia, seeking:\n1. Full accounting and reconciliation\n2. Breach of contract damages\n3. Unjust enrichment recovery\n4. Prejudgment interest as allowed by Georgia law\n5. Attorney fees and litigation costs\n\nPlease direct all future communications to this office.\n\nVery truly yours,\n\nKevan Burns, Esq.\nUNYKORN // LAW\nlegal@unykorn.org",
      to: "michael@bestlyfegroup.com",
      from: "legal@unykorn.org",
      privileged: true,
      workProduct: true,
      matterId: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      createdAt: "2026-04-07T11:00:00Z",
      updatedAt: "2026-04-07T11:00:00Z",
      tags: ["certified-demand", "attorney-privileged", "opposing-party", "creamer-drive"],
    },
  ];
}

function seedAudit(): AuditRecord[] {
  const now = new Date();
  const entries: Omit<AuditRecord, "contentHash" | "previousEntryHash">[] = [
    { id: uuidv4(), timestamp: new Date(now.getTime() - 7200000).toISOString(), action: "intake_created", category: "intake", actor: "system", actorType: "system", resourceType: "intake", resourceId: "INT-2026-001", description: "New intake created: Leavitt cryptocurrency fraud case", metadata: { matterType: "cryptocurrency_fraud" } },
    { id: uuidv4(), timestamp: new Date(now.getTime() - 6800000).toISOString(), action: "conflict_check_initiated", category: "compliance", actor: "compliance-agent-001", actorType: "agent", resourceType: "intake", resourceId: "INT-2026-001", description: "Automated conflict check initiated for Leavitt intake", metadata: { adverseParties: 2 } },
    { id: uuidv4(), timestamp: new Date(now.getTime() - 6400000).toISOString(), action: "conflict_check_cleared", category: "compliance", actor: "compliance-agent-001", actorType: "agent", resourceType: "intake", resourceId: "INT-2026-001", description: "Conflict check cleared — no adverse relationships found", metadata: { result: "cleared" } },
    { id: uuidv4(), timestamp: new Date(now.getTime() - 5400000).toISOString(), action: "document_drafted", category: "document", actor: "document-agent-003", actorType: "agent", resourceType: "document", resourceId: "DOC-DL-001", description: "Demand letter drafted for Creamer Drive post-closing proceeds", metadata: { confidence: 0.87, wordCount: 1240 } },
    { id: uuidv4(), timestamp: new Date(now.getTime() - 4800000).toISOString(), action: "approval_submitted", category: "approval", actor: "kevan-burns", actorType: "human", resourceType: "approval", resourceId: "APR-2026-001", description: "Demand letter submitted for attorney review", metadata: { category: "demand_letter" } },
    { id: uuidv4(), timestamp: new Date(now.getTime() - 3600000).toISOString(), action: "research_completed", category: "research", actor: "research-agent-002", actorType: "agent", resourceType: "research", resourceId: "RES-GA-001", description: "Georgia property law research completed — 12 authorities found", metadata: { authorities: 12, jurisdiction: "GA" } },
    { id: uuidv4(), timestamp: new Date(now.getTime() - 1800000).toISOString(), action: "forensic_wallet_traced", category: "forensics", actor: "forensic-agent-001", actorType: "agent", resourceType: "wallet", resourceId: "TFake2victim", description: "Suspect wallet traced on TRON — $36,150 USDT flow identified", metadata: { chain: "TRON", amount: "$36,150", riskLevel: "critical" } },
    { id: uuidv4(), timestamp: new Date(now.getTime() - 900000).toISOString(), action: "task_completed", category: "workflow", actor: "intake-agent-001", actorType: "agent", resourceType: "task", resourceId: "TASK-001", description: "Initial case review task completed for intake pipeline", metadata: { workflowType: "intake_pipeline" } },
    { id: uuidv4(), timestamp: new Date(now.getTime() - 300000).toISOString(), action: "communication_drafted", category: "communication", actor: "comm-agent-001", actorType: "agent", resourceType: "communication", resourceId: "COMM-001", description: "Client update email drafted for TRON fraud investigation", metadata: { channel: "email", privileged: false } },
    { id: uuidv4(), timestamp: new Date(now.getTime() - 60000).toISOString(), action: "agent_heartbeat", category: "system", actor: "system", actorType: "system", resourceType: "agent_network", resourceId: "network-7332", description: `Agent network health check — ${AGENT_NETWORK.total}/${AGENT_NETWORK.total} agents responding`, metadata: { totalAgents: AGENT_NETWORK.total, healthy: AGENT_NETWORK.total, chain: 7332 } },
    // ── Troy Miller / Creamer Drive Audit Trail ──
    { id: uuidv4(), timestamp: new Date(now.getTime() - 86400000).toISOString(), action: "intake_created", category: "intake", actor: "kevan-burns", actorType: "human", resourceType: "intake", resourceId: "INT-2026-TROY", description: "New intake created: Troy Miller — 169 Creamer Drive property dispute ($143K est.)", metadata: { matterType: "civil_property", estimatedValue: 143300, client: "Troy Miller" } },
    { id: uuidv4(), timestamp: new Date(now.getTime() - 85800000).toISOString(), action: "conflict_check_initiated", category: "compliance", actor: "compliance-agent-001", actorType: "agent", resourceType: "intake", resourceId: "INT-2026-TROY", description: "Conflict check initiated — Troy Miller vs. Michael Walser / BestLyfe Group", metadata: { adverseParties: ["Michael Walser", "BestLyfe Group"] } },
    { id: uuidv4(), timestamp: new Date(now.getTime() - 85200000).toISOString(), action: "conflict_check_cleared", category: "compliance", actor: "compliance-agent-001", actorType: "agent", resourceType: "intake", resourceId: "INT-2026-TROY", description: "Conflict check cleared — no adverse relationships with Walser or BestLyfe Group", metadata: { result: "cleared" } },
    { id: uuidv4(), timestamp: new Date(now.getTime() - 82800000).toISOString(), action: "intake_created", category: "intake", actor: "kevan-burns", actorType: "human", resourceType: "matter", resourceId: "UNY-CIV-2026-003", description: "Intake accepted — matter created: UNY-CIV-2026-003 (169 Creamer Drive)", metadata: { matterId: "a1b2c3d4-e5f6-7890-abcd-ef1234567890" } },
    { id: uuidv4(), timestamp: new Date(now.getTime() - 79200000).toISOString(), action: "research_completed", category: "research", actor: "research-agent-001", actorType: "agent", resourceType: "research", resourceId: "RES-GA-COTENANT", description: "Georgia cotenant/JV law research completed — 8 binding authorities, 4 persuasive", metadata: { authorities: 12, bindingCount: 8, jurisdiction: "GA", topics: ["cotenant", "equitable_accounting", "reimbursement"] } },
    { id: uuidv4(), timestamp: new Date(now.getTime() - 75600000).toISOString(), action: "evidence_uploaded", category: "evidence", actor: "kevan-burns", actorType: "human", resourceType: "evidence", resourceId: "ev-demand-email", description: "Evidence uploaded: Troy Miller demand email to Michael Walser (2026-03-30)", metadata: { filename: "demand_email_2026-03-30.eml", category: "communication" } },
    { id: uuidv4(), timestamp: new Date(now.getTime() - 72000000).toISOString(), action: "evidence_verified", category: "evidence", actor: "document-agent-003", actorType: "agent", resourceType: "evidence", resourceId: "ev-demand-email", description: "Demand email verified — extracted 9 ledger entries, 5 claims, party details", metadata: { ledgerEntries: 9, claims: 5, verificationConfidence: 0.92 } },
    { id: uuidv4(), timestamp: new Date(now.getTime() - 68400000).toISOString(), action: "document_drafted", category: "document", actor: "drafter-agent-001", actorType: "agent", resourceType: "document", resourceId: "appr-001-demand", description: "Formal demand letter drafted for Creamer Drive — citing GA § 23-2-70, GA § 9-3-24", metadata: { confidence: 0.85, wordCount: 890, citations: 3 } },
    { id: uuidv4(), timestamp: new Date(now.getTime() - 64800000).toISOString(), action: "approval_submitted", category: "approval", actor: "drafter-agent-001", actorType: "agent", resourceType: "approval", resourceId: "appr-001-demand", description: "Demand letter submitted to approval queue — assigned to Kevan Burns", metadata: { category: "demand_letter", priority: "high" } },
    { id: uuidv4(), timestamp: new Date(now.getTime() - 61200000).toISOString(), action: "document_drafted", category: "document", actor: "drafter-agent-001", actorType: "agent", resourceType: "document", resourceId: "appr-003-engagement", description: "Engagement letter drafted for Troy Miller — contingency fee structure", metadata: { confidence: 0.90, wordCount: 650 } },
    { id: uuidv4(), timestamp: new Date(now.getTime() - 57600000).toISOString(), action: "document_drafted", category: "document", actor: "drafter-agent-001", actorType: "agent", resourceType: "document", resourceId: "appr-004-certified-demand", description: "Certified mail demand letter drafted — 30-day cure period, GA statutory citations", metadata: { confidence: 0.88, wordCount: 1100, citations: 3 } },
    { id: uuidv4(), timestamp: new Date(now.getTime() - 54000000).toISOString(), action: "communication_drafted", category: "communication", actor: "comm-agent-001", actorType: "agent", resourceType: "communication", resourceId: "COMM-TROY-DOCS", description: "Document request email drafted for Troy Miller — 9 categories of evidence needed", metadata: { channel: "email", documentCategories: 9 } },
    { id: uuidv4(), timestamp: new Date(now.getTime() - 50400000).toISOString(), action: "communication_drafted", category: "communication", actor: "comm-agent-001", actorType: "agent", resourceType: "communication", resourceId: "COMM-TROY-STRATEGY", description: "Case strategy update drafted for Troy Miller — timeline and next steps", metadata: { channel: "secure_message", privileged: true } },
  ];

  let prevHash = "0".repeat(64);
  return entries.map((e) => {
    const contentHash = `${e.id}:${e.timestamp}:${e.action}:${prevHash}`.split("").reduce((a, c) => {
      const h = ((a << 5) - a + c.charCodeAt(0)) | 0;
      return h;
    }, 0).toString(16).padStart(16, "0").repeat(4);
    const record: AuditRecord = { ...e, contentHash, previousEntryHash: prevHash };
    prevHash = contentHash;
    return record;
  });
}

// ─── Store Class ──────────────────────────────────────────────────────────

function seedResearch(): ResearchQuery[] {
  return [
    {
      id: uuidv4(),
      queryType: "statute",
      query: "Georgia cotenant rights to accounting and partition of property proceeds — O.C.G.A. § 44-6-121 et seq. and § 23-2-70",
      jurisdiction: "Georgia",
      status: "completed",
      resultCount: 8,
      createdAt: "2026-04-07T02:00:00Z",
      matterId: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    },
    {
      id: uuidv4(),
      queryType: "case_law",
      query: "Georgia breach of joint venture agreement — cotenant fails to account for sale proceeds after property sold",
      jurisdiction: "Georgia",
      status: "completed",
      resultCount: 12,
      createdAt: "2026-04-07T02:30:00Z",
      matterId: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    },
    {
      id: uuidv4(),
      queryType: "statute",
      query: "Georgia statute of limitations — breach of written contract 6 years (§ 9-3-24) vs unjust enrichment 4 years (§ 9-3-26)",
      jurisdiction: "Georgia",
      status: "completed",
      resultCount: 4,
      createdAt: "2026-04-07T03:00:00Z",
      matterId: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    },
    {
      id: uuidv4(),
      queryType: "case_law",
      query: "Georgia reimbursement for improvements by cotenant — increased property value, equitable lien",
      jurisdiction: "Georgia",
      status: "completed",
      resultCount: 6,
      createdAt: "2026-04-07T03:30:00Z",
      matterId: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    },
    {
      id: uuidv4(),
      queryType: "statute",
      query: "Georgia long-arm statute § 9-10-91 — personal jurisdiction over nonresident who transacted business or owned property in Georgia",
      jurisdiction: "Georgia",
      status: "completed",
      resultCount: 5,
      createdAt: "2026-04-07T04:00:00Z",
      matterId: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    },
    {
      id: uuidv4(),
      queryType: "regulation",
      query: "Florida Enforcement of Foreign Judgments Act — F.S. Ch. 55 (§ 55.501 et seq.) domestication of Georgia judgment",
      jurisdiction: "Florida",
      status: "completed",
      resultCount: 3,
      createdAt: "2026-04-07T04:30:00Z",
      matterId: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    },
    {
      id: uuidv4(),
      queryType: "case_law",
      query: "Florida homestead exemption Art. X § 4 — limitations on judgment collection against Florida homestead property",
      jurisdiction: "Florida",
      status: "completed",
      resultCount: 7,
      createdAt: "2026-04-07T05:00:00Z",
      matterId: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    },
    {
      id: uuidv4(),
      queryType: "brief_analysis",
      query: "Georgia prejudgment interest on breach of contract — availability and calculation methods for property accounting disputes",
      jurisdiction: "Georgia",
      status: "pending",
      resultCount: 0,
      createdAt: "2026-04-07T12:00:00Z",
      matterId: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    },
  ];
}

type Listener = () => void;

class PlatformStore {
  private listeners: Set<Listener> = new Set();
  private _intakes: IntakeRecord[] = [];
  private _approvals: ApprovalRecord[] = [];
  private _tasks: TaskRecord[] = [];
  private _communications: CommRecord[] = [];
  private _audit: AuditRecord[] = [];
  private _notifications: Notification[] = [];
  private _research: ResearchQuery[] = [];
  private _initialized = false;
  private _statsCache: ReturnType<PlatformStore["computeStats"]> | null = null;

  init() {
    if (this._initialized) return;
    this._intakes = load(KEYS.intakes, seedIntakes());
    this._approvals = load(KEYS.approvals, seedApprovals());
    this._tasks = load(KEYS.tasks, seedTasks());
    this._communications = load(KEYS.communications, seedCommunications());
    this._audit = load(KEYS.audit, seedAudit());
    this._notifications = load(KEYS.notifications, []);
    this._research = load(KEYS.research, seedResearch());
    this._initialized = true;
  }

  private notify() {
    this._statsCache = null;
    this.listeners.forEach((fn) => fn());
  }

  private persist() {
    save(KEYS.intakes, this._intakes);
    save(KEYS.approvals, this._approvals);
    save(KEYS.tasks, this._tasks);
    save(KEYS.communications, this._communications);
    save(KEYS.audit, this._audit);
    save(KEYS.notifications, this._notifications);
    save(KEYS.research, this._research);
  }

  subscribe(fn: Listener): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  // ─── Audit Logging ──────────────────────────────────────────────────

  async logAction(action: string, category: string, actor: string, actorType: "human" | "agent" | "system", resourceType: string, resourceId: string, description: string, metadata: Record<string, unknown> = {}) {
    const prev = this._audit[this._audit.length - 1];
    const prevHash = prev?.contentHash || "0".repeat(64);
    const id = uuidv4();
    const timestamp = new Date().toISOString();
    const contentHash = await sha256(`${id}:${timestamp}:${action}:${prevHash}`);
    this._audit.push({ id, timestamp, action, category, actor, actorType, resourceType, resourceId, description, contentHash, previousEntryHash: prevHash, metadata });
    this.persist();
    this.notify();
  }

  // ─── Notifications ──────────────────────────────────────────────────

  addNotification(type: Notification["type"], title: string, message: string) {
    const n: Notification = { id: uuidv4(), type, title, message, timestamp: new Date().toISOString(), read: false };
    this._notifications.unshift(n);
    if (this._notifications.length > 50) this._notifications = this._notifications.slice(0, 50);
    this.persist();
    this.notify();
  }

  markNotificationRead(id: string) {
    const n = this._notifications.find((x) => x.id === id);
    if (n) { n.read = true; this.persist(); this.notify(); }
  }

  clearNotifications() {
    this._notifications = [];
    this.persist();
    this.notify();
  }

  // ─── Intakes ──────────────────────────────────────────────────────────

  get intakes() { this.init(); return this._intakes; }

  createIntake(data: { clientName: string; email: string; phone: string; matterType: string; urgency: Priority; description: string }): IntakeRecord {
    const now = new Date().toISOString();
    const seq = this._intakes.length + 1;
    const record: IntakeRecord = {
      id: uuidv4(),
      caseReference: `INT-2026-${String(seq).padStart(3, "0")}`,
      clientName: data.clientName,
      email: data.email,
      phone: data.phone,
      matterType: data.matterType,
      urgency: data.urgency,
      description: data.description,
      status: "new",
      createdAt: now,
      updatedAt: now,
      notes: [],
      submittedDocuments: [],
    };
    this._intakes.unshift(record);
    truthKernel.state.commit("intake", record.id, record, { actor: "system", actorType: "system", action: "intake_created" });
    this.persist();
    this.logAction("intake_created", "intake", "system", "system", "intake", record.id, `New intake created: ${data.clientName} — ${data.matterType}`, { caseReference: record.caseReference });
    this.addNotification("success", "Intake Received", `Case ${record.caseReference} created for ${data.clientName}`);
    this.notify();
    return record;
  }

  updateIntakeStatus(id: string, status: IntakeStatus, note?: string) {
    const intake = this._intakes.find((i) => i.id === id);
    if (!intake) return;
    const prev = intake.status;
    intake.status = status;
    intake.updatedAt = new Date().toISOString();
    if (note) intake.notes.push(`[${new Date().toLocaleDateString()}] ${note}`);
    truthKernel.state.commit("intake", id, intake, { actor: "kevan-burns", actorType: "user", action: "intake_status_changed" });
    this.persist();
    this.logAction("intake_status_changed", "intake", "kevan-burns", "human", "intake", id, `Intake ${intake.caseReference} status: ${prev} → ${status}`, { previousStatus: prev, newStatus: status });
    this.notify();
  }

  // ─── Approvals ──────────────────────────────────────────────────────

  get approvals() { this.init(); return this._approvals; }

  approveItem(id: string, comments: string = "") {
    const item = this._approvals.find((a) => a.id === id);
    if (!item) return;
    item.status = "approved";
    item.updatedAt = new Date().toISOString();
    item.reviews.push({ reviewerId: "kevan-burns", role: "supervising_attorney", decision: "approved", comments, timestamp: new Date().toISOString() });
    truthKernel.state.commit("approval", id, item, { actor: "kevan-burns", actorType: "user", action: "approval_approved" });
    this.persist();
    this.logAction("approval_approved", "approval", "kevan-burns", "human", "approval", id, `Approved: ${item.title}`, { category: item.category });
    this.addNotification("success", "Approved", `"${item.title}" has been approved`);
    this.notify();
  }

  rejectItem(id: string, reason: string) {
    const item = this._approvals.find((a) => a.id === id);
    if (!item) return;
    item.status = "rejected";
    item.updatedAt = new Date().toISOString();
    item.reviews.push({ reviewerId: "kevan-burns", role: "supervising_attorney", decision: "rejected", comments: reason, timestamp: new Date().toISOString() });
    truthKernel.state.commit("approval", id, item, { actor: "kevan-burns", actorType: "user", action: "approval_rejected" });
    this.persist();
    this.logAction("approval_rejected", "approval", "kevan-burns", "human", "approval", id, `Rejected: ${item.title} — ${reason}`, { category: item.category, reason });
    this.addNotification("warning", "Rejected", `"${item.title}" has been rejected`);
    this.notify();
  }

  requestChanges(id: string, comments: string) {
    const item = this._approvals.find((a) => a.id === id);
    if (!item) return;
    item.status = "requires_source_check";
    item.updatedAt = new Date().toISOString();
    item.reviews.push({ reviewerId: "kevan-burns", role: "supervising_attorney", decision: "changes_requested", comments, timestamp: new Date().toISOString() });
    truthKernel.state.commit("approval", id, item, { actor: "kevan-burns", actorType: "user", action: "approval_changes_requested" });
    this.persist();
    this.logAction("approval_changes_requested", "approval", "kevan-burns", "human", "approval", id, `Changes requested: ${item.title}`, { category: item.category });
    this.addNotification("info", "Changes Requested", `"${item.title}" needs revision`);
    this.notify();
  }

  createApproval(data: { title: string; category: string; summary: string; matterId?: string; priority?: Priority }): ApprovalRecord {
    const now = new Date().toISOString();
    const record: ApprovalRecord = {
      id: uuidv4(),
      title: data.title,
      category: data.category,
      status: "draft",
      priority: data.priority || "routine",
      summary: data.summary,
      confidenceScore: 0,
      submittedBy: "kevan-burns",
      createdAt: now,
      updatedAt: now,
      matterId: data.matterId,
      contentVersion: 1,
      citations: [],
      evidenceLinks: [],
      redlines: [],
      reviews: [],
    };
    this._approvals.unshift(record);
    truthKernel.state.commit("approval", record.id, record, { actor: "kevan-burns", actorType: "user", action: "approval_created" });
    this.persist();
    this.logAction("approval_created", "approval", "kevan-burns", "human", "approval", record.id, `Created approval: ${data.title}`, { category: data.category });
    this.notify();
    return record;
  }

  // ─── Tasks ──────────────────────────────────────────────────────────

  get tasks() { this.init(); return this._tasks; }

  updateTaskStatus(id: string, status: TaskStatus) {
    const task = this._tasks.find((t) => t.id === id);
    if (!task) return;
    const prev = task.status;
    task.status = status;
    task.updatedAt = new Date().toISOString();
    if (status === "completed") task.completedAt = new Date().toISOString();
    truthKernel.state.commit("task", id, task, { actor: "kevan-burns", actorType: "user", action: "task_status_changed" });
    this.persist();
    this.logAction("task_status_changed", "workflow", "kevan-burns", "human", "task", id, `Task "${task.title}" status: ${prev} → ${status}`, { workflowType: task.workflowType });
    this.notify();
  }

  createTask(data: { title: string; workflowType: string; priority: Priority; assignedToAgent: string; description: string; dependsOn?: string[] }): TaskRecord {
    const now = new Date().toISOString();
    const record: TaskRecord = {
      id: uuidv4(),
      title: data.title,
      workflowType: data.workflowType,
      status: "pending",
      priority: data.priority,
      assignedToAgent: data.assignedToAgent,
      description: data.description,
      dependsOn: data.dependsOn || [],
      inputs: {},
      outputs: {},
      createdAt: now,
      updatedAt: now,
    };
    this._tasks.push(record);
    truthKernel.state.commit("task", record.id, record, { actor: "kevan-burns", actorType: "user", action: "task_created" });
    this.persist();
    this.logAction("task_created", "workflow", "kevan-burns", "human", "task", record.id, `Created task: ${data.title}`, { workflowType: data.workflowType, priority: data.priority });
    this.notify();
    return record;
  }

  reassignTask(id: string, agentId: string) {
    const task = this._tasks.find((t) => t.id === id);
    if (!task) return;
    const prev = task.assignedToAgent;
    task.assignedToAgent = agentId;
    task.updatedAt = new Date().toISOString();
    truthKernel.state.commit("task", id, task, { actor: "kevan-burns", actorType: "user", action: "task_reassigned" });
    this.persist();
    this.logAction("task_reassigned", "workflow", "kevan-burns", "human", "task", id, `Task "${task.title}" reassigned: ${prev} → ${agentId}`, { workflowType: task.workflowType });
    this.notify();
  }

  // ─── Communications ──────────────────────────────────────────────────

  get communications() { this.init(); return this._communications; }

  updateCommStatus(id: string, status: CommStatus) {
    const comm = this._communications.find((c) => c.id === id);
    if (!comm) return;
    const prev = comm.status;
    comm.status = status;
    comm.updatedAt = new Date().toISOString();
    if (status === "sent") comm.sentAt = new Date().toISOString();
    truthKernel.state.commit("communication", id, comm, { actor: "kevan-burns", actorType: "user", action: "communication_status_changed" });
    this.persist();
    this.logAction("communication_status_changed", "communication", "kevan-burns", "human", "communication", id, `Communication "${comm.subject}" status: ${prev} → ${status}`, { channel: comm.channel });
    if (status === "approved") this.addNotification("success", "Communication Approved", `"${comm.subject}" approved for sending`);
    this.notify();
  }

  updateCommBody(id: string, body: string) {
    const comm = this._communications.find((c) => c.id === id);
    if (!comm) return;
    comm.body = body;
    comm.updatedAt = new Date().toISOString();
    this.persist();
    this.notify();
  }

  createCommunication(data: { channel: string; subject: string; body: string; to: string; privileged: boolean; workProduct: boolean; matterId: string; tags?: string[] }): CommRecord {
    const now = new Date().toISOString();
    const record: CommRecord = {
      id: uuidv4(),
      channel: data.channel,
      status: "draft",
      subject: data.subject,
      body: data.body,
      to: data.to,
      from: "ops@unykorn.org",
      privileged: data.privileged,
      workProduct: data.workProduct,
      matterId: data.matterId,
      createdAt: now,
      updatedAt: now,
      tags: data.tags || [],
    };
    this._communications.unshift(record);
    truthKernel.state.commit("communication", record.id, record, { actor: "kevan-burns", actorType: "user", action: "communication_drafted" });
    this.persist();
    this.logAction("communication_drafted", "communication", "kevan-burns", "human", "communication", record.id, `Drafted: ${data.subject}`, { channel: data.channel, privileged: data.privileged });
    this.notify();
    return record;
  }

  // ─── Audit ──────────────────────────────────────────────────────────

  get audit() { this.init(); return this._audit; }
  get notifications() { this.init(); return this._notifications; }

  // ─── Research ──────────────────────────────────────────────────────

  get research() { this.init(); return this._research; }

  createResearchQuery(data: { queryType: ResearchQuery["queryType"]; query: string; jurisdiction: string; resultCount: number; matterId?: string }): ResearchQuery {
    const now = new Date().toISOString();
    const record: ResearchQuery = {
      id: uuidv4(),
      queryType: data.queryType,
      query: data.query,
      jurisdiction: data.jurisdiction,
      status: "completed",
      resultCount: data.resultCount,
      createdAt: now,
      matterId: data.matterId,
    };
    this._research.unshift(record);
    truthKernel.state.commit("research", record.id, record, { actor: "kevan-burns", actorType: "user", action: "research_query_executed" });
    this.persist();
    this.logAction("research_query_executed", "research", "kevan-burns", "human", "research", record.id, `Research query: ${data.query.slice(0, 80)}`, { queryType: data.queryType, jurisdiction: data.jurisdiction, resultCount: data.resultCount });
    this.addNotification("info", "Research Complete", `Found ${data.resultCount} authorities for "${data.query.slice(0, 50)}"`);
    this.notify();
    return record;
  }

  deleteResearchQuery(id: string) {
    this._research = this._research.filter((r) => r.id !== id);
    this.persist();
    this.notify();
  }

  // ─── Analytics ──────────────────────────────────────────────────────

  private computeStats() {
    return {
      totalIntakes: this._intakes.length,
      pendingIntakes: this._intakes.filter((i) => i.status === "new" || i.status === "under_review").length,
      totalApprovals: this._approvals.length,
      pendingApprovals: this._approvals.filter((a) => a.status === "in_review" || a.status === "requires_attorney_review" || a.status === "requires_source_check").length,
      approvedCount: this._approvals.filter((a) => a.status === "approved" || a.status === "sent" || a.status === "filed").length,
      totalTasks: this._tasks.length,
      completedTasks: this._tasks.filter((t) => t.status === "completed").length,
      activeTasks: this._tasks.filter((t) => t.status === "in_progress" || t.status === "waiting_approval").length,
      totalComms: this._communications.length,
      pendingComms: this._communications.filter((c) => c.status === "draft" || c.status === "pending_review").length,
      totalAuditEntries: this._audit.length,
      agentCount: AGENT_NETWORK.total || 26,
      activeCases: ACTIVE_CASES.length,
      notifications: this._notifications.filter((n) => !n.read).length,
      totalResearch: this._research.length,
    };
  }

  get stats() {
    this.init();
    if (!this._statsCache) this._statsCache = this.computeStats();
    return this._statsCache;
  }

  getDashboardStats() {
    this.init();
    const s = this.stats;
    const blockedTasks = this._tasks.filter(t => t.status === "blocked").length;
    const taskCompletionRate = s.totalTasks > 0 ? Math.round((s.completedTasks / s.totalTasks) * 100) : 0;
    const approvalRate = s.totalApprovals > 0 ? Math.round((s.approvedCount / s.totalApprovals) * 100) : 0;
    const recentActivity = this._audit.slice(-24).length;
    const kernel = truthKernel.stats;
    return { ...s, blockedTasks, taskCompletionRate, approvalRate, recentActivity, kernel };
  }

  exportAuditLog(): string {
    this.init();
    const header = "id,timestamp,action,category,actor,actorType,resourceType,resourceId,description,contentHash";
    const rows = this._audit.map(e =>
      [e.id, e.timestamp, e.action, e.category, e.actor, e.actorType, e.resourceType, e.resourceId, `"${e.description.replace(/"/g, '""')}"`, e.contentHash].join(",")
    );
    return [header, ...rows].join("\n");
  }

  // ─── Reset ──────────────────────────────────────────────────────────

  reset() {
    Object.values(KEYS).forEach((k) => {
      if (typeof window !== "undefined") localStorage.removeItem(k);
    });
    truthKernel.reset();
    this._initialized = false;
    this.init();
    this.notify();
  }
}

export const store = new PlatformStore();
