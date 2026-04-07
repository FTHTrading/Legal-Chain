/**
 * ACCESS CONTROL KERNEL
 *
 * Enforces role-based access control, matter-level isolation,
 * and approval gates defined in CONSTITUTION §II-III.
 *
 * Rules:
 *  1. No outbound legal action without explicit human approval
 *  2. Privilege-tagged evidence is invisible to roles without evidence:classify
 *  3. Client/family_viewer can only see their own matter namespace
 *  4. Auditor has read-only access across all matters
 *  5. Only attorney+ can approve documents, finalize filings, or waive privilege
 *  6. Every access check is logged for the audit trail
 */

import type { Permission, UserRole } from "../schemas/user";
import { ROLE_PERMISSIONS } from "../schemas/user";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface AccessSubject {
  userId: string;
  role: UserRole;
  /** Explicit overrides (grants beyond role defaults) */
  extraPermissions?: Permission[];
  /** If set, subject is scoped to this matter only */
  scopedMatterId?: string;
}

export interface AccessTarget {
  /** Permission required */
  permission: Permission;
  /** Matter the resource belongs to */
  matterId?: string;
  /** Is the resource privilege-tagged? */
  privileged?: boolean;
  /** Resource description (for audit log) */
  resourceDescription?: string;
}

export interface AccessDecision {
  allowed: boolean;
  reason: string;
  /** Will be populated by the module for audit trail */
  timestamp: string;
  subject: AccessSubject;
  target: AccessTarget;
}

export type AuditSeverity = "info" | "warn" | "deny" | "escalation";

export interface AccessAuditEntry {
  id: string;
  timestamp: string;
  severity: AuditSeverity;
  userId: string;
  role: UserRole;
  permission: Permission;
  matterId?: string;
  allowed: boolean;
  reason: string;
  resourceDescription?: string;
}

// ─── Outbound Action Gate ───────────────────────────────────────────────────

/** Permissions that constitute outbound legal actions (Constitution §II.A). */
const OUTBOUND_ACTIONS: Permission[] = [
  "document:finalize",
  "document:export",
  "comms:send",
  "evidence:export",
  "forensics:export",
];

/** Roles that can approve outbound actions. */
const OUTBOUND_APPROVERS: UserRole[] = [
  "system_admin", "supervising_attorney",
];

// ─── Storage ────────────────────────────────────────────────────────────────

const KEYS = { accessLog: "unykorn_access_log" } as const;

function loadLog(): AccessAuditEntry[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(KEYS.accessLog) || "[]"); }
  catch { return []; }
}

function saveLog(log: AccessAuditEntry[]): void {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(KEYS.accessLog, JSON.stringify(log)); }
  catch { /* storage full */ }
}

// ─── AccessControl ──────────────────────────────────────────────────────────

export class AccessControl {
  private log: AccessAuditEntry[] = [];
  private loaded = false;

  private ensureLoaded(): void {
    if (this.loaded) return;
    this.log = loadLog();
    this.loaded = true;
  }

  private record(entry: AccessAuditEntry): void {
    this.ensureLoaded();
    this.log.push(entry);
    // Keep last 10 000 entries
    if (this.log.length > 10_000) this.log = this.log.slice(-10_000);
    saveLog(this.log);
  }

  // ─── Core Check ────────────────────────────────────────────────────

  /** Evaluate whether subject can perform action on target. */
  check(subject: AccessSubject, target: AccessTarget): AccessDecision {
    const now = new Date().toISOString();

    // 1. Gather effective permissions
    const rolePerms = ROLE_PERMISSIONS[subject.role] ?? [];
    const effective = new Set<string>([
      ...rolePerms,
      ...(subject.extraPermissions ?? []),
    ]);

    // 2. Permission present?
    if (!effective.has(target.permission)) {
      return this.deny(subject, target, now, "Permission not granted for role");
    }

    // 3. Matter isolation (client / family_viewer are scoped)
    if (subject.scopedMatterId && target.matterId
        && subject.scopedMatterId !== target.matterId) {
      return this.deny(subject, target, now, "Matter isolation: subject scoped to different matter");
    }

    // 4. Privilege guard — only evidence:classify holders can see privileged items
    if (target.privileged && !effective.has("evidence:classify")) {
      return this.deny(subject, target, now, "Privilege-tagged: evidence:classify required");
    }

    // 5. Outbound action gate — requires attorney-level role
    if ((OUTBOUND_ACTIONS as string[]).includes(target.permission)) {
      if (!OUTBOUND_APPROVERS.includes(subject.role)) {
        return this.deny(subject, target, now,
          "Outbound legal action requires supervising_attorney or system_admin");
      }
    }

    // Allowed
    return this.allow(subject, target, now);
  }

