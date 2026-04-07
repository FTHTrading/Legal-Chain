/**
 * EVIDENCE CHAIN
 *
 * Legal-grade evidence ingestion on top of ProofKernel.
 * Adds chain-of-custody tracking, privilege/work-product flags,
 * redaction state, preservation holds, authenticity tagging,
 * and human sign-off gates.
 *
 * This is the "legal operations envelope" around the raw
 * content-hash proof layer.
 */

import { fingerprint } from "./state";

// ─── Types ──────────────────────────────────────────────────────────────────

export type AuthenticityStatus =
  | "original" | "certified_copy" | "copy" | "derived"
  | "screenshot" | "reconstructed" | "contested";

export type PrivilegeFlag =
  | "none" | "attorney_client" | "work_product"
  | "joint_defense" | "deliberative_process" | "law_enforcement";

export type RedactionState =
  | "unredacted" | "redaction_pending" | "redacted" | "redaction_log_attached";

export type CustodyAction =
  | "ingested" | "accessed" | "reviewed" | "exported"
  | "copied" | "transferred" | "redacted" | "restored"
  | "preservation_hold_set" | "preservation_hold_released"
  | "privilege_tagged" | "privilege_waived"
  | "authenticated" | "challenged" | "withdrawn";

export interface CustodyEvent {
  id: string;
  evidenceId: string;
  action: CustodyAction;
  actor: string;
  actorRole: string;
  timestamp: string;
  notes?: string;
  /** Hash at time of event (for tamper detection) */
  hashAtEvent: string;
}

export interface EvidenceItem {
  id: string;
  matterId: string;
  /** Link to ProofKernel artifact */
  artifactId: string;

  /** Source metadata */
  sourceType: "client_upload" | "subpoena_response" | "public_record"
    | "chain_analysis" | "osint" | "expert_report" | "court_filing"
    | "law_enforcement" | "third_party" | "internal_memo";
  sourceDescription: string;
  sourceContactName?: string;

  /** Legal classification */
  authenticity: AuthenticityStatus;
  privilege: PrivilegeFlag;
  redactionState: RedactionState;

  /** Hashing */
  originalHash: string;     // SHA-256 at ingestion
  currentHash: string;      // SHA-256 of current version (changes if redacted)

  /** Preservation */
  preservationHold: boolean;
  preservationHoldSetBy?: string;
  preservationHoldSetAt?: string;

  /** Human sign-off */
  ingestedBy: string;
  ingestedByRole: string;
  ingestedAt: string;
  authenticatedBy?: string;
  authenticatedAt?: string;

  /** Fact tagging (from Constitution §II.B) */
  factTag: "alleged" | "client_provided" | "sourced" | "verified" | "disputed" | "inferred";

  /** Matter context */
  description: string;
  exhibitNumber?: string;
  batesRange?: string;    // e.g., "DEF-000001 to DEF-000045"

  /** Chain of custody */
  custodyChain: CustodyEvent[];

  /** Status */
  status: "active" | "withdrawn" | "challenged" | "excluded";
  withdrawnReason?: string;
  challengedBy?: string;
  challengedAt?: string;

  metadata: Record<string, unknown>;
}

// ─── Storage ────────────────────────────────────────────────────────────────

const KEYS = {
  evidence: "unykorn_evidence_chain",
} as const;

function load<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); }
  catch { return fallback; }
}

function save(key: string, data: unknown): void {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(key, JSON.stringify(data)); }
  catch { /* storage full */ }
}

// ─── EvidenceChain ──────────────────────────────────────────────────────────

export class EvidenceChain {
  private items: EvidenceItem[] = [];
  private loaded = false;

  private ensureLoaded(): void {
    if (this.loaded) return;
    this.items = load(KEYS.evidence, []);
    this.loaded = true;
  }

  private persist(): void {
    save(KEYS.evidence, this.items);
  }

  // ─── Ingestion ──────────────────────────────────────────────────────

