/**
 * REPLAY ENGINE
 *
 * Deterministic verification, state replay, and portable export bundles.
 *
 * Three capabilities:
 *   1. **Verify** — walk the hash chain for any entity and confirm integrity
 *   2. **Replay** — rebuild canonical state from a sequence of truth records
 *   3. **Export** — produce a self-contained audit bundle for partners/investors
 *
 * The export bundle is a JSON manifest with all truth records, attestations,
 * proof manifests, settlement events, and state roots included — portable
 * outside the app.
 */

import type { TruthRecord, EntityType } from "./state";
import type { Attestation } from "./attestations";
import type { ProofManifest, ProofAnchor, Artifact, LineageRecord } from "./proof";
import type { PaymentEvent, MilestoneGate, RightsRecord, RevenueEvent } from "./settlement";
import type { StateRoot } from "./roots";
import { fingerprint } from "./state";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface VerifyResult {
  entityType: EntityType;
  entityId: string;
  totalVersions: number;
  valid: boolean;
  brokenAt?: number;
  details: Array<{
    version: number;
    fingerprintMatch: boolean;
    chainLinkValid: boolean;
  }>;
}

export interface ReplayFrame {
  version: number;
  entityType: EntityType;
  entityId: string;
  data: unknown;
  fingerprint: string;
  timestamp: string;
  action: string;
}

export interface ExportBundle {
  format: "unykorn-truth-bundle-v1";
  exportedAt: string;
  exportedBy: string;
  scope: ExportScope;
  /** Core data */
  truthRecords: TruthRecord[];
  attestations: Attestation[];
  artifacts: Artifact[];
  manifests: ProofManifest[];
  anchors: ProofAnchor[];
  lineage: LineageRecord[];
  payments: PaymentEvent[];
  milestones: MilestoneGate[];
  rights: RightsRecord[];
  revenue: RevenueEvent[];
  roots: StateRoot[];
  /** Integrity */
  bundleFingerprint: string;
  recordCount: number;
}

export type ExportScope =
  | { type: "matter"; matterId: string }
  | { type: "entity"; entityType: EntityType; entityId: string }
  | { type: "full" };

// ─── ReplayEngine ───────────────────────────────────────────────────────────

/**
 * Stateless engine — all data passed in from kernel.
 * No localStorage, no side effects.
 */
export class ReplayEngine {

  // ─── Verify ─────────────────────────────────────────────────────────

  /** Walk the hash chain for an entity and verify every link. */
  verify(records: TruthRecord[], entityType: EntityType, entityId: string): VerifyResult {
    const chain = records
      .filter(r => r.entityType === entityType && r.entityId === entityId)
      .sort((a, b) => a.version - b.version);

    if (chain.length === 0) {
      return { entityType, entityId, totalVersions: 0, valid: true, details: [] };
    }

    const details: VerifyResult["details"] = [];
    let valid = true;
    let brokenAt: number | undefined;

    for (let i = 0; i < chain.length; i++) {
      const rec = chain[i];
      const fpMatch = fingerprint(rec.data) === rec.fingerprint;
      const chainLink = i === 0
        ? rec.previousFingerprint === null
        : rec.previousFingerprint === chain[i - 1].fingerprint;

      details.push({ version: rec.version, fingerprintMatch: fpMatch, chainLinkValid: chainLink });

      if ((!fpMatch || !chainLink) && valid) {
        valid = false;
        brokenAt = rec.version;
      }
    }

    return { entityType, entityId, totalVersions: chain.length, valid, brokenAt, details };
  }

  /** Verify all entities of a given type. */
  verifyAll(records: TruthRecord[], entityType: EntityType): VerifyResult[] {
    const ids = new Set<string>();
    for (const r of records) {
      if (r.entityType === entityType) ids.add(r.entityId);
    }
    return Array.from(ids).map(id => this.verify(records, entityType, id));
  }

  // ─── Replay ─────────────────────────────────────────────────────────

  /** Replay the history of an entity as ordered frames for display/audit. */
  replay(records: TruthRecord[], entityType: EntityType, entityId: string): ReplayFrame[] {
    return records
      .filter(r => r.entityType === entityType && r.entityId === entityId)
      .sort((a, b) => a.version - b.version)
      .map(r => ({
        version: r.version,
        entityType: r.entityType,
        entityId: r.entityId,
        data: r.data,
        fingerprint: r.fingerprint,
        timestamp: r.origin.timestamp,
        action: r.origin.action,
      }));
  }

  /** Replay all records for a matter (across all entity types). */
  replayMatter(records: TruthRecord[], matterId: string): ReplayFrame[] {
    const matterRecords = records.filter(r => {
      const d = r.data as Record<string, unknown>;
      return r.entityId === matterId || d.matterId === matterId;
    });
    return matterRecords
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
      .map(r => ({
        version: r.version,
        entityType: r.entityType,
        entityId: r.entityId,
        data: r.data,
        fingerprint: r.fingerprint,
        timestamp: r.origin.timestamp,
        action: r.origin.action,
      }));
  }

  // ─── Export ─────────────────────────────────────────────────────────

