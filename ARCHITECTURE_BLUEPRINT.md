# ARCHITECTURE BLUEPRINT — UNYKORN LAW
## Sovereign Legal Execution System

---

## Target Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Next.js 16 App Router                    │
│  ┌──────────┬──────────┬──────────┬──────────┬───────────┐  │
│  │  Rescue  │   Ops    │  Matter  │  Portal  │   Admin   │  │
│  │  Apps    │  Console │  Views   │  Client  │  Billing  │  │
│  └──────────┴──────────┴──────────┴──────────┴───────────┘  │
├─────────────────────────────────────────────────────────────┤
│                    Middleware Layer                          │
│  Auth · RBAC · Rate Limit · Correlation ID · Logging        │
├─────────────────────────────────────────────────────────────┤
│                    API Layer (Route Handlers)                │
│  /api/matters · /api/documents · /api/evidence · /api/...   │
├──────────┬──────────┬──────────┬──────────┬─────────────────┤
│  Auth    │  Data    │  Queue   │  Storage │  Notification   │
│  NextAuth│  Prisma  │  BullMQ  │  S3/R2   │  Email/SMS      │
│  + RBAC  │  + PG    │  + Redis │  Signed  │  Resend/Twilio  │
├──────────┴──────────┴──────────┴──────────┴─────────────────┤
│                    Core Modules                             │
│  ┌──────────┬──────────┬──────────┬──────────┬───────────┐  │
│  │  Truth   │  Agent   │  Doc     │  RAG     │  Privacy  │  │
│  │  Kernel  │  Runtime │  Engine  │  Pipeline│  Vault    │  │
│  └──────────┴──────────┴──────────┴──────────┴───────────┘  │
├─────────────────────────────────────────────────────────────┤
│                    External Services                        │
│  PostgreSQL · Redis · S3/R2 · OpenAI · Anthropic · Stripe  │
│  Apostle Chain (ATP) · Resend (Email) · Twilio (SMS)        │
└─────────────────────────────────────────────────────────────┘
```

## Technology Decisions

| Concern | Technology | Rationale |
|---------|-----------|-----------|
| Database | PostgreSQL + Prisma ORM | Relational data, mature, free tier on Neon/Supabase/Railway |
| Auth | NextAuth.js v5 (Auth.js) | Native Next.js integration, credential + OAuth support |
| Queue | BullMQ + Redis (or pg-boss for PG-only) | Job durability, retries, dead-letter |
| File Storage | Cloudflare R2 or AWS S3 | Signed URLs, lifecycle, cheap |
| Email | Resend | Developer-friendly, generous free tier |
| SMS | Twilio | Industry standard, reliable |
| Caching | Redis (or Upstash) | Session store, rate limits, cache |
| Monitoring | Sentry + Pino structured logs | Error tracking, request tracing |
| PDF | pdf-lib (existing) + extended templates | Already in stack, works well |
| DOCX | docx (npm) | For Word format exports |
| Testing | Vitest + Playwright | Fast unit tests, real browser E2E |

## Data Domain Boundaries

### Core Domains
1. **Users & Auth** — users, sessions, accounts, roles, permissions
2. **Matters** — matters, parties, claims, status lifecycle
3. **Intakes** — intake submissions, triage, conflict checks
4. **Documents** — templates, generations, versions, exports, approvals
5. **Evidence** — uploads, metadata, hashes, chain-of-custody events
6. **Timelines** — timeline events linked to matters + evidence
7. **Approvals** — approval requests, reviews, decisions
8. **Research** — queries, results, source records, citations
9. **Forensics** — crypto incidents, wallets, chains, traces
10. **Audit** — immutable event log, entity history
11. **Notifications** — messages, delivery status, preferences
12. **Billing** — Stripe customers, subscriptions, invoices

### Document Engine Boundaries
- `document_templates` — reusable template definitions
- `document_generations` — generated document records with metadata
- `document_versions` — version chain per document
- `document_exports` — PDF/DOCX/HTML export records
- `document_signatures` — signature block records
- `source_citations` — verified source links per document
- `redline_comparisons` — diff records between versions

### Audit/Proof Boundaries
- `audit_events` — immutable append-only log
- `entity_changes` — field-level change history
- `evidence_hashes` — SHA-256 records for uploaded files
- `generation_provenance` — template + data snapshot for each doc gen
- `approval_trail` — decision records with reviewer, timestamp, rationale

## API Design

All APIs follow:
- JSON request/response
- Zod validation on all inputs
- Correlation ID header (`x-correlation-id`)
- Consistent error shape: `{ ok: false, error: string, code: string }`
- Auth required except explicitly public endpoints

### Public (No Auth)
- `POST /api/widgets/intake` — rescue app intake
- `POST /api/widgets/crypto-recovery` — rescue app crypto report
- `POST /api/widgets/demand-letter` — rescue app demand letter
- `POST /api/widgets/callback` — callback request
- `GET /api/proof/health` — health check
- `GET /api/cases/private?token=...` — private link access

### Protected (Auth Required)

---

## Feature 9 — Systems Overview Page

**Route:** `/systems`
**File:** `src/app/systems/page.tsx`
**Facing:** Public (no auth required)

Standalone page describing all 12 core systems in the case lifecycle. Includes a 9-step "Case Flow" section showing how a matter moves from intake to proof. Each system card shows: purpose, when used, inputs, outputs, how it advances the case, and client-facing/internal designation. Uses `FIRM` config for contact details. QR-shareable, mobile-friendly.

### 12 Systems Covered
1. Rapid Intake
2. Demand Letter Engine
3. Crypto Recovery System
4. Evidence Timeline / Evidence Drop
5. Client Status Portal
6. Matter Orchestrator
7. Research + Citation Verification
8. Document Generation Engine
9. Approval Queue
10. Forensics / Proof Bundle System
11. Internal Email / Notification System
12. Ops Command Center

---

## Feature 10 — Firm Identity Block

**File:** `src/lib/firm.ts`
**Export:** `FIRM` constant, `FirmIdentity` type

Single source of truth for all firm identity data. Consumed by: email templates, page footers, PDF headers, letter signatures, API responses.

| Key | Value |
|-----|-------|
| Legal Name | UNYKORN // LAW |
| Address | 5655 Peachtree Pkwy, Peachtree, GA 30099 |
| Domain | unykorn.law |
| System Emails | intake@, cases@, evidence@, approvals@, recovery@, research@, status@, alerts@, support@, noreply@ |
| Dynamic Aliases | `matter-{id}@`, `case-{ref}@`, `proof-{id}@` |

---

## Feature 11 — Internal Email System

### Schema Models
- `EmailTemplate` — Reusable templates with {{variable}} interpolation (table: `email_templates`)
- `EmailLog` — Immutable send log with status tracking and approval gate (table: `email_logs`)

### Template Types (enum `EmailTemplateType`)
`intake_receipt`, `evidence_receipt`, `demand_delivery`, `status_update`, `deadline_reminder`, `approval_request`, `approval_result`, `case_assignment`, `document_delivery`, `escalation_alert`, `welcome`, `custom`

### Architecture
```
System Event → Template Resolution → Variable Interpolation → Approval Gate → SMTP Dispatch → Audit Log
                                                  ↓
                                           [pending_approval]
                                                  ↓
                                    Approval Queue → approve/reject
                                                  ↓
                                            SMTP Dispatch