  /** Ingest evidence with full metadata and initial custody event. */
  ingest(params: {
    matterId: string;
    artifactId: string;
    sourceType: EvidenceItem["sourceType"];
    sourceDescription: string;
    sourceContactName?: string;
    authenticity: AuthenticityStatus;
    privilege: PrivilegeFlag;
    originalHash: string;
    ingestedBy: string;
    ingestedByRole: string;
    factTag: EvidenceItem["factTag"];
    description: string;
    exhibitNumber?: string;
    batesRange?: string;
    metadata?: Record<string, unknown>;
  }): EvidenceItem {
    this.ensureLoaded();
    const now = new Date().toISOString();
    const id = crypto.randomUUID();

    const initialCustody: CustodyEvent = {
      id: crypto.randomUUID(),
      evidenceId: id,
      action: "ingested",
      actor: params.ingestedBy,
      actorRole: params.ingestedByRole,
      timestamp: now,
      hashAtEvent: params.originalHash,
    };

    const item: EvidenceItem = {
      id,
      matterId: params.matterId,
      artifactId: params.artifactId,
      sourceType: params.sourceType,
      sourceDescription: params.sourceDescription,
      sourceContactName: params.sourceContactName,
      authenticity: params.authenticity,
      privilege: params.privilege,
      redactionState: "unredacted",
      originalHash: params.originalHash,
      currentHash: params.originalHash,
      preservationHold: false,
      ingestedBy: params.ingestedBy,
      ingestedByRole: params.ingestedByRole,
      ingestedAt: now,
      factTag: params.factTag,
      description: params.description,
      exhibitNumber: params.exhibitNumber,
      batesRange: params.batesRange,
      custodyChain: [initialCustody],
      status: "active",
      metadata: params.metadata || {},
    };

    this.items.push(item);
    this.persist();
    return item;
  }

  // ─── Custody Events ─────────────────────────────────────────────────

  /** Add a custody event to an evidence item. */
  addCustodyEvent(evidenceId: string, event: {
    action: CustodyAction;
    actor: string;
    actorRole: string;
    notes?: string;
    currentHash: string;
  }): CustodyEvent | null {
    this.ensureLoaded();
    const item = this.items.find(e => e.id === evidenceId);
    if (!item) return null;

    const ce: CustodyEvent = {
      id: crypto.randomUUID(),
      evidenceId,
      action: event.action,
      actor: event.actor,
      actorRole: event.actorRole,
      timestamp: new Date().toISOString(),
      notes: event.notes,
      hashAtEvent: event.currentHash,
    };

    item.custodyChain.push(ce);
    item.currentHash = event.currentHash;
    this.persist();
    return ce;
  }

  // ─── Preservation Hold ────────────────────────────────────────────

  setPreservationHold(evidenceId: string, setBy: string): void {
    this.ensureLoaded();
    const item = this.items.find(e => e.id === evidenceId);
    if (!item) return;
    item.preservationHold = true;
    item.preservationHoldSetBy = setBy;
    item.preservationHoldSetAt = new Date().toISOString();
    this.addCustodyEvent(evidenceId, {
      action: "preservation_hold_set", actor: setBy,
      actorRole: "supervising_attorney", currentHash: item.currentHash,
    });
  }

  releasePreservationHold(evidenceId: string, releasedBy: string, reason: string): void {
    this.ensureLoaded();
    const item = this.items.find(e => e.id === evidenceId);
    if (!item || !item.preservationHold) return;
    item.preservationHold = false;
    this.addCustodyEvent(evidenceId, {
      action: "preservation_hold_released", actor: releasedBy,
      actorRole: "supervising_attorney", currentHash: item.currentHash,
      notes: reason,
    });
  }

  // ─── Privilege ────────────────────────────────────────────────────

  tagPrivilege(evidenceId: string, privilege: PrivilegeFlag, taggedBy: string): void {
    this.ensureLoaded();
    const item = this.items.find(e => e.id === evidenceId);
    if (!item) return;
    item.privilege = privilege;
    this.addCustodyEvent(evidenceId, {
      action: "privilege_tagged", actor: taggedBy,
      actorRole: "counsel", currentHash: item.currentHash,
      notes: `Privilege: ${privilege}`,
    });
  }

  waivePrivilege(evidenceId: string, waivedBy: string, reason: string): void {
    this.ensureLoaded();
    const item = this.items.find(e => e.id === evidenceId);
    if (!item || item.privilege === "none") return;
    const oldPrivilege = item.privilege;
    item.privilege = "none";
    this.addCustodyEvent(evidenceId, {
      action: "privilege_waived", actor: waivedBy,
      actorRole: "supervising_attorney", currentHash: item.currentHash,
      notes: `Waived ${oldPrivilege}: ${reason}`,
    });
  }

