# CLAIMS TO PROOF MAP — UNYKORN // LAW

*Version: 1.0.0*
*Created: April 7, 2026*
*Authority: Kevan Burns, Chairman*

---

## I. PLATFORM CAPABILITY CLAIMS

| Claim | Proof Type | Proof Location | Verified |
|-------|-----------|---------------|----------|
| "AI-accelerated legal operations" | Code | Kernel modules, agent schemas, research workbench | ✅ |
| "Under strict human supervision" | Policy + Code | Constitution §II.A, approval lifecycle, `requiredRole` field | ✅ |
| "26 agents on Apostle Chain" | Seed data | `AGENT_NETWORK` in `seed.ts`, agent teams defined | ✅ |
| "ATP settlement" | Code | `settlement.ts` — PaymentEvent with x402TxHash | ✅ |
| "Audit anchoring" | Code | `audit.ts` schema, hash-chain in `store.ts` | ✅ |
| "12 Zod schema modules" | File count | 15 files in `src/lib/schemas/` (12 domain + barrel + 2 scoring) | ✅ |
| "9 RESTful route handlers" | Build output | 12 API routes in build (9 original + 3 additional) | ✅ |
| "Human approval required" | Policy + Code | Constitution §II.A, `approval:approve` permission gate | ✅ |
| "No hallucinated case law" | Policy | Constitution §II.C, citation validation pipeline | ✅ |
| "Hash-chained audit log" | Code | `store.ts` logAction(), previousHash chaining | ✅ |

---

## II. PER-MATTER CLAIMS

### NTI-LEAVITT-2026-001 — TRON/ETH Crypto Fraud

| Claim | Proof Source | Proof Detail |
|-------|-------------|-------------|
| Total value traced: $36,150 | `SEED_FORENSIC_TRON.totalValueTraced` | "36150" |
| Estimated recoverable: $12,000 | `SEED_FORENSIC_TRON.totalValueRecoverable` | "12000" |
| 4 wallets identified | `SEED_FORENSIC_TRON.wallets.length` | 4 wallet objects |
| Cross-chain bridge detected | Transaction tx-003-bridge | txType: "bridge", TRON→ETH |
| Social engineering indicator | Transaction tx-001-initial | riskIndicators: ["social_engineering"] |
| Layering pattern detected | Transaction tx-002-layer | isLayering: true |
| Active tracing status | `SEED_FORENSIC_TRON.status` | "active_tracing" |

### State v. Delcampo — Illegal Sentence Appeal

| Claim | Proof Source | Proof Detail |
|-------|-------------|-------------|
| 20-year sentence exceeds statutory max | Approval appr-002-motion | F.S. 775.082(3)(c): max 15 years |
| Second degree felony classification | Source citation sc-004-fl-aggbattery | F.S. 784.045 |
| Appeal filed | Namespace milestone ms-appeal-filed | status: "completed" |
| Brief filed | Namespace milestone ms-brief-filed | completedAt: 2026-04-01 |
| Motion confidence: 0.92 | Approval appr-002-motion | confidenceScore: 0.92 |

### 169 Creamer Drive — Post-Closing Proceeds

| Claim | Proof Source | Proof Detail |
|-------|-------------|-------------|
| ~$1M in post-closing proceeds | Matter seed data | Estimated from property sale |
| $65K improvements by client | Intake int-004 | briefDescription field |
| $60K SBA carrying costs | Intake int-004 | briefDescription field |
| Estimated recovery: $143,300 | Intake int-004 | estimatedValue: 143300 |
| Conflict check: clear | Conflict check cc-004 | result: "clear" |
| GA § 23-2-70 (equitable accounting) | Source citation sc-002 | Verified statute reference |
| GA § 9-3-24 (6-year SOL) | Source citation sc-001 | Verified statute reference |
| 5-count complaint planned | Workflow task task-lit-002 | Notes list 5 counts |

---

## III. AGENT GOVERNANCE CLAIMS

| Claim | Proof Type | Proof Location |
|-------|-----------|---------------|
| "Agents may DRAFT — never send" | Policy | Constitution §VI.1 |
| "Agents must CITE sources" | Policy | Constitution §VI.2 |
| "Agents must FLAG low confidence" | Policy + Code | Constitution §VI.3, confidenceScore field |
| "Agents must ESCALATE" | Policy + Code | Constitution §VI.4, 5 escalation triggers |
| "Agent actions are LOGGED" | Code | store.ts logAction(), actorType: "agent" |
| "Agent outputs are INSPECTABLE" | Code | Approval queue with full content display |

---

## IV. UNMAPPED CLAIMS (Require Future Proof)

| Claim | Current Status | Proof Needed |
|-------|---------------|-------------|
| "99.97% uptime" | Not yet measurable | Monitoring data required |
| Real-time agent heartbeat | Schema defined | Apostle Chain integration required |
| Live x402 settlement | Settlement module coded | Chain connection required |
| Multi-jurisdiction research | Research schema defined | External API integration required |

---

*Every public-facing claim must have a corresponding proof entry in this map. Unproven claims must not be marketed.*
