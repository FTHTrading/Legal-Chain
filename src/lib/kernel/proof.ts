/**
 * EVIDENCE + PROOF LAYER
 *
 * Hashed artifacts, ordered manifests, chain anchors, and lineage records.
 * Every piece of evidence gets a content hash. Manifests bundle artifacts
 * for filing packets. Anchors pin manifest hashes to blockchains.
 * Lineage tracks how every artifact was created, derived, or superseded.
 */

import { fingerprint } from "./state";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface Artifact {
  id: string;
  matterId: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  contentHash: string;
  metadata: Record<string, unknown>;
  capturedAt: string;
  capturedBy: string;
}

export type ManifestPurpose =
  | "evidence_binder" | "filing_packet" | "discovery_response"
  | "chain_analysis" | "audit_trail" | "client_packet" | "authority_table";

export interface ProofManifest {
  id: string;
  matterId: string;
  title: string;
  version: number;
  artifactIds: string[];
  manifestHash: string;
  createdAt: string;
  createdBy: string;
  purpose: ManifestPurpose;
}

export type AnchorChain =
  | "apostle" | "ethereum" | "polygon" | "solana"
  | "xrpl" | "stellar" | "bitcoin";

export type AnchorStatus = "pending" | "confirmed" | "failed";

export interface ProofAnchor {
  id: string;
  manifestId: string;
  chain: AnchorChain;
  txHash: string;
  blockNumber: number;
  anchoredAt: string;
  anchoredBy: string;
  status: AnchorStatus;
}

export type LineageAction = "created" | "derived" | "verified" | "redacted" | "superseded";

export interface LineageRecord {
  id: string;
  artifactId: string;
  action: LineageAction;
  sourceArtifactIds: string[];
  actor: string;
  actorType: "user" | "agent" | "system";
  timestamp: string;
  notes?: string;
}

// ─── Storage ────────────────────────────────────────────────────────────────