  // ─── Authentication ──────────────────────────────────────────────

  authenticate(evidenceId: string, authenticatedBy: string): void {
    this.ensureLoaded();
    const item = this.items.find(e => e.id === evidenceId);
    if (!item) return;
    item.authenticatedBy = authenticatedBy;
    item.authenticatedAt = new Date().toISOString();
    item.authenticity = "original";
    this.addCustodyEvent(evidenceId, {
      action: "authenticated", actor: authenticatedBy,
      actorRole: "supervising_attorney", currentHash: item.currentHash,
    });
  }

  challenge(evidenceId: string, challengedBy: string, reason: string): void {
    this.ensureLoaded();
    const item = this.items.find(e => e.id === evidenceId);
    if (!item) return;
    item.status = "challenged";
    item.challengedBy = challengedBy;
    item.challengedAt = new Date().toISOString();
    item.authenticity = "contested";
    this.addCustodyEvent(evidenceId, {
      action: "challenged", actor: challengedBy,
      actorRole: "opposing_counsel", currentHash: item.currentHash,
      notes: reason,
    });
  }

  // ─── Redaction ────────────────────────────────────────────────────

  recordRedaction(evidenceId: string, newHash: string, redactedBy: string, notes: string): void {
    this.ensureLoaded();
    const item = this.items.find(e => e.id === evidenceId);
    if (!item) return;
    if (item.preservationHold) return; // cannot redact under hold
    item.redactionState = "redacted";
    this.addCustodyEvent(evidenceId, {
      action: "redacted", actor: redactedBy,
      actorRole: "paralegal", currentHash: newHash, notes,
    });
  }

  // ─── Queries ──────────────────────────────────────────────────────

  get(id: string): EvidenceItem | null {
    this.ensureLoaded();
    return this.items.find(e => e.id === id) ?? null;
  }

  getForMatter(matterId: string): EvidenceItem[] {
    this.ensureLoaded();
    return this.items.filter(e => e.matterId === matterId);
  }

  getPrivileged(matterId: string): EvidenceItem[] {
    this.ensureLoaded();
    return this.items.filter(e => e.matterId === matterId && e.privilege !== "none");
  }

  getUnderHold(): EvidenceItem[] {
    this.ensureLoaded();
    return this.items.filter(e => e.preservationHold);
  }

  getCustodyChain(evidenceId: string): CustodyEvent[] {
    this.ensureLoaded();
    const item = this.items.find(e => e.id === evidenceId);
    return item?.custodyChain ?? [];
  }

  /** Verify hash chain — does currentHash match the latest custody event? */
  verifyIntegrity(evidenceId: string): { valid: boolean; issue?: string } {
    this.ensureLoaded();
    const item = this.items.find(e => e.id === evidenceId);
    if (!item) return { valid: false, issue: "Evidence not found" };
    if (item.custodyChain.length === 0) return { valid: false, issue: "No custody events" };
    const latest = item.custodyChain[item.custodyChain.length - 1];
    if (latest.hashAtEvent !== item.currentHash) {
      return { valid: false, issue: `Hash mismatch: current=${item.currentHash}, lastEvent=${latest.hashAtEvent}` };
    }
    return { valid: true };
  }

  // ─── Stats ────────────────────────────────────────────────────────

  get allEvidence(): EvidenceItem[] { this.ensureLoaded(); return [...this.items]; }
  get evidenceCount(): number { this.ensureLoaded(); return this.items.length; }
  get holdCount(): number { this.ensureLoaded(); return this.items.filter(e => e.preservationHold).length; }
  get privilegedCount(): number { this.ensureLoaded(); return this.items.filter(e => e.privilege !== "none").length; }
  get challengedCount(): number { this.ensureLoaded(); return this.items.filter(e => e.status === "challenged").length; }

  /** Purge all evidence chain data. */
  reset(): void {
    this.items = [];
    this.loaded = true;
    if (typeof window !== "undefined") localStorage.removeItem(KEYS.evidence);
  }
}