```

### Files
| File | Purpose |
|------|---------|
| `src/lib/email/templates.ts` | 11 built-in template definitions, interpolation engine, render function |
| `src/lib/email/send.ts` | Send service: queue, resolve, render, dispatch, approve/reject |
| `src/app/api/email/send/route.ts` | POST endpoint — queue an email |
| `src/app/api/email/templates/route.ts` | GET list / POST create templates |
| `src/app/api/email/approve/route.ts` | POST approve or reject pending emails |

### API Endpoints
| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| POST | `/api/email/send` | `comm:send` | Queue email for sending |
| GET | `/api/email/templates` | `comm:view` | List all templates |
| POST | `/api/email/templates` | `comm:send` | Create custom template |
| POST | `/api/email/approve` | `approval:review` | Approve or reject pending email |

### SMTP Provider
Stubbed — dispatches update status to `sent` in DB. Plug in Resend, SES, or Postmark to `dispatchEmail()` in `src/lib/email/send.ts`.

---

## MCP Agentic Marketing & Revenue Activation System

### Doctrine
Each of the 5 widget apps is treated as an independent acquisition machine. Launch sequentially — highest-ticket first. Every marketing action is approval-gated, audit-logged, and Constitution-compliant.

### Schema Models
- `MarketDefinition` — Per-widget-app market profile: ICP, pain points, competitor map, trust barriers (table: `market_definitions`)
- `Campaign` — Multi-channel marketing campaign with budget, metrics, approval state (table: `campaigns`)
- `MarketingAsset` — Generated content: ad copy, landing pages, email sequences, social posts (table: `marketing_assets`)
- `LeadRecord` — Inbound lead tracking with scoring, UTM attribution, conversion pipeline (table: `lead_records`)

### New Enums
- `WidgetAppId` — 5 values: emergency_intake, demand_letter, crypto_recovery, evidence_drop, status_help
- `CampaignStatus` — 8 values: draft → staged → pending_approval → approved → active → paused → completed → killed
- `AssetType` — 15 values: landing_page, ad_copy, email_sequence, sms_sequence, social_post, headline, cta, one_pager, etc.
- `ChannelType` — 11 values: paid_search, paid_social, organic_social, seo, email_outbound, sms_outbound, referral, etc.
- `AgentTeam` — Extended with `marketing_revenue` (10th team)

### Marketing Agent Squadron (10 agents)
| Agent | Role | Key Capabilities |
|-------|------|-------------------|
| Revenue Commander | Orchestrator | campaign_orchestration, budget_allocation, kill_campaign |
| Market Intelligence | Research | market_research, competitor_analysis, icp_definition |
| Offer Strategy | Strategy | offer_design, pricing_strategy, urgency_framing |
| Funnel Architect | Design | funnel_design, landing_page_spec, cta_optimization |
| Content Engine | Content | ad_copy, email_sequence, social_content, authority_content |
| Outreach | Execution | email_outreach, sms_followup, partnership_outreach |
| Paid Acquisition | Media | ad_targeting, bid_optimization, creative_rotation |
| Conversion Ops | Optimization | lead_scoring, followup_automation, booking_optimization |
| Analytics | Intelligence | kpi_tracking, cohort_analysis, attribution, kill_recommendation |
| Brand & Compliance | Governance | brand_review, compliance_check, tone_alignment, approve_asset |

### Revenue Priority Order
1. Crypto Recovery — $10K avg lead value (highest ticket)
2. Emergency Intake — $5K avg, critical urgency
3. Demand Letter Now — $2K avg, self-serve funnel
4. Evidence Drop — $3K avg, active-case upsell
5. Status + Help — $1K avg, retention/upsell

### API Endpoints
| Method | Path | Permission | Purpose |
|--------|------|------------|---------|
| POST | `/api/orchestrator/marketing/init` | marketing:manage | Initialize agents + seed market definitions |
| POST | `/api/orchestrator/marketing/launch` | marketing:manage | Create campaign for widget app |
| GET | `/api/orchestrator/marketing/launch` | marketing:view | List campaigns (filterable) |
| POST | `/api/orchestrator/marketing/assets` | marketing:manage | Create marketing asset |
| GET | `/api/orchestrator/marketing/assets` | marketing:view | List assets (filterable) |
| POST | `/api/orchestrator/marketing/approvals` | marketing:approve | Approve/reject campaign or asset |
| GET | `/api/orchestrator/marketing/approvals` | marketing:view | List pending approvals |
| GET | `/api/orchestrator/marketing/analytics` | marketing:analytics | KPIs, leads, revenue metrics |
| POST | `/api/orchestrator/marketing/followup` | marketing:manage | Stale leads, auto-qualify, flag campaigns |

### Permissions Added
`marketing:view`, `marketing:manage`, `marketing:approve`, `marketing:analytics` — granted to system_admin (all) and supervising_attorney.

### Files
| File | Purpose |
|------|---------|
| `src/lib/marketing/config.ts` | Widget app inventory, ICP profiles, revenue priority, constants |
| `src/lib/marketing/orchestrator.ts` | Core operations: init, campaign CRUD, analytics aggregation |
| `src/lib/agents/marketing-roster.ts` | 10 marketing agent definitions with capabilities and escalation triggers |
| `src/app/ops/marketing/page.tsx` | Revenue Commander dashboard — priority board, agent squadron, API reference |
| `src/app/api/orchestrator/marketing/*/route.ts` | 6 API route files (init, launch, assets, approvals, analytics, followup) |

### Architecture Flow
```
Revenue Commander
  ├─ Market Intelligence → ICP + competitor map per widget app
  ├─ Offer Strategy → value props, pricing hooks, urgency triggers
  ├─ Funnel Architect → awareness → conversion path design
  ├─ Content Engine → generate assets (all require approval)
  │     └─ Brand & Compliance → review + approve/reject
  ├─ Outreach → email/SMS sequences (opt-in only)
  ├─ Paid Acquisition → Google/Meta/LinkedIn ad management
  ├─ Conversion Ops → lead scoring, follow-up automation
  └─ Analytics → KPIs, attribution, kill recommendations
```
- All `/api/matters/*`
- All `/api/documents/*`
- All `/api/evidence/*`
- All `/api/approvals/*`
- All `/api/forensics/*`
- All `/api/orchestrator/*`
- All `/api/vault/*`
- All `/api/research/*`

### Admin Only
- `POST /api/agents/dispatch`
- `POST /api/agents/execute`
- `GET /api/audit`
- `POST /api/kernel`
