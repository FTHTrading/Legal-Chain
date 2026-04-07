/**
 * ATTESTATION LAYER
 *
 * First-class trust signals from five source classes:
 *   - human operators (counsel, paralegals, clients)
 *   - institutions (courts, regulators, banks, registries)
 *   - AI agents (kernel agents, oracle spine, mesh agents)
 *   - counterparties (opposing counsel, co-counsel, vendors)
 *   - oracle feeds (price feeds, chain state, public records)
 *
 * An Attestation is a signed assertion about a specific entity or artifact,
 * carrying a confidence score, optional expiry, and optional chain anchor.
 * Attestations turn "history" into verifiable trust signals.
 */

import { fingerprint } from "./state";

// ─── Types ──────────────────────────────────────────────────────────────────

export type AttesterClass =
  | "human" | "institution" | "agent" | "counterparty" | "oracle";

export type AttestationType =
  | "identity_verified" | "document_authentic" | "evidence_valid"
  | "condition_met" | "payment_confirmed" | "milestone_reached"
  | "compliance_check" | "risk_assessment" | "chain_state"
  | "price_feed" | "court_ruling" | "regulatory_filing"
  | "ownership_confirmed" | "appraisal" | "inspection"
  | "signature_verified" | "conflict_clear" | "authority_cited"
  | "model_output" | "simulation_result" | "custom";

export type AttestationStatus = "active" | "revoked" | "expired" | "superseded";

export interface Attestation {
  id: string;
  /** Target entity or artifact being attested to */
  targetType: string;      // EntityType | "artifact" | "manifest" | "payment" | "twin_run"
  targetId: string;
  /** What is being asserted */
  type: AttestationType;
  assertion: string;       // human-readable claim
  /** Who is attesting */
  attesterClass: AttesterClass;
  attesterId: string;
  attesterName: string;
  attesterCredentials?: string;
  /** Trust signal */
  confidence: number;      // 0.0 – 1.0
  evidence?: string[];     // artifact IDs backing the attestation
  /** Integrity */
  contentFingerprint: string;
  /** Chain anchoring (optional) */
  chainAnchor?: {
    chain: string;
    txHash: string;
    blockNumber: number;
    anchoredAt: string;
  };
  /** Lifecycle */
  status: AttestationStatus;
  createdAt: string;
  expiresAt?: string;
  revokedAt?: string;
  revokedReason?: string;
  supersededBy?: string;
  /** Scope */
  matterId?: string;
  metadata: Record<string, unknown>;
}

export interface AttestationQuery {
  targetType?: string;
  targetId?: string;
  attesterClass?: AttesterClass;
  attesterId?: string;
  type?: AttestationType;
  status?: AttestationStatus;
  matterId?: string;
  minConfidence?: number;
}

// ─── Storage ────────────────────────────────────────────────────────────────

const STORAGE_KEY = "unykorn_truth_attestations";

function loadAttestations(): Attestation[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); }
  catch { return []; }
}

function saveAttestations(data: Attestation[]): void {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }
  catch { /* storage full */ }
}

// ─── AttestationRegistry ────────────────────────────────────────────────────

export class AttestationRegistry {
  private records: Attestation[] = [];
  private loaded = false;

  private ensureLoaded(): void {
    if (!this.loaded) { this.records = loadAttestations(); this.loaded = true; }
  }

  /** Create a new attestation. */
  attest(params: {
    targetType: string;
    targetId: string;
    type: AttestationType;
    assertion: string;
    attesterClass: AttesterClass;
    attesterId: string;
    attesterName: string;
    attesterCredentials?: string;
    confidence: number;
    evidence?: string[];
    matterId?: string;
    expiresAt?: string;
    metadata?: Record<string, unknown>;
  }): Attestation {
    this.ensureLoaded();

    const attestation: Attestation = {
      id: crypto.randomUUID(),
      targetType: params.targetType,
      targetId: params.targetId,
      type: params.type,
      assertion: params.assertion,
      attesterClass: params.attesterClass,
      attesterId: params.attesterId,
      attesterName: params.attesterName,
      attesterCredentials: params.attesterCredentials,
      confidence: Math.max(0, Math.min(1, params.confidence)),
      evidence: params.evidence,
      contentFingerprint: fingerprint({
        targetType: params.targetType,
        targetId: params.targetId,
        type: params.type,
        assertion: params.assertion,
        attesterId: params.attesterId,
        confidence: params.confidence,
      }),
      status: "active",
      createdAt: new Date().toISOString(),
      expiresAt: params.expiresAt,
      matterId: params.matterId,
      metadata: params.metadata || {},
    };

    this.records.push(attestation);
    saveAttestations(this.records);
    return attestation;
  }

