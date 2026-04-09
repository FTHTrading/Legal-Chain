/**
 * Legal-Chain SDK — connects the Next.js app to the Substrate chain services.
 *
 * Architecture:
 *   Next.js App  →  Explorer API (port 8300)  →  Postgres (indexed chain data)
 *                →  Proof Service (port 8400)  →  Substrate Node (port 9944)
 *                →  Substrate RPC (port 9944)  →  Direct extrinsic submission
 *
 * When the chain is offline, all methods return null/empty gracefully.
 */

const EXPLORER_API = process.env.LEGAL_CHAIN_EXPLORER_URL || "http://localhost:8300";
const PROOF_SERVICE = process.env.LEGAL_CHAIN_PROOF_URL || "http://localhost:8400";
const SUBSTRATE_RPC = process.env.LEGAL_CHAIN_RPC_URL || "ws://localhost:9944";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface ChainBlock {
  number: number;
  hash: string;
  parent_hash: string;
  state_root: string;
  extrinsics_count: number;
  events_count: number;
  timestamp: string;
}

export interface ChainMatter {
  id: string;
  title: string;
  status: string;
  creator: string;
  jurisdiction: string;
  created_at: string;
  updated_at: string;
  block_number: number;
}

export interface ChainEvidence {
  id: string;
  matter_id: string;
  content_hash: string;
  custodian: string;
  evidence_type: string;
  status: string;
  registered_at: string;
  block_number: number;
}

export interface ChainDocument {
  id: string;
  matter_id: string;
  content_hash: string;
  version: number;
  status: string;
  author: string;
  registered_at: string;
  block_number: number;
}

export interface ChainApproval {
  id: string;
  subject_type: string;
  subject_id: string;
  status: string;
  quorum: number;
  approvals_count: number;
  requested_by: string;
  created_at: string;
}

export interface ChainIdentity {
  account: string;
  display_name: string;
  role: string;
  organization: string;
  jurisdiction: string;
  registered_at: string;
  active: boolean;
}

export interface ChainAuditEntry {
  id: number;
  subject_type: string;
  subject_id: string;
  action: string;
  actor: string;
  block_number: number;
  timestamp: string;
  prev_hash: string;
}

export interface ChainStats {
  latest_block: number;
  total_matters: number;
  total_evidence: number;
  total_documents: number;
  total_approvals: number;
  total_identities: number;
  total_audit_entries: number;
  chain_healthy: boolean;
}

export interface ProofBundle {
  chain_id: string;
  block_number: number;
  state_root: string;
  storage_key: string;
  storage_value: string;
  proof_nodes: string[];
  verified: boolean;
  timestamp: string;
  integrity_hash: string;
  version: string;
}

// ─── Client ─────────────────────────────────────────────────────────────────

async function chainFetch<T>(path: string, base = EXPLORER_API): Promise<T | null> {
  try {
    const res = await fetch(`${base}${path}`, {
      next: { revalidate: 10 },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

// ─── Explorer API Methods ───────────────────────────────────────────────────

export async function getChainStats(): Promise<ChainStats | null> {
  return chainFetch<ChainStats>("/api/stats");
}

export async function getLatestBlocks(limit = 20): Promise<ChainBlock[]> {
  return (await chainFetch<ChainBlock[]>(`/api/blocks?limit=${limit}`)) ?? [];
}

export async function getBlock(numberOrHash: string | number): Promise<ChainBlock | null> {
  return chainFetch<ChainBlock>(`/api/blocks/${numberOrHash}`);
}

export async function getMatters(limit = 50): Promise<ChainMatter[]> {
  return (await chainFetch<ChainMatter[]>(`/api/matters?limit=${limit}`)) ?? [];
}

export async function getMatter(id: string): Promise<ChainMatter | null> {
  return chainFetch<ChainMatter>(`/api/matters/${id}`);
}

export async function getEvidence(matterId?: string, limit = 50): Promise<ChainEvidence[]> {
  const q = matterId ? `?matter_id=${matterId}&limit=${limit}` : `?limit=${limit}`;
  return (await chainFetch<ChainEvidence[]>(`/api/evidence${q}`)) ?? [];
}

export async function getDocuments(matterId?: string, limit = 50): Promise<ChainDocument[]> {
  const q = matterId ? `?matter_id=${matterId}&limit=${limit}` : `?limit=${limit}`;
  return (await chainFetch<ChainDocument[]>(`/api/documents${q}`)) ?? [];
}

export async function getApprovals(limit = 50): Promise<ChainApproval[]> {
  return (await chainFetch<ChainApproval[]>(`/api/approvals?limit=${limit}`)) ?? [];
}

export async function getIdentities(limit = 50): Promise<ChainIdentity[]> {
  return (await chainFetch<ChainIdentity[]>(`/api/identities?limit=${limit}`)) ?? [];
}

export async function getAuditLog(limit = 100): Promise<ChainAuditEntry[]> {
  return (await chainFetch<ChainAuditEntry[]>(`/api/audit?limit=${limit}`)) ?? [];
}

export async function getAuditForSubject(subjectType: string, subjectId: string): Promise<ChainAuditEntry[]> {
  return (await chainFetch<ChainAuditEntry[]>(`/api/audit/${subjectType}/${subjectId}`)) ?? [];
}

// ─── Proof Service Methods ──────────────────────────────────────────────────

export async function getProof(storageKey: string, blockHash?: string): Promise<ProofBundle | null> {
  const q = blockHash ? `?block=${blockHash}` : "";
  return chainFetch<ProofBundle>(`/api/proof/${storageKey}${q}`, PROOF_SERVICE);
}

export async function verifyProof(bundle: ProofBundle): Promise<{ valid: boolean; details: string } | null> {
  try {
    const res = await fetch(`${PROOF_SERVICE}/api/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bundle),
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

// ─── Health Check ───────────────────────────────────────────────────────────

export async function isChainOnline(): Promise<boolean> {
  try {
    const res = await fetch(`${EXPLORER_API}/api/stats`, {
      signal: AbortSignal.timeout(3000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function getChainHealth() {
  const [explorerOnline, proofOnline] = await Promise.all([
    isChainOnline(),
    chainFetch<{ status: string }>("/health", PROOF_SERVICE).then((r) => r !== null),
  ]);
  return { explorerOnline, proofOnline, substrate: SUBSTRATE_RPC };
}
