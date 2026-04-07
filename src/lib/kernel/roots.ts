/**
 * CANONICAL STATE ROOT
 *
 * Periodic roll-up of all kernel state into a single chain-anchorable
 * root hash. Each StateRoot captures the Merkle-style summary of:
 *   - truth records (canonical state)
 *   - artifacts + manifests (proof layer)
 *   - attestations (trust signals)
 *   - payments + milestones + rights (settlement)
 *
 * Roots form their own chain: each root references the previous root hash,
 * enabling full audit replay from genesis to present.
 */

import { fingerprint } from "./state";
import { sha256 } from "./proof";

// ─── Types ──────────────────────────────────────────────────────────────────

export type RootStatus = "pending" | "anchored" | "verified" | "disputed";

export interface StateRootLayer {
  layer: string;
  recordCount: number;
  layerHash: string;
}

export interface StateRoot {
  id: string;
  sequence: number;
  /** Roll-up hashes per layer */
  layers: StateRootLayer[];
  /** Combined root hash of all layer hashes */
  rootHash: string;
  /** Chain of roots */
  previousRootHash: string | null;
  /** Metadata */
  entityCount: number;
  attestationCount: number;
  paymentCount: number;
  /** Chain anchor */
  status: RootStatus;
  anchorChain?: string;
  anchorTxHash?: string;
  anchorBlockNumber?: number;
  anchoredAt?: string;
  /** Timestamps */
  createdAt: string;
  createdBy: string;
}

export interface RootVerification {
  rootId: string;
  valid: boolean;
  layerResults: Array<{ layer: string; expected: string; actual: string; match: boolean }>;
  chainValid: boolean;
  timestamp: string;
}

// ─── Storage ────────────────────────────────────────────────────────────────

const STORAGE_KEY = "unykorn_truth_roots";

function loadRoots(): StateRoot[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); }
  catch { return []; }
}

function saveRoots(data: StateRoot[]): void {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }
  catch { /* storage full */ }
}

// ─── Layer Hash Collectors ──────────────────────────────────────────────────

export interface LayerCollector {
  layer: string;
  collect: () => { count: number; fingerprints: string[] };
}

// ─── StateRootEngine ────────────────────────────────────────────────────────

export class StateRootEngine {
  private roots: StateRoot[] = [];
  private loaded = false;
  private collectors: LayerCollector[] = [];

  private ensureLoaded(): void {
    if (!this.loaded) { this.roots = loadRoots(); this.loaded = true; }
  }

  /** Register a layer collector. Called during kernel composition. */
  registerCollector(collector: LayerCollector): void {
    this.collectors.push(collector);
  }

  /** Build a new state root from all registered layer collectors. */
  buildRoot(createdBy: string): StateRoot {
    this.ensureLoaded();

    const layers: StateRootLayer[] = this.collectors.map(c => {
      const { count, fingerprints } = c.collect();
      return {
        layer: c.layer,
        recordCount: count,
        layerHash: fingerprint(fingerprints.sort()),
      };
    });

    const rootHash = fingerprint(layers.map(l => l.layerHash));
    const prev = this.roots.length > 0 ? this.roots[this.roots.length - 1] : null;

    const root: StateRoot = {
      id: crypto.randomUUID(),
      sequence: (prev?.sequence ?? 0) + 1,
      layers,
      rootHash,
      previousRootHash: prev?.rootHash ?? null,
      entityCount: layers.reduce((s, l) => s + l.recordCount, 0),
      attestationCount: layers.find(l => l.layer === "attestations")?.recordCount ?? 0,
      paymentCount: layers.find(l => l.layer === "settlement")?.recordCount ?? 0,
      status: "pending",
      createdAt: new Date().toISOString(),
      createdBy,
    };

    this.roots.push(root);
    saveRoots(this.roots);
    return root;
  }

  /** Anchor a root to a blockchain. */
  anchorRoot(rootId: string, chain: string, txHash: string, blockNumber: number): void {
    this.ensureLoaded();
    const root = this.roots.find(r => r.id === rootId);
    if (!root) return;
    root.status = "anchored";
    root.anchorChain = chain;
    root.anchorTxHash = txHash;
    root.anchorBlockNumber = blockNumber;
    root.anchoredAt = new Date().toISOString();
    saveRoots(this.roots);
  }

  /** Verify a root against current layer state. */
  verifyRoot(rootId: string): RootVerification {
    this.ensureLoaded();
    const root = this.roots.find(r => r.id === rootId);
    if (!root) {
      return { rootId, valid: false, layerResults: [], chainValid: false, timestamp: new Date().toISOString() };
    }

    const layerResults = root.layers.map(rl => {
      const collector = this.collectors.find(c => c.layer === rl.layer);
      if (!collector) return { layer: rl.layer, expected: rl.layerHash, actual: "missing_collector", match: false };
      const { fingerprints } = collector.collect();
      const actual = fingerprint(fingerprints.sort());
      return { layer: rl.layer, expected: rl.layerHash, actual, match: actual === rl.layerHash };
    });

    // Verify root chain linkage
    const idx = this.roots.findIndex(r => r.id === rootId);
    const chainValid = idx === 0
      ? root.previousRootHash === null
      : root.previousRootHash === this.roots[idx - 1].rootHash;

    return {
      rootId,
      valid: layerResults.every(r => r.match) && chainValid,
      layerResults,
      chainValid,
      timestamp: new Date().toISOString(),
    };
  }

  /** Get the latest root. */
  get latest(): StateRoot | null {
    this.ensureLoaded();
    return this.roots.length > 0 ? this.roots[this.roots.length - 1] : null;
  }

  /** Get all roots. */
  get all(): StateRoot[] {
    this.ensureLoaded();
    return [...this.roots];
  }

  /** Get root by ID. */
  get(id: string): StateRoot | null {
    this.ensureLoaded();
    return this.roots.find(r => r.id === id) ?? null;
  }

  /** Compute SHA-256 of the latest root hash for chain anchoring. */
  async latestRootSha256(): Promise<string> {
    const latest = this.latest;
    if (!latest) return "0".repeat(64);
    return sha256(latest.rootHash);
  }

  // ─── Stats ────────────────────────────────────────────────────────

  get rootCount(): number { this.ensureLoaded(); return this.roots.length; }
  get anchoredRootCount(): number {
    this.ensureLoaded();
    return this.roots.filter(r => r.status === "anchored" || r.status === "verified").length;
  }

  /** Purge all roots. */
  reset(): void {
    this.roots = [];
    this.loaded = true;
    if (typeof window !== "undefined") localStorage.removeItem(STORAGE_KEY);
  }
}
