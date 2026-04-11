import { z } from "zod";

// ── Role & Permission System ──

export const UserRole = z.enum([
  "system_admin",
  "supervising_attorney",
  "case_strategist",
  "paralegal",
  "investigator",
  "forensic_analyst",
  "intake_operator",
  "client",
  "family_viewer",
  "auditor",
]);
export type UserRole = z.infer<typeof UserRole>;

export const Permission = z.enum([
  // Matter
  "matter:create",
  "matter:read",
  "matter:write",
  "matter:delete",
  "matter:assign",
  // Evidence
  "evidence:ingest",
  "evidence:read",
  "evidence:classify",
  "evidence:export",
  // Documents
  "document:draft",
  "document:read",
  "document:review",
  "document:approve",
  "document:finalize",
  "document:export",
  // Approvals
  "approval:submit",
  "approval:review",
  "approval:approve",
  "approval:reject",
  // Communications
  "comms:draft",
  "comms:review",
  "comms:send",
  // Research
  "research:query",
  "research:read",
  "research:export",
  // Forensics
  "forensics:ingest",
  "forensics:analyze",
  "forensics:export",
  // Admin
  "admin:users",
  "admin:roles",
  "admin:audit",
  "admin:system",
  // Namespace
  "namespace:read",
  "namespace:download",
  "namespace:message",
  // Marketing
  "marketing:view",
  "marketing:manage",
  "marketing:approve",
  "marketing:analytics",
]);
export type Permission = z.infer<typeof Permission>;

// ── Role-Permission Mapping ──

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  system_admin: Permission.options as unknown as Permission[],
  supervising_attorney: [
    "matter:read", "matter:write", "matter:assign",
    "evidence:read", "evidence:classify", "evidence:export",
    "document:draft", "document:read", "document:review", "document:approve", "document:finalize", "document:export",
    "approval:submit", "approval:review", "approval:approve", "approval:reject",
    "comms:draft", "comms:review", "comms:send",
    "research:query", "research:read", "research:export",
    "forensics:analyze", "forensics:export",
    "namespace:read", "namespace:download",
    "marketing:view", "marketing:manage", "marketing:approve", "marketing:analytics",
  ],
  case_strategist: [
    "matter:read", "matter:write",
    "evidence:read", "evidence:classify",
    "document:draft", "document:read", "document:review",
    "approval:submit",
    "research:query", "research:read", "research:export",
    "forensics:analyze",
  ],
  paralegal: [
    "matter:read", "matter:write",
    "evidence:ingest", "evidence:read", "evidence:classify",
    "document:draft", "document:read",
    "approval:submit",
    "research:query", "research:read",
  ],
  investigator: [
    "matter:read",
    "evidence:ingest", "evidence:read", "evidence:classify", "evidence:export",
    "forensics:ingest", "forensics:analyze",
    "research:query", "research:read",
  ],
  forensic_analyst: [
    "matter:read",
    "evidence:read", "evidence:export",
    "forensics:ingest", "forensics:analyze", "forensics:export",
    "research:query", "research:read",
  ],
  intake_operator: [
    "matter:create", "matter:read",
    "evidence:ingest", "evidence:read",
    "approval:submit",
  ],
  client: [
    "namespace:read", "namespace:download", "namespace:message",
  ],
  family_viewer: [
    "namespace:read", "namespace:download",
  ],
  auditor: [
    "matter:read",
    "evidence:read",
    "document:read",
    "admin:audit",
  ],
};

// ── User Schema ──

export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(1),
  role: UserRole,
  permissions: z.array(Permission).optional(), // overrides beyond role defaults
  matterId: z.string().uuid().optional(), // scoped to specific matter if client/family
  namespaceSlug: z.string().optional(),
  active: z.boolean().default(true),
  createdAt: z.string().datetime(),
  lastLoginAt: z.string().datetime().optional(),
});
export type User = z.infer<typeof UserSchema>;

// ── Session ──

export const SessionSchema = z.object({
  userId: z.string().uuid(),
  role: UserRole,
  permissions: z.array(Permission),
  matterId: z.string().uuid().optional(),
  namespaceSlug: z.string().optional(),
  expiresAt: z.string().datetime(),
});
export type Session = z.infer<typeof SessionSchema>;
