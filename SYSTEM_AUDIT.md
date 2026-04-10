# SYSTEM AUDIT — UNYKORN LAW
## Date: 2026-04-08 | Auditor: Genesis Build System

---

## Executive Summary

Legal-Chain is a Next.js 16 application with 26 AI agents, Truth Kernel ledger, privacy vault, Stripe billing, and Apostle Chain integration. The application surface is substantial (25+ pages, 35+ API routes, 16 Zod schemas, 11-module kernel) — but the infrastructure is fundamentally **pre-production**: no database, no authentication, no file storage, zero tests.

**Readiness Score: 40%** — Strong architecture and schemas, critical infrastructure missing.

---

## Architecture Inventory

| Layer | Component | Status |
|-------|-----------|--------|
| Frontend | Next.js 16 App Router, 25+ pages | ✅ Working |
| API | 35+ route handlers | ✅ Working (in-memory) |
| Database | None | ❌ Critical gap |
| Auth | None | ❌ Critical gap |
| File Storage | None | ❌ Critical gap |
| Queue/Jobs | None | ❌ Critical gap |
| Monitoring | None | ❌ Missing |
| Tests | Zero | ❌ Missing |
| AI/LLM | OpenAI + Anthropic | ✅ Working |
| Payments | Stripe (partial) + ATP | ⚠️ Incomplete |
| Privacy | AES-256-GCM vault | ✅ Working |
| PDF Gen | pdf-lib | ✅ Working (basic) |

## Route Inventory

### UI Pages (25)
- `/` — Homepage with hero, stats, intake
- `/rescue` — QR Hub launcher (5 rescue apps)
- `/rapid-intake` — Emergency Intake
- `/demand-letter` — Demand Letter Now
- `/crypto-recovery` — Crypto Recovery Report
- `/evidence-timeline` — Evidence Drop
- `/client-status` — Status + Help
- `/widgets` — Redirect → /rescue
- `/intake` — Full intake form
- `/law` + `/law/matters/[id]` + sub-routes — Matter lifecycle
- `/cases` — Case dashboard
- `/documents` — Document list
- `/proof` — Proof dashboard
- `/portal/[namespace]` — Client portal
- `/subscribe` + `/subscribe/success` — Billing
- `/ops` + 6 sub-pages — Operations console
- `/media` — Gallery
- `/beta` — Beta signup

### API Routes (35+)
- `/api/agents/*` — Agent dispatch, execute, logs
- `/api/ai/*` — Chat, embed, status
- `/api/approvals` — Approval queue CRUD
- `/api/audit` — Audit log
- `/api/cases/private` — Private link access
- `/api/documents/*` — List, generate PDF
- `/api/evidence` — Evidence list
- `/api/forensics` — Forensic cases (token-gated)
- `/api/hardship/apply` — Hardship applications
- `/api/intake` — Intake CRUD
- `/api/kernel` — Truth Kernel operations
- `/api/matters/*` — Matter CRUD
- `/api/orchestrator/*` — Workflow orchestration
- `/api/payments/crypto/verify` — Crypto payment verification
- `/api/proof/*` — Demo, health
- `/api/rag/*` — Ingest, query, status
- `/api/reports` — Report generation
- `/api/research` — Research workbench
- `/api/verify` — Bundle verification
- `/api/vault` — Privacy vault
- `/api/stripe/*` — Checkout, portal, setup, webhook
- `/api/beta/*` — Signup, promote
- `/api/widgets/*` — Widget endpoints

## Schema Inventory (16 Zod files)
- agent, approval, audit, civil-legal-needs, communication, criminal-severity
- document, forensics, intake, matter, namespace, research, user, workflow
- widget-schemas (5 form schemas)

## Reliability Issues
1. All server state in-memory — lost on restart
2. No retry/circuit-breaker on LLM calls
3. 60s maxDuration on doc generation w/o queue fallback
4. Inconsistent error handling across routes
5. No request correlation IDs
6. No graceful degradation when API keys missing

## Security Issues
1. No auth on 80% of API routes
2. No global rate limiting middleware
3. No CSRF protection
4. Vault keys derived from env (no KMS)
5. Private link tokens in query strings
6. No request logging / audit trail for API calls
7. No HTTPS enforcement headers
8. Stripe webhook idempotency not tracked

## Data Flow Map
```
User → Rescue App → /api/widgets/* → In-Memory Store (localStorage on client)
User → Intake → /api/intake → In-Memory Seed Data
User → Matter → /api/matters → In-Memory Seed Data
User → Document → /api/documents/generate → pdf-lib → Download Blob
User → Orchestrator → /api/orchestrator → In-Memory Map → LLM Call
User → Proof → /api/kernel → Truth Kernel (in-memory)
User → Payment → /api/stripe/* → Stripe API
```

## Launch Blockers
1. **P0**: PostgreSQL database — all core data must persist
2. **P0**: Authentication + RBAC — protect all sensitive routes
3. **P0**: File/object storage — evidence, documents, uploads
4. **P1**: Background job queue — doc gen, OCR, hashing
5. **P1**: Citation verification — no fake citations
6. **P1**: Test suite — unit, integration, e2e
7. **P1**: Logging + monitoring — structured logs, health checks
8. **P2**: Email/SMS notifications
9. **P2**: Document versioning + redline
