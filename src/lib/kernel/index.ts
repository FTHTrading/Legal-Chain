/**
 * UNYKORN TRUTH KERNEL — Orchestrator (v2)
 *
 * Composes eight architectural modules into a single kernel:
 *   1. Canonical State    — versioned, fingerprinted truth records
 *   2. Evidence + Proof   — hashed artifacts, manifests, chain anchors
 *   3. Transition Engine  — rule-based lifecycle state machine
 *   4. Settlement Ledger  — x402 payments, milestones, rights, revenue
 *   5. Attestations       — first-class trust signals from 5 attester classes
 *   6. State Roots        — periodic roll-up for chain anchoring
 *   7. Replay Engine      — deterministic verification + export bundles
 *   8. Twin Bindings      — digital twin simulation lifecycle
 *
 * Import `truthKernel` for the singleton instance.
 */

// ─── Re-exports ─────────────────────────────────────────────────────────────

export { fingerprint } from "./state";
export type { EntityType, Origin, TruthRecord, MatterSnapshot } from "./state";
export type { Artifact, ProofManifest, ProofAnchor, LineageRecord, ManifestPurpose, AnchorChain } from "./proof";
export type { TransitionRule, TransitionResult } from "./transitions";
export type {
  PaymentEvent, MilestoneGate, RightsRecord, RevenueEvent,
  PaymentType, SettlementAsset, PaymentStatus, RightType, RevenueType,
} from "./settlement";
export type {
  Attestation, AttesterClass, AttestationType, AttestationStatus, AttestationQuery,
} from "./attestations";
export type {
  StateRoot, StateRootLayer, RootStatus, RootVerification, LayerCollector,
} from "./roots";
export type {
  VerifyResult, ReplayFrame, ExportBundle, ExportScope,
} from "./replay";
export type {
  TwinRun, ModelVersion, ScenarioAssumptions, Entitlement, TwinDomain, RunStatus,
} from "./twin-bindings";

// ─── Imports ────────────────────────────────────────────────────────────────

import { StateKernel } from "./state";
import { ProofKernel, sha256 } from "./proof";
import { TransitionEngine } from "./transitions";
import { SettlementLedger } from "./settlement";
import { AttestationRegistry } from "./attestations";
import { StateRootEngine } from "./roots";
import { ReplayEngine } from "./replay";
import { TwinRegistry } from "./twin-bindings";

// ─── TruthKernel ────────────────────────────────────────────────────────────

export class TruthKernel {
  // Core layers (v1)
  readonly state = new StateKernel();
  readonly proof = new ProofKernel();
  readonly transitions = new TransitionEngine();
  readonly settlement = new SettlementLedger();

  // Infrastructure protocol (v2)
  readonly attestations = new AttestationRegistry();
  readonly roots = new StateRootEngine();
  readonly replay = new ReplayEngine();
  readonly twins = new TwinRegistry();

  /** Async SHA-256 hash (delegates to ProofKernel utility). */
  sha256 = sha256;

  constructor() {
    this.registerCollectors();
  }

  /** Register layer collectors for state root roll-ups. */
  private registerCollectors(): void {
    this.roots.registerCollector({
      layer: "state",
      collect: () => {
        const records = this.state.allRecords;
        return { count: records.length, fingerprints: records.map(r => r.fingerprint) };
      },
    });

    this.roots.registerCollector({
      layer: "proof",
      collect: () => {
        const arts = this.proof.allArtifacts;
        const mans = this.proof.allManifests;
        return {
          count: arts.length + mans.length,
          fingerprints: [
            ...arts.map(a => a.contentHash),
            ...mans.map(m => m.manifestHash),
          ],
        };
      },
    });

    this.roots.registerCollector({
      layer: "attestations",
      collect: () => {
        const atts = this.attestations.allAttestations;
        return { count: atts.length, fingerprints: atts.map(a => a.contentFingerprint) };
      },
    });

    this.roots.registerCollector({
      layer: "settlement",
      collect: () => {
        const pays = this.settlement.allPayments;
        const miles = this.settlement.allMilestones;
        return {
          count: pays.length + miles.length,
          fingerprints: [
            ...pays.map(p => p.id),
            ...miles.map(m => m.id),
          ],
        };
      },
    });

    this.roots.registerCollector({
      layer: "twins",
      collect: () => {
        const runs = this.twins.getRuns();
        return { count: runs.length, fingerprints: runs.map(r => r.inputFingerprint) };
      },
    });
  }

  /** Kernel stats for dashboard display. */
  get stats() {
    return {
      // v1 stats
      truthRecords: this.state.truthCount,
      trackedEntities: this.state.entityCount,
      artifacts: this.proof.artifactCount,
      manifests: this.proof.manifestCount,
      anchors: this.proof.anchorCount,
      confirmedAnchors: this.proof.confirmedAnchors,
      payments: this.settlement.paymentCount,
      pendingPayments: this.settlement.pendingPayments,
      settledTotals: this.settlement.settledTotal,
      // v2 stats
      attestations: this.attestations.count,
      activeAttestations: this.attestations.activeCount,
      anchoredAttestations: this.attestations.anchoredCount,
      stateRoots: this.roots.rootCount,
      anchoredRoots: this.roots.anchoredRootCount,
      twinModels: this.twins.modelCount,
      twinRuns: this.twins.runCount,
      completedRuns: this.twins.completedRunCount,
      entitlements: this.twins.entitlementCount,
    };
  }

  /** Purge all kernel data. */
  reset(): void {
    this.state.reset();
    this.proof.reset();
    this.settlement.reset();
    this.attestations.reset();
    this.roots.reset();
    this.twins.reset();
  }
}

/** Singleton truth kernel instance. */
export const truthKernel = new TruthKernel();
