/**
 * Private Link System
 *
 * Generates HMAC-signed, time-limited URLs for accessing case data.
 * Each link is tied to a specific matter + scope + expiry.
 * No client PII is ever embedded in the URL — only an opaque token
 * that is validated server-side before decrypting vault records.
 */

import { randomUUID } from "crypto";

// ── Types ──

export type LinkScope =
  | "full_case"        // All case data including PII
  | "case_summary"     // Non-PII summary only
  | "investigation"    // Investigation report
  | "documents"        // Document attachments
  | "report_pdf"       // Generated PDF report
  | "evidence"         // Evidence chain
  | "financial"        // Billing/settlement data
  | "defense_plan";    // Strategy docs

export interface PrivateLink {
  id: string;
  token: string;          // HMAC-signed opaque token
  matterId: string;
  scope: LinkScope;
  createdBy: string;       // Role or wallet address
  createdAt: string;
  expiresAt: string;
  maxUses: number;
  usedCount: number;
  revoked: boolean;
  /** IP whitelist (empty = any) */
  allowedIPs: string[];
  /** Require wallet signature to access */
  requiresWalletAuth: boolean;
  /** Specific vault record IDs this link can access */
  vaultRecordIds: string[];
}

export interface LinkValidation {
  valid: boolean;
  reason?: string;
  link?: PrivateLink;
}

// ── Link Store ──

const linkStore = new Map<string, PrivateLink>();
const tokenIndex = new Map<string, string>(); // token → link ID

// ── HMAC Signing ──

const LINK_SECRET = process.env.LINK_SECRET || "unykorn-law-private-links-change-in-production";

async function hmacSign(data: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(LINK_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
  return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, "0")).join("");
}

async function hmacVerify(data: string, signature: string): Promise<boolean> {
  const expected = await hmacSign(data);
  // Constant-time comparison
  if (expected.length !== signature.length) return false;
  let result = 0;
  for (let i = 0; i < expected.length; i++) {
    result |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
  }
  return result === 0;
}

// ── Link Operations ──

/**
 * Generate a signed private link for case access.
 */
export async function createPrivateLink(opts: {
  matterId: string;
  scope: LinkScope;
  createdBy: string;
  expiresInHours?: number;
  maxUses?: number;
  allowedIPs?: string[];
  requiresWalletAuth?: boolean;
  vaultRecordIds?: string[];
}): Promise<PrivateLink> {
  const id = randomUUID();
  const expiresAt = new Date(
    Date.now() + (opts.expiresInHours || 24) * 60 * 60 * 1000
  ).toISOString();

  // Sign: id + matterId + scope + expiry
  const payload = `${id}:${opts.matterId}:${opts.scope}:${expiresAt}`;
  const signature = await hmacSign(payload);
  const token = `plk_${Buffer.from(`${id}:${signature}`).toString("base64url")}`;

  const link: PrivateLink = {
    id,
    token,
    matterId: opts.matterId,
    scope: opts.scope,
    createdBy: opts.createdBy,
    createdAt: new Date().toISOString(),
    expiresAt,
    maxUses: opts.maxUses || 10,
    usedCount: 0,
    revoked: false,
    allowedIPs: opts.allowedIPs || [],
    requiresWalletAuth: opts.requiresWalletAuth || false,
    vaultRecordIds: opts.vaultRecordIds || [],
  };

  linkStore.set(id, link);
  tokenIndex.set(token, id);

  return link;
}

/**
 * Validate a private link token.
 * Checks expiry, revocation, usage limits, and HMAC signature.
 */
export async function validatePrivateLink(
  token: string,
  clientIP?: string
): Promise<LinkValidation> {
  const linkId = tokenIndex.get(token);
  if (!linkId) {
    return { valid: false, reason: "Invalid token" };
  }

  const link = linkStore.get(linkId);
  if (!link) {
    return { valid: false, reason: "Link not found" };
  }

  if (link.revoked) {
    return { valid: false, reason: "Link has been revoked" };
  }

  if (new Date(link.expiresAt) < new Date()) {
    return { valid: false, reason: "Link has expired" };
  }

  if (link.usedCount >= link.maxUses) {
    return { valid: false, reason: "Link usage limit exceeded" };
  }

  // IP whitelist check
  if (link.allowedIPs.length > 0 && clientIP && !link.allowedIPs.includes(clientIP)) {
    return { valid: false, reason: "IP not authorized" };
  }

  // Verify HMAC signature
  try {
    const decoded = Buffer.from(token.replace("plk_", ""), "base64url").toString();
    const [id, sig] = decoded.split(":");
    if (!id || !sig) return { valid: false, reason: "Malformed token" };

    const payload = `${id}:${link.matterId}:${link.scope}:${link.expiresAt}`;
    const signatureValid = await hmacVerify(payload, sig);
    if (!signatureValid) {
      return { valid: false, reason: "Invalid signature" };
    }
  } catch {
    return { valid: false, reason: "Token verification failed" };
  }

  // Increment usage
  link.usedCount++;

  return { valid: true, link };
}

/**
 * Revoke a private link immediately.
 */
export function revokePrivateLink(linkId: string): boolean {
  const link = linkStore.get(linkId);
  if (!link) return false;
  link.revoked = true;
  return true;
}

/**
 * Get all active links for a matter (for management dashboard).
 */
export function getMatterLinks(matterId: string): PrivateLink[] {
  return Array.from(linkStore.values())
    .filter(l => l.matterId === matterId && !l.revoked);
}

/**
 * Generate a public-safe URL path from a private link token.
 * This URL contains NO PII — only the opaque signed token.
 */
export function buildPrivateLinkURL(token: string, baseUrl?: string): string {
  const base = baseUrl || process.env.NEXT_PUBLIC_BASE_URL || "https://law.unykorn.org";
  return `${base}/api/cases/private?token=${encodeURIComponent(token)}`;
}

/**
 * Link statistics (no PII).
 */
export function getLinkStats(): {
  totalLinks: number;
  activeLinks: number;
  revokedLinks: number;
  expiredLinks: number;
} {
  let active = 0;
  let revoked = 0;
  let expired = 0;
  const now = new Date();

  for (const link of linkStore.values()) {
    if (link.revoked) { revoked++; continue; }
    if (new Date(link.expiresAt) < now) { expired++; continue; }
    active++;
  }

  return { totalLinks: linkStore.size, activeLinks: active, revokedLinks: revoked, expiredLinks: expired };
}
