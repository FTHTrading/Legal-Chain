<p align="center">
  <img src="https://img.shields.io/badge/UNYKORN_%2F%2F_LAW-Legal_Chain-c9a84c?style=for-the-badge&labelColor=080b16" alt="UNYKORN // LAW" />
</p>

<h1 align="center">
  ⚖️ LEGAL CHAIN
</h1>

<p align="center">
  <strong>Sovereign Legal Intelligence Operating System</strong><br/>
  <em>AI-accelerated legal operations under strict human supervision</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16.2.2-000000?style=flat-square&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19.2.4-61DAFB?style=flat-square&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Zod-4.3.6-3E67B1?style=flat-square" alt="Zod" />
  <img src="https://img.shields.io/badge/Tailwind-v4-06B6D4?style=flat-square&logo=tailwindcss" alt="Tailwind" />
  <img src="https://img.shields.io/badge/Chain-7332-c9a84c?style=flat-square" alt="Apostle Chain" />
  <img src="https://img.shields.io/badge/Agents-26-c9a84c?style=flat-square" alt="26 Agents" />
  <img src="https://img.shields.io/badge/License-Proprietary-red?style=flat-square" alt="License" />
</p>

<p align="center">
  <a href="#-architecture">Architecture</a> •
  <a href="#-product-surfaces">Surfaces</a> •
  <a href="#-schema-layer">Schemas</a> •
  <a href="#-api-routes">API</a> •
  <a href="#-operations-console">Ops Console</a> •
  <a href="#-forensics-engine">Forensics</a> •
  <a href="#-agent-network">Agents</a> •
  <a href="#-constitution">Constitution</a> •
  <a href="#-getting-started">Setup</a>
</p>

---

## 📋 Table of Contents