  /** Check + throw if denied. */
  enforce(subject: AccessSubject, target: AccessTarget): void {
    const decision = this.check(subject, target);
    if (!decision.allowed) {
      throw new AccessDeniedError(decision.reason, decision);
    }
  }

  // ─── Convenience ───────────────────────────────────────────────────

  hasPermission(role: UserRole, permission: Permission): boolean {
    const perms = ROLE_PERMISSIONS[role] ?? [];
    return (perms as string[]).includes(permission);
  }

  canApproveOutbound(role: UserRole): boolean {
    return OUTBOUND_APPROVERS.includes(role);
  }

  getEffectivePermissions(subject: AccessSubject): Permission[] {
    const rolePerms = ROLE_PERMISSIONS[subject.role] ?? [];
    const extra = subject.extraPermissions ?? [];
    return [...new Set([...rolePerms, ...extra])] as Permission[];
  }

  // ─── Audit Log ─────────────────────────────────────────────────────

  getAuditLog(filters?: {
    userId?: string;
    matterId?: string;
    allowed?: boolean;
    severity?: AuditSeverity;
    since?: string;
  }): AccessAuditEntry[] {
    this.ensureLoaded();
    let entries = this.log;
    if (filters?.userId) entries = entries.filter(e => e.userId === filters.userId);
    if (filters?.matterId) entries = entries.filter(e => e.matterId === filters.matterId);
    if (filters?.allowed !== undefined) entries = entries.filter(e => e.allowed === filters.allowed);
    if (filters?.severity) entries = entries.filter(e => e.severity === filters.severity);
    if (filters?.since) entries = entries.filter(e => e.timestamp >= filters.since!);
    return entries;
  }

  getDenials(limit = 50): AccessAuditEntry[] {
    this.ensureLoaded();
    return this.log.filter(e => !e.allowed).slice(-limit);
  }

  get auditEntryCount(): number { this.ensureLoaded(); return this.log.length; }
  get denialCount(): number { this.ensureLoaded(); return this.log.filter(e => !e.allowed).length; }

  // ─── Internal ──────────────────────────────────────────────────────

  private deny(subject: AccessSubject, target: AccessTarget, ts: string, reason: string): AccessDecision {
    this.record({
      id: crypto.randomUUID(),
      timestamp: ts,
      severity: "deny",
      userId: subject.userId,
      role: subject.role,
      permission: target.permission,
      matterId: target.matterId,
      allowed: false,
      reason,
      resourceDescription: target.resourceDescription,
    });
    return { allowed: false, reason, timestamp: ts, subject, target };
  }

  private allow(subject: AccessSubject, target: AccessTarget, ts: string): AccessDecision {
    this.record({
      id: crypto.randomUUID(),
      timestamp: ts,
      severity: "info",
      userId: subject.userId,
      role: subject.role,
      permission: target.permission,
      matterId: target.matterId,
      allowed: true,
      reason: "Granted",
      resourceDescription: target.resourceDescription,
    });
    return { allowed: true, reason: "Granted", timestamp: ts, subject, target };
  }

  reset(): void {
    this.log = [];
    this.loaded = true;
    if (typeof window !== "undefined") localStorage.removeItem(KEYS.accessLog);
  }
}

// ─── Error ──────────────────────────────────────────────────────────────────

export class AccessDeniedError extends Error {
  constructor(message: string, public decision: AccessDecision) {
    super(`Access denied: ${message}`);
    this.name = "AccessDeniedError";
  }
}
