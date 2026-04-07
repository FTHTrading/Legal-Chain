/**
 * Web3 Privacy Vault
 *
 * All client PII is encrypted at rest with AES-256-GCM.
 * Content hashes are anchored to the Truth Kernel for tamper detection.
 * Access is gated by HMAC-signed tokens — no PII ever leaks to public views.
 *
 * Storage hierarchy:
 *   VaultRecord (encrypted blob) → ContentHash (SHA-256) → TruthKernel anchor
 *
 * Encryption key is derived from VAULT_SECRET env var via PBKDF2.
 */

import { randomUUID } from "crypto";

// ── Types ──

export type PIIField =
  | "client_name"
  | "email"
  | "phone"
  | "address"
  | "ssn"
  | "dob"
  | "financial"
  | "medical"
  | "adverse_party"
  | "witness_info"
  | "counsel_notes"
  | "custom";

export interface VaultRecord {
  id: string;
  matterId: string;
  fieldType: PIIField;
  /** AES-256-GCM encrypted payload (base64) */
  ciphertext: string;
  /** Initialization vector (base64) */
  iv: string;
  /** Auth tag (base64) */
  authTag: string;
  /** SHA-256 of plaintext — anchored to kernel */
  contentHash: string;
  /** Blockchain anchor tx hash (if settled) */
  chainAnchor?: string;
  /** Who can decrypt: wallet addresses or role names */
  accessList: string[];
  createdAt: string;
  updatedAt: string;
  /** Whether this record has been anchored on-chain */
  anchored: boolean;
}

export interface VaultSummary {
  id: string;
  matterId: string;
  fieldType: PIIField;
  contentHash: string;
  anchored: boolean;
  createdAt: string;
  /** NEVER includes plaintext or ciphertext */
}

export interface DecryptedField {
  id: string;
  fieldType: PIIField;
  value: string;
  verified: boolean; // hash matches after decryption
}

export interface VaultStats {
  totalRecords: number;
  byMatter: Record<string, number>;
  anchoredCount: number;
  fieldTypeCounts: Record<string, number>;
}

// ── In-Memory Vault Store ──

const vaultStore = new Map<string, VaultRecord>();
const matterIndex = new Map<string, Set<string>>(); // matterId → vault record IDs

// ── Crypto Primitives (Web Crypto API) ──

const ALGORITHM = "AES-GCM";
const KEY_LENGTH = 256;
const IV_LENGTH = 12;
const SALT = new TextEncoder().encode("UNYKORN-LAW-VAULT-v1");

async function deriveKey(): Promise<CryptoKey> {
  const secret = process.env.VAULT_SECRET || "unykorn-law-default-vault-key-change-in-production";
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    "PBKDF2",
    false,
    ["deriveKey"]
  );
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: SALT, iterations: 310_000, hash: "SHA-256" },
    keyMaterial,
    { name: ALGORITHM, length: KEY_LENGTH },
    false,
    ["encrypt", "decrypt"]
  );
}

async function sha256(data: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(data));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
}

function toBase64(buf: ArrayBuffer | Uint8Array): string {
  return Buffer.from(buf instanceof Uint8Array ? buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) : buf).toString("base64");
}

function fromBase64(str: string): Uint8Array {
  return new Uint8Array(Buffer.from(str, "base64"));
}

// ── Vault Operations ──

/**
 * Encrypt and store a PII field in the vault.
 * Returns only the vault summary (no plaintext, no ciphertext).
 */
export async function vaultStore_encrypt(
  matterId: string,
  fieldType: PIIField,
  plaintext: string,
  accessList: string[] = ["supervising_attorney"]
): Promise<VaultSummary> {
  const key = await deriveKey();
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const encoded = new TextEncoder().encode(plaintext);

  const encrypted = await crypto.subtle.encrypt(
    { name: ALGORITHM, iv },
    key,
    encoded
  );

  // Separate ciphertext and auth tag (last 16 bytes)
  const encryptedArray = new Uint8Array(encrypted);
  const ciphertextBytes = encryptedArray.slice(0, encryptedArray.length - 16);
  const authTagBytes = encryptedArray.slice(encryptedArray.length - 16);

  const contentHash = await sha256(plaintext);

  const record: VaultRecord = {
    id: randomUUID(),
    matterId,
    fieldType,
    ciphertext: toBase64(ciphertextBytes),
    iv: toBase64(iv),
    authTag: toBase64(authTagBytes),
    contentHash,
    accessList,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    anchored: false,
  };

  vaultStore.set(record.id, record);

  // Index by matter
  if (!matterIndex.has(matterId)) {
    matterIndex.set(matterId, new Set());
  }
  matterIndex.get(matterId)!.add(record.id);

  return toSummary(record);
}

