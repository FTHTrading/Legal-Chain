/**
 * UNYKORN TRUTH KERNEL — Orchestrator
 *
 * Composes the four architectural layers into a single kernel:
 *   1. Canonical State  — versioned, fingerprinted truth records
 *   2. Evidence + Proof  — hashed artifacts, manifests, chain anchors
 *   3. Transition Engine — rule-based lifecycle state machine
 *   4. Settlement Ledger — x402 payments, milestones, rights, revenue
 *
 * Import `truthKernel` for the singleton instance.
 */

export { fingerprint } from "./state";
export type { EntityType, Origin, TruthRecord, MatterSnapshot } from "./state";
export type { Artifact, ProofManifest, ProofAnchor, LineageRecord, ManifestPurpose, AnchorChain } from "./proof";
export type { TransitionRule, TransitionResult } from "./transitions";
export type {
  PaymentEvent, MilestoneGate, RightsRecord, RevenueEvent,
  PaymentType, SettlementAsset, PaymentStatus, RightType, RevenueType,
} from "./settlement";

import { StateKernel } from "./state";
import { ProofKernel, sha256 } from "./proof";
import { TransitionEngine } from "./transitions";
import { SettlementLedger } from "./settlement";

export class TruthKernel {
  readonly state = new StateKernel();
  readonly proof = new ProofKernel();
  readonly transitions = new TransitionEngine();
  readonly settlement = new SettlementLedger();

  /** Async SHA-256 hash (delegates to ProofKernel utility). */
  sha256 = sha256;

  /** Kernel stats for dashboard display. */
  get stats() {
    return {
      truthRecords: this.state.truthCount,
      trackedEntities: this.state.entityCount,
      artifacts: this.proof.artifactCount,
      manifests: this.proof.manifestCount,
      anchors: this.proof.anchorCount,
      confirmedAnchors: this.proof.confirmedAnchors,
      payments: this.settlement.paymentCount,
      pendingPayments: this.settlement.pendingPayments,
      settledTotals: this.settlement.settledTotal,
    };
  }

  /** Purge all kernel data. */
  reset(): void {
    this.state.reset();
    this.proof.reset();
    this.settlement.reset();
  }
}

/** Singleton truth kernel instance. */
export const truthKernel = new TruthKernel();