  /** Revoke an attestation. */
  revoke(id: string, reason: string): void {
    this.ensureLoaded();
    const a = this.records.find(x => x.id === id);
    if (!a || a.status !== "active") return;
    a.status = "revoked";
    a.revokedAt = new Date().toISOString();
    a.revokedReason = reason;
    saveAttestations(this.records);
  }

  /** Supersede an attestation with a new one. */
  supersede(oldId: string, newAttestation: Parameters<AttestationRegistry["attest"]>[0]): Attestation {
    this.ensureLoaded();
    const old = this.records.find(x => x.id === oldId);
    if (old && old.status === "active") {
      old.status = "superseded";
    }
    const created = this.attest(newAttestation);
    if (old) old.supersededBy = created.id;
    saveAttestations(this.records);
    return created;
  }

  /** Anchor an attestation to a chain. */
  anchor(id: string, chain: string, txHash: string, blockNumber: number): void {
    this.ensureLoaded();
    const a = this.records.find(x => x.id === id);
    if (!a) return;
    a.chainAnchor = { chain, txHash, blockNumber, anchoredAt: new Date().toISOString() };
    saveAttestations(this.records);
  }

  /** Query attestations with filters. */
  query(q: AttestationQuery): Attestation[] {
    this.ensureLoaded();
    const now = new Date().toISOString();
    return this.records.filter(a => {
      if (q.targetType && a.targetType !== q.targetType) return false;
      if (q.targetId && a.targetId !== q.targetId) return false;
      if (q.attesterClass && a.attesterClass !== q.attesterClass) return false;
      if (q.attesterId && a.attesterId !== q.attesterId) return false;
      if (q.type && a.type !== q.type) return false;
      if (q.status && a.status !== q.status) return false;
      if (q.matterId && a.matterId !== q.matterId) return false;
      if (q.minConfidence && a.confidence < q.minConfidence) return false;
      // Auto-expire
      if (a.status === "active" && a.expiresAt && a.expiresAt < now) return false;
      return true;
    });
  }

  /** Get all active attestations for a target. */
  getForTarget(targetType: string, targetId: string): Attestation[] {
    return this.query({ targetType, targetId, status: "active" });
  }

  /** Aggregate trust score for a target (weighted average of active attestation confidence). */
  trustScore(targetType: string, targetId: string): number {
    const active = this.getForTarget(targetType, targetId);
    if (active.length === 0) return 0;
    // Weight by attester class: institutions > human > oracle > counterparty > agent
    const weights: Record<AttesterClass, number> = {
      institution: 1.0, human: 0.9, oracle: 0.8, counterparty: 0.7, agent: 0.6,
    };
    let totalWeight = 0;
    let weightedSum = 0;
    for (const a of active) {
      const w = weights[a.attesterClass] ?? 0.5;
      weightedSum += a.confidence * w;
      totalWeight += w;
    }
    return totalWeight > 0 ? weightedSum / totalWeight : 0;
  }

  /** Get by ID. */
  get(id: string): Attestation | null {
    this.ensureLoaded();
    return this.records.find(x => x.id === id) ?? null;
  }

  // ─── Stats ────────────────────────────────────────────────────────

  get allAttestations(): Attestation[] { this.ensureLoaded(); return [...this.records]; }

  get count(): number { this.ensureLoaded(); return this.records.length; }
  get activeCount(): number {
    this.ensureLoaded();
    return this.records.filter(a => a.status === "active").length;
  }
  get anchoredCount(): number {
    this.ensureLoaded();
    return this.records.filter(a => a.chainAnchor).length;
  }

  /** Purge all attestation data. */
  reset(): void {
    this.records = [];
    this.loaded = true;
    if (typeof window !== "undefined") localStorage.removeItem(STORAGE_KEY);
  }
}