const KEYS = {
  artifacts: "unykorn_truth_artifacts",
  manifests: "unykorn_truth_manifests",
  anchors: "unykorn_truth_anchors",
  lineage: "unykorn_truth_lineage",
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

// ─── SHA-256 (async, for chain-grade proof) ─────────────────────────────────

export async function sha256(input: string): Promise<string> {
  if (typeof window === "undefined") return "0".repeat(64);
  const data = new TextEncoder().encode(input);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
}

// ─── ProofKernel ────────────────────────────────────────────────────────────

export class ProofKernel {
  private artifacts: Artifact[] = [];
  private manifests: ProofManifest[] = [];
  private anchors: ProofAnchor[] = [];
  private lineage: LineageRecord[] = [];
  private loaded = false;

  private ensureLoaded(): void {
    if (this.loaded) return;
    this.artifacts = load(KEYS.artifacts, []);
    this.manifests = load(KEYS.manifests, []);
    this.anchors = load(KEYS.anchors, []);
    this.lineage = load(KEYS.lineage, []);
    this.loaded = true;
  }

  private persist(): void {
    save(KEYS.artifacts, this.artifacts);
    save(KEYS.manifests, this.manifests);
    save(KEYS.anchors, this.anchors);
    save(KEYS.lineage, this.lineage);
  }

  // ─── Artifacts ──────────────────────────────────────────────────────

  /** Register a content-hashed artifact. */
  registerArtifact(
    matterId: string, filename: string, mimeType: string,
    sizeBytes: number, contentHash: string, capturedBy: string,
    metadata: Record<string, unknown> = {}
  ): Artifact {
    this.ensureLoaded();
    const artifact: Artifact = {
      id: crypto.randomUUID(),
      matterId, filename, mimeType, sizeBytes, contentHash,
      metadata, capturedAt: new Date().toISOString(), capturedBy,
    };
    this.artifacts.push(artifact);

    // Auto-create lineage "created" record
    this.lineage.push({
      id: crypto.randomUUID(),
      artifactId: artifact.id,
      action: "created",
      sourceArtifactIds: [],
      actor: capturedBy,
      actorType: "user",
      timestamp: artifact.capturedAt,
    });

    this.persist();
    return artifact;
  }

  /** Get all artifacts for a matter. */
  getArtifacts(matterId: string): Artifact[] {
    this.ensureLoaded();
    return this.artifacts.filter(a => a.matterId === matterId);
  }

  /** Get single artifact by ID. */
  getArtifact(id: string): Artifact | null {
    this.ensureLoaded();
    return this.artifacts.find(a => a.id === id) ?? null;
  }

  // ─── Manifests ──────────────────────────────────────────────────────

  /** Create an ordered manifest of artifacts. Hash computed from artifact chain. */
  createManifest(
    matterId: string, title: string, artifactIds: string[],
    purpose: ManifestPurpose, createdBy: string
  ): ProofManifest {
    this.ensureLoaded();

    // Compute manifest hash from ordered artifact hashes
    const hashes = artifactIds.map(aid => {
      const a = this.artifacts.find(x => x.id === aid);
      return a?.contentHash ?? "missing";
    });
    const manifestHash = fingerprint(hashes);

    // Version: count existing manifests with same matter+title
    const existing = this.manifests.filter(m => m.matterId === matterId && m.title === title);

    const manifest: ProofManifest = {
      id: crypto.randomUUID(),
      matterId, title,
      version: existing.length + 1,
      artifactIds,
      manifestHash,
      createdAt: new Date().toISOString(),
      createdBy, purpose,
    };
    this.manifests.push(manifest);
    this.persist();
    return manifest;
  }

  /** Get a manifest by ID. */
  getManifest(id: string): ProofManifest | null {
    this.ensureLoaded();
    return this.manifests.find(m => m.id === id) ?? null;
  }

  /** Get all manifests for a matter. */
  getManifests(matterId: string): ProofManifest[] {
    this.ensureLoaded();
    return this.manifests.filter(m => m.matterId === matterId);
  }

  // ─── Anchors ──────────────────────────────────────────────────────

  /** Record a blockchain anchor for a manifest. */
  anchorManifest(
    manifestId: string, chain: AnchorChain,
    txHash: string, blockNumber: number, anchoredBy: string
  ): ProofAnchor {
    this.ensureLoaded();
    const anchor: ProofAnchor = {
      id: crypto.randomUUID(),
      manifestId, chain, txHash, blockNumber,
      anchoredAt: new Date().toISOString(),
      anchoredBy, status: "pending",
    };
    this.anchors.push(anchor);
    this.persist();
    return anchor;
  }

  /** Confirm or fail an anchor. */
  updateAnchorStatus(id: string, status: "confirmed" | "failed"): void {
    this.ensureLoaded();
    const anchor = this.anchors.find(a => a.id === id);
    if (anchor) { anchor.status = status; this.persist(); }
  }

  /** Get all anchors for a manifest. */
  getAnchors(manifestId: string): ProofAnchor[] {
    this.ensureLoaded();
    return this.anchors.filter(a => a.manifestId === manifestId);
  }

  // ─── Lineage ──────────────────────────────────────────────────────

  /** Record a lineage event for an artifact. */
  recordLineage(
    artifactId: string, action: LineageAction,
    sourceArtifactIds: string[], actor: string,
    actorType: "user" | "agent" | "system", notes?: string
  ): LineageRecord {
    this.ensureLoaded();
    const record: LineageRecord = {
      id: crypto.randomUUID(),
      artifactId, action, sourceArtifactIds,
      actor, actorType,
      timestamp: new Date().toISOString(),
      notes,
    };
    this.lineage.push(record);
    this.persist();
    return record;
  }

  /** Full lineage chain for an artifact. */
  getLineage(artifactId: string): LineageRecord[] {
    this.ensureLoaded();
    return this.lineage.filter(l => l.artifactId === artifactId);
  }

  // ─── Stats ────────────────────────────────────────────────────────

  get allArtifacts(): Artifact[] { this.ensureLoaded(); return [...this.artifacts]; }
  get allManifests(): ProofManifest[] { this.ensureLoaded(); return [...this.manifests]; }
  get allAnchors(): ProofAnchor[] { this.ensureLoaded(); return [...this.anchors]; }
  get allLineage(): LineageRecord[] { this.ensureLoaded(); return [...this.lineage]; }

  get artifactCount(): number { this.ensureLoaded(); return this.artifacts.length; }
  get manifestCount(): number { this.ensureLoaded(); return this.manifests.length; }
  get anchorCount(): number { this.ensureLoaded(); return this.anchors.length; }
  get confirmedAnchors(): number {
    this.ensureLoaded();
    return this.anchors.filter(a => a.status === "confirmed").length;
  }

  /** Purge all proof data. */
  reset(): void {
    this.artifacts = []; this.manifests = []; this.anchors = []; this.lineage = [];
    this.loaded = true;
    if (typeof window === "undefined") return;
    Object.values(KEYS).forEach(k => localStorage.removeItem(k));
  }
}