| # | Section | Description |
|:-:|:--------|:------------|
| 🏗️ | [**Architecture**](#-architecture) | System topology, tech stack, design system |
| 🖥️ | [**Product Surfaces**](#-product-surfaces) | All 20 routes — pages and API endpoints |
| 📐 | [**Schema Layer**](#-schema-layer) | 12 Zod schema modules with full type safety |
| 🔌 | [**API Routes**](#-api-routes) | 9 RESTful route handlers |
| ⚙️ | [**Operations Console**](#-operations-console) | 7-panel ops dashboard |
| 🔍 | [**Forensics Engine**](#-forensics-engine) | Web3 blockchain forensics |
| 🤖 | [**Agent Network**](#-agent-network) | 26-agent MCP control plane |
| 📜 | [**Constitution**](#-constitution) | System governance rules |
| 🗂️ | [**Project Structure**](#-project-structure) | File tree |
| 🚀 | [**Getting Started**](#-getting-started) | Install, build, deploy |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        UNYKORN // LAW                              │
│                   Legal Intelligence Platform                       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌───────────┐  ┌──────────────┐  ┌──────────────┐  ┌───────────┐ │
│  │  Landing   │  │  Case        │  │  Operations  │  │  Client   │ │
│  │  Page      │  │  Workspace   │  │  Console     │  │  Portal   │ │
│  │  /         │  │  /law/*      │  │  /ops/*      │  │  /portal  │ │
│  └─────┬─────┘  └──────┬───────┘  └──────┬───────┘  └─────┬─────┘ │
│        │               │                 │                 │       │
│  ┌─────┴───────────────┴─────────────────┴─────────────────┴─────┐ │
│  │                    Next.js 16.2 App Router                     │ │
│  │              React 19 · TypeScript · Tailwind v4               │ │
│  └────────────────────────────┬───────────────────────────────────┘ │
│                               │                                     │
│  ┌────────────────────────────┴───────────────────────────────────┐ │
│  │                     9 API Route Handlers                       │ │
│  │  matters · intake · approvals · evidence · research · agents   │ │
│  │  audit · documents · forensics                                 │ │
│  └────────────────────────────┬───────────────────────────────────┘ │
│                               │                                     │
│  ┌────────────────────────────┴───────────────────────────────────┐ │
│  │                   12 Zod Schema Modules                        │ │
│  │  user · namespace · matter · approval · document · workflow    │ │
│  │  audit · agent · research · forensics · communication · intake │ │
│  └────────────────────────────┬───────────────────────────────────┘ │
│                               │                                     │
│  ┌────────────────────────────┴───────────────────────────────────┐ │
│  │              Apostle Chain 7332 · x402 Pay Rails               │ │
│  │          26 Agents · ATP Settlement · Audit Anchoring          │ │
│  └────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

### Tech Stack

| Layer | Technology | Version |
|:------|:-----------|:--------|
| 🎨 **Frontend** | Next.js App Router | `16.2.2` |
| ⚛️ **UI Runtime** | React | `19.2.4` |
| 🔷 **Language** | TypeScript | `5.x` |
| 🎨 **Styling** | Tailwind CSS | `v4` |
| ✅ **Validation** | Zod | `4.3.6` |
| 📦 **Icons** | Lucide React | `1.7.0` |
| 📅 **Dates** | date-fns | `4.1.0` |
| 🔗 **Chain** | Apostle Chain | `7332` |
| 💳 **Settlement** | x402 Protocol | ATP |

### Design System

```css
/* ── Color Palette ── */
--midnight:   #080b16    /* Primary background     */
--navy:       #0e1225    /* Secondary background    */
--navy-card:  #111628    /* Card surfaces           */
--gold:       #c9a84c    /* Primary accent          */
--gold-light: #d4b868    /* Hover / highlight       */
--text:       #e2e8f0    /* Body text               */
--text-muted: #94a3b8    /* Secondary text          */

/* ── Typography ── */
Playfair Display         /* Headlines, serif        */
Cormorant Garamond       /* Body serif              */
JetBrains Mono           /* Code, data, monospace   */

/* ── Animations ── */
pulse-gold               /* Accent glow pulse       */
fade-up                  /* Entrance animation      */
ticker                   /* Live case ticker        */
```

---

## 🖥️ Product Surfaces

### Pages (11 Routes)

| Route | Type | Description |
|:------|:-----|:------------|
| `/` | 🟢 Client | Landing page — hero, case ticker, agent network, gallery |
| `/law` | 🟢 Client | Active matters dashboard |
| `/law/matters/[id]` | 🔵 SSG | Matter workspace — case overview |
| `/law/matters/[id]/claims` | 🔵 SSG | Claim matrix and issue analysis |
| `/law/matters/[id]/evidence` | 🔵 SSG | Evidence vault and chain of custody |
| `/law/matters/[id]/ledger` | 🔵 SSG | Financial ledger and damages model |
| `/media` | 🟢 Client | Video gallery — courtroom renders |
| `/intake` | 🟢 Client | Case intake form with conflict check |
| `/ops` | 🟢 Server | Operations console dashboard |
| `/ops/*` | 🟢 Mixed | 6 sub-panels (see Ops Console below) |
| `/portal/[namespace]` | 🔵 Dynamic | Client-facing case portal |

### API Endpoints (9 Routes)

| Endpoint | Methods | Purpose |
|:---------|:--------|:--------|
| `/api/matters` | `GET` `POST` | List/create legal matters |
| `/api/matters/[id]` | `GET` `PATCH` | Single matter CRUD |
| `/api/intake` | `GET` `POST` | Intake queue management |
| `/api/approvals` | `GET` `POST` | Approval workflow items |
| `/api/evidence` | `GET` `POST` | Evidence ingestion & retrieval |
| `/api/research` | `GET` `POST` | Legal research queries |
| `/api/agents` | `GET` | Agent registry & status |
| `/api/audit` | `GET` | Immutable audit log |
| `/api/documents` | `GET` `POST` | Document generation & versioning |

---

## 📐 Schema Layer

> 12 Zod schema modules · 200+ fields · Full type inference · Barrel export via `index.ts`

| Module | Key Types | Fields | Purpose |
|:-------|:----------|:------:|:--------|
| 🔐 `user.ts` | `UserRole` `Permission` `UserSchema` | 10 roles, 34 permissions | RBAC with role-permission matrix |
| 🏷️ `namespace.ts` | `NamespaceSchema` `DownloadPacketSchema` | 7 access roles, 11 permissions | Client portals & secure file delivery |
| 📋 `matter.ts` | `MatterSchema` | Core fields | Legal matter definition |
| ✅ `approval.ts` | `ApprovalItemSchema` `SourceCitationSchema` | 9 states, 15 categories | Human approval gates with provenance |
| 📄 `document.ts` | `DocumentSchema` | 26 types, 9 states | Document lifecycle & versioning |
| 🔄 `workflow.ts` | `WorkflowSchema` `TaskSchema` | 14 types, 9 statuses | Task dependencies & approval gates |
| 📊 `audit.ts` | `AuditEntrySchema` | 50+ action types | Hash-chained immutable audit log |
| 🤖 `agent.ts` | `AgentSchema` `AgentCapabilitySchema` | 9 teams, 6 statuses | Agent registry with escalation rules |
| 🔬 `research.ts` | `ResearchQuerySchema` `LegalAuthoritySchema` | 12 query types, 6 strength levels | Legal research with Shepardization |
| 🔍 `forensics.ts` | `ForensicCaseSchema` `TracedWalletSchema` | 13 chains, 4 risk levels | Blockchain forensics & wallet tracing |
| 💬 `communication.ts` | `CommunicationSchema` `EmailDraftSchema` | 6 channels, 10 statuses | Supervised email & messaging |
| 📥 `intake.ts` | `IntakeSchema` `ConflictCheckSchema` | 10 matter types, 9 statuses | Case intake with conflict screening |

---

## ⚙️ Operations Console

> `/ops` — 7-panel command center for legal operations

| Panel | Route | Type | Features |
|:------|:------|:-----|:---------|
| 📊 **Dashboard** | `/ops` | Server | Quick stats, operations grid, activity feed |
| ✅ **Approvals** | `/ops/approvals` | Client | Status filters, provenance display, citations, action buttons |
| 📋 **Tasks** | `/ops/tasks` | Server | Workflow progress bar, task dependencies, priority indicators |
| 🔬 **Research** | `/ops/research` | Client | Query builder, authority table, jurisdiction filter, Shepardization |
| 🔍 **Forensics** | `/ops/forensics` | Server | Wallet tracing, transaction graph, risk assessment, chain analysis |
| 💬 **Communications** | `/ops/communications` | Client | Draft review, privilege badges, channel filters |
| 📊 **Audit** | `/ops/audit` | Server | Hash-chain integrity, timeline, category filtering |

---

## 🔍 Forensics Engine

Active case: **NTI-LEAVITT-2026-001** — TRON/ETH Cryptocurrency Fraud

```
 VICTIM WALLET                SUSPECT WALLETS              BRIDGE EXIT
┌──────────────┐    $36,150  ┌──────────────┐             ┌──────────────┐
│ TFake1...    │────────────▶│ TFake2...    │────$15K────▶│ 0xFake1...   │
│ victim       │   USDT      │ suspect1     │   bridge    │ ethbridge    │
│ TRON         │             │ TRON         │             │ ETHEREUM     │
│ Risk: LOW    │             │ Risk: CRIT   │             │ Risk: HIGH   │
└──────────────┘             └──────┬───────┘             └──────────────┘
                                    │
                              $18K  │ layering
                                    ▼
                             ┌──────────────┐
                             │ TFake3...    │
                             │ suspect2     │
                             │ TRON         │
                             │ Risk: HIGH   │
                             └──────────────┘
```

| Metric | Value |
|:-------|:------|
| Total Value Traced | **$36,150** |
| Estimated Recoverable | **$12,000** |
| Wallets Identified | **4** (14 in full investigation) |
| Transactions Analyzed | **3** (seed) |
| Chains | TRON, Ethereum |
| Risk Indicators | `social_engineering` `layering_pattern` `cross_chain_bridge` `rapid_movement` |
| Status | 🔴 **Active Tracing** |

### Supported Chains

| Chain | Forensic Capability |
|:------|:-------------------|
| TRON | USDT tracing, TRC-20 analysis |
| Ethereum | ERC-20 flows, DeFi forensics, contract analysis |
| Polygon | Layer-2 tracing |
| Solana | SPL token analysis, program forensics |
| XRPL | Cross-border payment tracing |
| Stellar | Stablecoin flow analysis |
| Bitcoin | UTXO analysis, mixing detection |
| BSC / Avalanche / Arbitrum / Optimism / Base | EVM-compatible chain analysis |
| Apostle (7332) | ATP settlement audit |

---

## 🤖 Agent Network

> **26 agents** on Apostle Chain 7332 · x402 pay rails · ATP settlement

| Team | Count | Purpose |
|:-----|:-----:|:--------|
| 🎯 **Control** | 15 | Treasury, compliance, policy, risk governance |
| ⚡ **Execution** | 7 | Court filings, research, fee processing via x402 |
| 🧠 **Intelligence** | 2 | Deep research — case law mining, precedent analysis |
| 🖥️ **Interface** | 2 | Client namespace management, advocacy operations |
| 📄 **Document** | — | Drafting, review, citation validation |
| 🔍 **Forensic** | — | Chain analysis, wallet tracing, evidence packaging |
| 📬 **Communication** | — | Email drafting, client updates, privilege tagging |
| 🔬 **Research** | — | Multi-jurisdiction authority discovery |
| 📥 **Intake** | — | Triage, conflict checks, classification |

### Agent Governance Rules

```
1. Agents may DRAFT — never send, file, or publish autonomously
2. Agents must CITE sources for every factual claim
3. Agents must FLAG low-confidence outputs (< 0.60)
4. Agents must ESCALATE when:
   ├── Confidence < 0.60
   ├── Deadline within 72 hours
   ├── Action could affect legal rights
   ├── Contradictory evidence detected
   └── Novel legal question or new jurisdiction
5. Agent actions are LOGGED immutably (hash-chained)
6. Agent outputs are INSPECTABLE by any authorized user
```

---

## 📜 Constitution

The system operates under a ratified constitution (`CONSTITUTION.md`) enforcing:

| Principle | Rule |
|:----------|:-----|
| 🛡️ **Human Approval** | No outbound legal action without explicit human sign-off |
| 📌 **Factual Integrity** | Every assertion tagged: `alleged` `verified` `sourced` `disputed` `inferred` |
| 📚 **Citation Integrity** | No hallucinated case law, no fake statutes, no fabricated docket entries |
| 👁️ **Transparency** | Every workflow produces an immutable audit trail |
| 📊 **Confidence Labeling** | All analysis carries confidence scores (0.0–1.0) |
| 🔗 **Evidence Custody** | SHA-256 hashing, chain of custody, preservation holds |

### Approval Lifecycle

```
draft → in_review → requires_source_check → requires_attorney_review → approved → sent/filed → archived
                                                                      ↘ rejected → draft (with notes)
```

### User Roles

| Role | Access | Key Capabilities |
|:-----|:-------|:----------------|
| `system_admin` | Full system | All operations, all matters, config |
| `supervising_attorney` | Matter + Privileged | Approve filings, sign-off, privileged review |
| `case_strategist` | Matter + Strategy | Issue analysis, claim matrices, motions |
| `paralegal` | Matter + Ops | Document prep, evidence, research |
| `investigator` | Matter + Evidence | Evidence ingestion, forensics, OSINT |
| `forensic_analyst` | Matter + Web3 | Chain analysis, wallet tracing |
| `intake_operator` | Intake + Read | Triage, classification |
| `client` | Namespace + Read | View portal, download packets, messages |
| `family_viewer` | Namespace + Restricted | View approved updates only |
| `auditor` | Read + Audit | Audit logs, compliance review |

---

## 🗂️ Project Structure

```
legal-chain/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── page.tsx                  # Landing page
│   │   ├── layout.tsx                # Root layout
│   │   ├── globals.css               # Design system
│   │   │
│   │   ├── law/                      # Case workspace
│   │   │   ├── page.tsx              # Active matters
│   │   │   └── matters/[id]/         # Matter detail + claims, evidence, ledger
│   │   │
│   │   ├── ops/                      # Operations console
│   │   │   ├── page.tsx              # Dashboard
│   │   │   ├── approvals/            # Approval queue
│   │   │   ├── tasks/                # Workflow tasks
│   │   │   ├── research/             # Research workbench
│   │   │   ├── forensics/            # Blockchain forensics
│   │   │   ├── communications/       # Draft review
│   │   │   └── audit/                # Audit timeline
│   │   │
│   │   ├── intake/                   # Case intake form
│   │   ├── media/                    # Video gallery
│   │   ├── portal/[namespace]/       # Client portal
│   │   │
│   │   └── api/                      # API route handlers
│   │       ├── matters/              # GET, POST, PATCH
│   │       ├── intake/               # Intake queue
│   │       ├── approvals/            # Approval workflow
│   │       ├── evidence/             # Evidence vault
│   │       ├── research/             # Legal research
│   │       ├── agents/               # Agent registry
│   │       ├── audit/                # Audit log
│   │       └── documents/            # Document generation
│   │
│   ├── components/
│   │   ├── layout/                   # Navbar, Footer
│   │   ├── approval/                 # Approval UI components
│   │   ├── forensics/                # Forensics UI components
│   │   ├── matter/                   # Matter workspace components
│   │   ├── media/                    # Media gallery components
│   │   └── ui/                       # Shared UI primitives
│   │
│   └── lib/
│       ├── schemas/                  # 12 Zod schema modules + barrel export
│       │   ├── user.ts               # Roles, permissions, RBAC
│       │   ├── namespace.ts          # Client portals, access control
│       │   ├── matter.ts             # Legal matter definition
│       │   ├── approval.ts           # Approval gates, citations, reviews
│       │   ├── document.ts           # Document lifecycle
│       │   ├── workflow.ts           # Tasks, dependencies, gates
│       │   ├── audit.ts              # Hash-chained audit entries
│       │   ├── agent.ts              # Agent registry, capabilities
│       │   ├── research.ts           # Legal research, authorities
│       │   ├── forensics.ts          # Blockchain forensics, wallets
│       │   ├── communication.ts      # Email, messaging
│       │   ├── intake.ts             # Case intake, conflict checks
│       │   └── index.ts              # Barrel export
│       │
│       ├── data/
│       │   ├── seed.ts               # Active cases, agent network, gallery
│       │   └── seed-platform.ts      # Forensics, namespace, intakes, approvals, workflows
│       │
│       └── utils/                    # Utility functions
│
├── CONSTITUTION.md                   # System governance rules
├── package.json                      # Dependencies
├── tsconfig.json                     # TypeScript config
├── next.config.ts                    # Next.js config
├── tailwind.config.ts                # Tailwind config
└── postcss.config.mjs                # PostCSS config
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 20.x
- **npm** ≥ 10.x

### Install

```bash
git clone https://github.com/FTHTrading/Legal-Chain.git
cd Legal-Chain
npm install
```

### Development

```bash
npm run dev
# → http://localhost:3000
```

### Production Build

```bash
npm run build
npm start
```

### Verify

```bash
npx next build
# ✓ Compiled successfully
# ✓ Running TypeScript ... passed
# ✓ 20 routes generated
```

---

## 📊 Build Output

```
Route                                    Type
─────────────────────────────────────────────────
/                                        Static
/api/agents                              Dynamic
/api/approvals                           Dynamic
/api/audit                               Dynamic
/api/documents                           Dynamic
/api/evidence                            Dynamic
/api/intake                              Dynamic
/api/matters                             Dynamic
/api/matters/[id]                        Dynamic
/api/research                            Dynamic
/intake                                  Static
/law                                     Static
/law/matters/[id]                        SSG
/law/matters/[id]/claims                 SSG
/law/matters/[id]/evidence               SSG
/law/matters/[id]/ledger                 SSG
/media                                   Static
/ops                                     Static
/ops/approvals                           Static
/ops/audit                               Static
/ops/communications                      Static
/ops/forensics                           Static
/ops/research                            Static
/ops/tasks                               Static
/portal/[namespace]                      Dynamic
```

---

## 🔐 Active Cases

| Case ID | Matter | Status | Type |
|:--------|:-------|:------:|:-----|
| `NTI-LEAVITT-2026-001` | TRON/ETH Crypto Fraud — $36,150 | 🔴 Active Tracing | Forensics |
| `State v. Delcampo` | Illegal Sentence Appeal — F.S. 784.045 | 🟡 Appeal Filed | Criminal |
| `169 Creamer Drive` | $1M Post-Closing Proceeds Dispute | 🟠 Pre-Litigation | Property |

---

<p align="center">
  <strong>UNYKORN // LAW</strong><br/>
  <em>Intelligence infrastructure for the practice of law.</em><br/><br/>
  <img src="https://img.shields.io/badge/Built_by-FTH_Trading-c9a84c?style=flat-square&labelColor=080b16" alt="Built by FTH Trading" />
  <img src="https://img.shields.io/badge/Supervised_by-Human_Attorneys-c9a84c?style=flat-square&labelColor=080b16" alt="Human Supervised" />
  <img src="https://img.shields.io/badge/Chain-Apostle_7332-c9a84c?style=flat-square&labelColor=080b16" alt="Apostle Chain" />
</p>