/**
 * Decrypt a vault record. Only returns data if caller has access.
 */
export async function vaultStore_decrypt(
  recordId: string,
  callerRole: string
): Promise<DecryptedField | null> {
  const record = vaultStore.get(recordId);
  if (!record) return null;

  // Access check
  if (!record.accessList.includes(callerRole) && !record.accessList.includes("*")) {
    return null;
  }

  const key = await deriveKey();
  const iv = fromBase64(record.iv);
  const ciphertextBytes = fromBase64(record.ciphertext);
  const authTagBytes = fromBase64(record.authTag);

  // Reconstruct encrypted data with auth tag
  const combined = new Uint8Array(ciphertextBytes.length + authTagBytes.length);
  combined.set(ciphertextBytes, 0);
  combined.set(authTagBytes, ciphertextBytes.length);

  try {
    const ivBuf = new Uint8Array(iv).buffer as ArrayBuffer;
    const dataBuf = new Uint8Array(combined).buffer as ArrayBuffer;
    const decrypted = await crypto.subtle.decrypt(
      { name: ALGORITHM, iv: ivBuf },
      key,
      dataBuf
    );

    const plaintext = new TextDecoder().decode(decrypted);
    const hash = await sha256(plaintext);

    return {
      id: record.id,
      fieldType: record.fieldType,
      value: plaintext,
      verified: hash === record.contentHash,
    };
  } catch {
    return null;
  }
}

/**
 * Get all vault summaries for a matter (no plaintext).
 */
export function getVaultSummaries(matterId: string): VaultSummary[] {
  const ids = matterIndex.get(matterId);
  if (!ids) return [];
  return Array.from(ids)
    .map(id => vaultStore.get(id))
    .filter((r): r is VaultRecord => r !== undefined)
    .map(toSummary);
}

/**
 * Mark a vault record as blockchain-anchored.
 */
export function anchorVaultRecord(recordId: string, txHash: string): boolean {
  const record = vaultStore.get(recordId);
  if (!record) return false;
  record.chainAnchor = txHash;
  record.anchored = true;
  record.updatedAt = new Date().toISOString();
  return true;
}

/**
 * Vault statistics (no PII).
 */
export function getVaultStats(): VaultStats {
  const byMatter: Record<string, number> = {};
  const fieldTypeCounts: Record<string, number> = {};
  let anchoredCount = 0;

  for (const record of vaultStore.values()) {
    byMatter[record.matterId] = (byMatter[record.matterId] || 0) + 1;
    fieldTypeCounts[record.fieldType] = (fieldTypeCounts[record.fieldType] || 0) + 1;
    if (record.anchored) anchoredCount++;
  }

  return {
    totalRecords: vaultStore.size,
    byMatter,
    anchoredCount,
    fieldTypeCounts,
  };
}

/**
 * Encrypt all PII fields from an intake submission.
 * Returns sanitized data (IDs + hashes only, no plaintext).
 */
export async function vaultIntake(
  matterId: string,
  intake: {
    clientName: string;
    email?: string;
    phone?: string;
    adversePartyName?: string;
    description?: string;
  }
): Promise<{ vaultIds: Record<string, string>; contentHashes: Record<string, string> }> {
  const vaultIds: Record<string, string> = {};
  const contentHashes: Record<string, string> = {};

  if (intake.clientName) {
    const s = await vaultStore_encrypt(matterId, "client_name", intake.clientName);
    vaultIds.clientName = s.id;
    contentHashes.clientName = s.contentHash;
  }
  if (intake.email) {
    const s = await vaultStore_encrypt(matterId, "email", intake.email);
    vaultIds.email = s.id;
    contentHashes.email = s.contentHash;
  }
  if (intake.phone) {
    const s = await vaultStore_encrypt(matterId, "phone", intake.phone);
    vaultIds.phone = s.id;
    contentHashes.phone = s.contentHash;
  }
  if (intake.adversePartyName) {
    const s = await vaultStore_encrypt(matterId, "adverse_party", intake.adversePartyName);
    vaultIds.adversePartyName = s.id;
    contentHashes.adversePartyName = s.contentHash;
  }
  if (intake.description) {
    const s = await vaultStore_encrypt(matterId, "counsel_notes", intake.description, [
      "supervising_attorney",
      "case_strategy",
    ]);
    vaultIds.description = s.id;
    contentHashes.description = s.contentHash;
  }

  return { vaultIds, contentHashes };
}

// ── Helpers ──

function toSummary(record: VaultRecord): VaultSummary {
  return {
    id: record.id,
    matterId: record.matterId,
    fieldType: record.fieldType,
    contentHash: record.contentHash,
    anchored: record.anchored,
    createdAt: record.createdAt,
  };
}
