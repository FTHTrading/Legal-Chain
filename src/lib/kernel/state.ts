/**
 * CANONICAL STATE LAYER
 *
 * Every entity in the system gets a TruthRecord — a versioned, fingerprinted,
 * attributable wrapper. The StateKernel maintains a hash chain per entity,
 * enabling tamper detection and full history replay.
 *
 * Local fingerprinting uses a fast 128-bit deterministic hash for content
 * addressing. Chain-grade SHA-256 proof is handled by ProofKernel.
 */

// ─── Types ──────────────────────────────────────────────────────────────────

export type EntityType =
  | "matter" | "intake" | "approval" | "task"
  | "communication" | "evidence" | "document"
  | "research" | "forensic_case" | "namespace";

export interface Origin {
  actor: string;
  actorType: "user" | "agent" | "system";
  action: string;
}

export interface TruthRecord<T = unknown> {
  rid: string;
  entityType: EntityType;
  entityId: string;
  version: number;
  fingerprint: string;
  previousFingerprint: string | null;
  data: T;
  origin: Origin & { timestamp: string };
  createdAt: string;
}

export interface MatterSnapshot {
  matterId: string;
  snapshotFingerprint: string;
  takenAt: string;
  records: TruthRecord[];
}

// ─── Deterministic Content Fingerprinting ───────────────────────────────────

function stableStringify(data: unknown): string {
  if (data === null || data === undefined) return String(data);
  if (typeof data !== "object") return JSON.stringify(data);
  if (Array.isArray(data)) return "[" + data.map(stableStringify).join(",") + "]";
  const keys = Object.keys(data as Record<string, unknown>).sort();
  return "{" + keys.map(k =>
    JSON.stringify(k) + ":" + stableStringify((data as Record<string, unknown>)[k])
  ).join(",") + "}";
}

/**
 * Fast 128-bit deterministic fingerprint (FNV-1a × 4 lanes).
 * Content-addressing for local tamper detection — not cryptographic.
 * Chain-grade SHA-256 is computed in ProofKernel when anchoring.
 */
export function fingerprint(data: unknown): string {
  const raw = stableStringify(data);
  let h1 = 0x811c9dc5;
  let h2 = 0x9e3779b9;
  let h3 = 0x6a09e667;
  let h4 = 0x510e527f;
  for (let i = 0; i < raw.length; i++) {
    const c = raw.charCodeAt(i);
    h1 = Math.imul(h1 ^ c, 0x01000193);
    h2 = Math.imul(h2 ^ c, 0x85ebca6b);
    h3 = Math.imul(h3 ^ c, 0xc2b2ae35);
    h4 = Math.imul(h4 ^ c, 0x165667b1);
  }
  return [h1 >>> 0, h2 >>> 0, h3 >>> 0, h4 >>> 0]
    .map(n => n.toString(16).padStart(8, "0")).join("");
}

// ─── Storage ────────────────────────────────────────────────────────────────

const STORAGE_KEY = "unykorn_truth_state";

function loadRecords(): TruthRecord[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); }
  catch { return []; }
}

function saveRecords(records: TruthRecord[]): void {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(records)); }
  catch { /* storage full */ }
}

// ─── StateKernel ────────────────────────────────────────────────────────────

export class StateKernel {
  private records: TruthRecord[] = [];
  private loaded = false;

  private ensureLoaded(): void {
    if (!this.loaded) { this.records = loadRecords(); this.loaded = true; }
  }

  /** Commit a new version of an entity. Returns the truth record. */
  commit<T>(entityType: EntityType, entityId: string, data: T, origin: Origin): TruthRecord<T> {
    this.ensureLoaded();
    const now = new Date().toISOString();
    const chain = this.records.filter(r => r.entityType === entityType && r.entityId === entityId);
    const latest = chain.length > 0 ? chain[chain.length - 1] : null;

    const record: TruthRecord<T> = {
      rid: crypto.randomUUID(),
      entityType,
      entityId,
      version: latest ? latest.version + 1 : 1,
      fingerprint: fingerprint(data),
      previousFingerprint: latest?.fingerprint ?? null,
      data,
      origin: { ...origin, timestamp: now },
      createdAt: now,
    };

    this.records.push(record as TruthRecord);
    saveRecords(this.records);
    return record;
  }

  /** Get the latest truth record for an entity. */
  canonical<T = unknown>(entityType: EntityType, entityId: string): TruthRecord<T> | null {
    this.ensureLoaded();
    const chain = this.records.filter(r => r.entityType === entityType && r.entityId === entityId);
    return chain.length > 0 ? (chain[chain.length - 1] as TruthRecord<T>) : null;
  }

  /** Full version history for an entity. */
  history<T = unknown>(entityType: EntityType, entityId: string): TruthRecord<T>[] {
    this.ensureLoaded();
    return this.records.filter(r => r.entityType === entityType && r.entityId === entityId) as TruthRecord<T>[];
  }

  /** Latest truth record for every entity of a given type. */
  entities<T = unknown>(entityType: EntityType): TruthRecord<T>[] {
    this.ensureLoaded();
    const latest = new Map<string, TruthRecord>();
    for (const r of this.records) {
      if (r.entityType === entityType) latest.set(r.entityId, r);
    }
    return Array.from(latest.values()) as TruthRecord<T>[];
  }

  /** Verify hash-chain integrity for an entity. */
  verify(entityType: EntityType, entityId: string): boolean {
    this.ensureLoaded();
    const chain = this.records.filter(r => r.entityType === entityType && r.entityId === entityId);
    for (let i = 0; i < chain.length; i++) {
      if (fingerprint(chain[i].data) !== chain[i].fingerprint) return false;
      if (i === 0 && chain[i].previousFingerprint !== null) return false;
      if (i > 0 && chain[i].previousFingerprint !== chain[i - 1].fingerprint) return false;
    }
    return true;
  }

  /** Point-in-time snapshot of all entities linked to a matter. */
  snapshot(matterId: string): MatterSnapshot {
    this.ensureLoaded();
    const now = new Date().toISOString();
    const latest = new Map<string, TruthRecord>();
    for (const r of this.records) {
      const d = r.data as Record<string, unknown>;
      if (d.matterId === matterId || r.entityId === matterId) {
        latest.set(`${r.entityType}:${r.entityId}`, r);
      }
    }
    const recs = Array.from(latest.values());
    const fp = fingerprint(recs.map(r => r.fingerprint).sort());
    return { matterId, snapshotFingerprint: fp, takenAt: now, records: recs };
  }

  /** Total truth records (all versions). */
  get truthCount(): number { this.ensureLoaded(); return this.records.length; }

  /** Unique entity count (latest versions only). */
  get entityCount(): number {
    this.ensureLoaded();
    const seen = new Set<string>();
    for (const r of this.records) seen.add(`${r.entityType}:${r.entityId}`);
    return seen.size;
  }

  /** Purge all truth records. */
  reset(): void {
    this.records = [];
    this.loaded = true;
    if (typeof window !== "undefined") localStorage.removeItem(STORAGE_KEY);
  }
}