  /** Build a self-contained audit bundle. */
  buildBundle(params: {
    scope: ExportScope;
    exportedBy: string;
    truthRecords: TruthRecord[];
    attestations: Attestation[];
    artifacts: Artifact[];
    manifests: ProofManifest[];
    anchors: ProofAnchor[];
    lineage: LineageRecord[];
    payments: PaymentEvent[];
    milestones: MilestoneGate[];
    rights: RightsRecord[];
    revenue: RevenueEvent[];
    roots: StateRoot[];
  }): ExportBundle {
    const { scope, exportedBy, ...data } = params;

    // Filter by scope
    const filtered = this.filterByScope(data, scope);

    const recordCount =
      filtered.truthRecords.length + filtered.attestations.length +
      filtered.artifacts.length + filtered.manifests.length +
      filtered.anchors.length + filtered.lineage.length +
      filtered.payments.length + filtered.milestones.length +
      filtered.rights.length + filtered.revenue.length +
      filtered.roots.length;

    const bundleFingerprint = fingerprint({
      truthRecordFps: filtered.truthRecords.map(r => r.fingerprint).sort(),
      attestationIds: filtered.attestations.map(a => a.id).sort(),
      artifactHashes: filtered.artifacts.map(a => a.contentHash).sort(),
      manifestHashes: filtered.manifests.map(m => m.manifestHash).sort(),
      paymentIds: filtered.payments.map(p => p.id).sort(),
      rootHashes: filtered.roots.map(r => r.rootHash).sort(),
    });

    return {
      format: "unykorn-truth-bundle-v1",
      exportedAt: new Date().toISOString(),
      exportedBy,
      scope,
      ...filtered,
      bundleFingerprint,
      recordCount,
    };
  }

  /** Verify a bundle's internal integrity. */
  verifyBundle(bundle: ExportBundle): { valid: boolean; issues: string[] } {
    const issues: string[] = [];

    // Re-compute bundle fingerprint
    const expected = fingerprint({
      truthRecordFps: bundle.truthRecords.map(r => r.fingerprint).sort(),
      attestationIds: bundle.attestations.map(a => a.id).sort(),
      artifactHashes: bundle.artifacts.map(a => a.contentHash).sort(),
      manifestHashes: bundle.manifests.map(m => m.manifestHash).sort(),
      paymentIds: bundle.payments.map(p => p.id).sort(),
      rootHashes: bundle.roots.map(r => r.rootHash).sort(),
    });
    if (expected !== bundle.bundleFingerprint) {
      issues.push(`Bundle fingerprint mismatch: expected ${expected}, got ${bundle.bundleFingerprint}`);
    }

    // Verify truth record chains
    const entityKeys = new Set(bundle.truthRecords.map(r => `${r.entityType}:${r.entityId}`));
    for (const key of entityKeys) {
      const [et, eid] = key.split(":", 2);
      const result = this.verify(bundle.truthRecords, et as EntityType, eid);
      if (!result.valid) {
        issues.push(`Hash chain broken for ${key} at version ${result.brokenAt}`);
      }
    }

    // Verify artifact content fingerprints
    for (const a of bundle.attestations) {
      const recomputed = fingerprint({
        targetType: a.targetType,
        targetId: a.targetId,
        type: a.type,
        assertion: a.assertion,
        attesterId: a.attesterId,
        confidence: a.confidence,
      });
      if (recomputed !== a.contentFingerprint) {
        issues.push(`Attestation ${a.id} fingerprint mismatch`);
      }
    }

    return { valid: issues.length === 0, issues };
  }

  // ─── Private ──────────────────────────────────────────────────────

  private filterByScope(data: {
    truthRecords: TruthRecord[];
    attestations: Attestation[];
    artifacts: Artifact[];
    manifests: ProofManifest[];
    anchors: ProofAnchor[];
    lineage: LineageRecord[];
    payments: PaymentEvent[];
    milestones: MilestoneGate[];
    rights: RightsRecord[];
    revenue: RevenueEvent[];
    roots: StateRoot[];
  }, scope: ExportScope) {
    if (scope.type === "full") return data;

    if (scope.type === "entity") {
      const { entityType, entityId } = scope;
      return {
        truthRecords: data.truthRecords.filter(r => r.entityType === entityType && r.entityId === entityId),
        attestations: data.attestations.filter(a => a.targetType === entityType && a.targetId === entityId),
        artifacts: data.artifacts,
        manifests: data.manifests,
        anchors: data.anchors,
        lineage: data.lineage,
        payments: data.payments,
        milestones: data.milestones,
        rights: data.rights,
        revenue: data.revenue,
        roots: data.roots,
      };
    }

    // scope.type === "matter"
    const mid = scope.matterId;
    const isMatter = (d: unknown) => {
      const obj = d as Record<string, unknown>;
      return obj.matterId === mid;
    };
    return {
      truthRecords: data.truthRecords.filter(r => r.entityId === mid || isMatter(r.data)),
      attestations: data.attestations.filter(a => a.matterId === mid),
      artifacts: data.artifacts.filter(a => a.matterId === mid),
      manifests: data.manifests.filter(m => m.matterId === mid),
      anchors: data.anchors,
      lineage: data.lineage,
      payments: data.payments.filter(p => p.matterId === mid),
      milestones: data.milestones.filter(m => m.matterId === mid),
      rights: data.rights.filter(r => r.matterId === mid),
      revenue: data.revenue.filter(r => r.matterId === mid),
      roots: data.roots,
    };
  }
}
