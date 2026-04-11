# SECURITY & RBAC — UNYKORN LAW

> Authentication, authorization, and access control architecture.

## Authentication Stack

| Component | Technology | Notes |
|-----------|-----------|-------|
| Auth framework | NextAuth v5 (Auth.js) | JWT sessions, Prisma adapter |
| Password hashing | bcryptjs | Credentials provider |
| Session strategy | JWT | Stateless, role/permissions embedded |
| Middleware | Next.js edge middleware | Route protection via `auth()` |
| Config file | `src/lib/auth.ts` | Central auth configuration |
| API route | `src/app/api/auth/[...nextauth]/route.ts` | OAuth + credentials handler |

## Role Hierarchy (10 Roles)

| Role | Scope | Key Permissions |
|------|-------|-----------------|
| `system_admin` | Global | ALL permissions — full system access |
| `supervising_attorney` | All matters | Draft/review/approve/finalize documents, send communications, full evidence access |
| `case_strategist` | Assigned matters | Draft/review documents, submit approvals, research, forensics analysis |
| `paralegal` | Assigned matters | Ingest/classify evidence, draft documents, submit approvals, research |
| `investigator` | Assigned matters | Ingest/classify/export evidence, forensics, research |
| `forensic_analyst` | Assigned matters | Evidence read/export, full forensics, research |
| `intake_operator` | Intake only | Create matters, read matters, ingest evidence, submit approvals |
| `client` | Own namespace | Read namespace, download packets, send messages |
| `family_viewer` | Own namespace | Read namespace, download packets (no messaging) |
| `auditor` | Read-only global | Read matters, evidence, documents, audit logs |

## Permission System (60+ Granular Permissions)

Categories: `matter:*`, `evidence:*`, `document:*`, `approval:*`, `comms:*`, `research:*`, `forensics:*`, `admin:*`, `namespace:*`

Source of truth: `src/lib/schemas/user.ts` → `ROLE_PERMISSIONS` map

### Permission Resolution Order
1. `system_admin` → all permissions (short-circuit)
2. User's extra `permissions[]` array (per-user overrides)
3. Role's default permissions via `ROLE_PERMISSIONS[role]`

## RBAC Helper Functions

File: `src/lib/rbac.ts`

| Function | Purpose | Throws |
|----------|---------|--------|
| `getSession()` | Get current session or null | — |
| `requireAuth()` | Require login | 401 |
| `requirePermission(perm)` | Require specific permission | 401/403 |
| `requireRole(...roles)` | Require one of listed roles | 401/403 |
| `hasPermission(role, perms, perm)` | Pure check (no throw) | — |
| `roleHasPermission(role, perm)` | Check role default | — |

### Usage in API Routes

```typescript
// Require authentication
const session = await requireAuth();

// Require specific permission
const session = await requirePermission("document:approve");

// Require one of several roles
const session = await requireRole("system_admin", "supervising_attorney");
```

## Route Protection

### Middleware (`middleware.ts`)
- Exports `auth` as middleware (NextAuth v5 pattern)
- Matches all routes except static assets
- `authorized` callback in auth config handles route-level decisions

### Public Routes (No Auth Required)
- `/rescue/*` — All rescue apps (public-facing emergency intake)
- `/api/auth/*` — NextAuth endpoints
- `/login` — Login page
- `/` — Landing page

### Protected Routes (Auth Required)
- `/dashboard/*` — All dashboard pages
- `/matters/*` — Matter management
- `/documents/*` — Document workspace
- `/approvals/*` — Approval queue
- `/evidence/*` — Evidence management
- `/forensics/*` — Forensic cases
- `/research/*` — Legal research
- `/admin/*` — Admin panel (requires `admin:*` permissions)
- `/api/*` — All API endpoints (except auth)

## Constitution Rules (Enforced)

1. **No outbound legal action without explicit human approval** — `document:finalize`, `document:export`, `comms:send`, `evidence:export`, `forensics:export` require `supervising_attorney` or `system_admin` approval
2. **Privilege-tagged evidence** — invisible to roles without `evidence:classify`
3. **Client/family_viewer** — scoped to own matter only via namespace access
4. **Auditor** — read-only across all matters, cannot modify
5. **Every access check logged** — audit trail captures all permission decisions

## Session Shape (JWT)

```typescript
{
  user: {
    id: string;       // User.id (cuid)
    email: string;
    name: string | null;
    role: UserRole;
    permissions: string[];  // Extra permissions beyond role defaults
    image?: string | null;
  }
}
```

## Security Headers

Recommended (to add in `next.config.ts`):
- `Strict-Transport-Security: max-age=31536000; includeSubDomains`
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Content-Security-Policy: default-src 'self'`

## Secrets Management

| Variable | Purpose | Required |
|----------|---------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `NEXTAUTH_SECRET` | JWT signing key (≥32 bytes random) | Yes |
| `NEXTAUTH_URL` | Canonical app URL | Yes (production) |
