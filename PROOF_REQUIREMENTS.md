# PROOF REQUIREMENTS — UNYKORN // LAW

*Version: 1.0.0*
*Created: April 7, 2026*
*Authority: Kevan Burns, Chairman*

---

## I. EVIDENCE PROOF CHAIN

Every evidence item entering the system must satisfy:

| Requirement | Implementation | Verification |
|------------|---------------|-------------|
| **Integrity hash** | SHA-256 computed on ingestion | `original_hash` stored in evidence record |
| **Current hash** | SHA-256 of current version | `current_hash` compared against original |
| **Chain of custody** | Every access/modification logged | `chain_of_custody[]` array with timestamps |
| **Authenticity tag** | Classification on entry | `original`, `copy`, `derived`, `contested` |
| **Preservation hold** | Boolean lock | Prevents deletion/modification when active |
| **Ingestion metadata** | Who uploaded, when | `ingested_by`, `ingested_at` fields |

### Hash Verification Flow
```
Evidence uploaded
      │
      ▼
SHA-256(original_file) → original_hash
      │
      ▼
Evidence stored → current_hash = original_hash
      │
      ▼
On any access/export:
  sha256(current_file) === current_hash?
    ├── YES → integrity confirmed
    └── NO  → INTEGRITY VIOLATION → alert + audit entry
```

---

## II. AUDIT PROOF CHAIN

The audit log is hash-chained — each entry references the previous entry's hash:

| Field | Description |
|-------|-------------|
| `id` | Unique audit entry identifier |
| `previousHash` | SHA-256 of the previous audit entry |
| `entryHash` | SHA-256 of current entry content |
| `action` | Action type (50+ action types defined) |
| `actor` | User or agent identifier |
| `actorType` | `user`, `agent`, `system` |
| `resource` | Affected resource identifier |
| `timestamp` | ISO 8601 timestamp |
| `metadata` | Action-specific data |

### Chain Integrity Verification
```
Entry[n].previousHash === SHA-256(Entry[n-1])
  ├── TRUE  → chain intact at entry n
  └── FALSE → CHAIN BREAK DETECTED → investigate
```

Full chain verification: iterate from genesis entry to HEAD, confirm each link.

---

## III. CITATION PROOF REQUIREMENTS

Every legal citation must meet these proof standards:

| Proof Level | Requirements | Use Cases |
|------------|-------------|-----------|
| **Verified** | Source located, text confirmed, current law | Filing-ready citations |
| **Sourced** | Linked to identifiable third-party source | Research memos |
| **Alleged** | Party assertion, not independently confirmed | Client statements |
| **Inferred** | Deduced from evidence, marked as inference | Analysis notes |
| **Disputed** | Contested or contradicted | Contested facts |

### Citation Pipeline
```
Agent generates citation
      │
      ▼
Citation validation check
  ├── Source exists? (case law database, statute database)
  ├── Current law? (not overruled, repealed, superseded)
  ├── Correct quote? (text matches source)
  └── Jurisdiction match? (applicable jurisdiction)
      │
      ▼
  All pass → verified
  Any fail → flagged for human review
```

---

## IV. FACTUAL ASSERTION PROOF

Every factual claim requires a tag from the Constitution's fact taxonomy:

| Tag | Proof Standard | Human Review Required |
|-----|---------------|----------------------|
| `verified` | Confirmed by independent evidence | No (but auditable) |
| `sourced` | Third-party source identified | No (but auditable) |
| `client_provided` | Client supplied, provisionally accepted | Before filing |
| `alleged` | Party claim, unverified | Before filing |
| `inferred` | Deduced from available evidence | Before filing |
| `disputed` | Contested by opposing party | Always |

---

## V. APPROVAL PROOF

The approval lifecycle creates an immutable proof chain:

```
draft → in_review → requires_source_check → requires_attorney_review → approved → sent/filed → archived
```

Each state transition records:
- Who initiated the transition
- Timestamp of transition
- Any review comments or redlines
- Confidence score at time of approval
- Source citations validated at that point

---

## VI. AGENT OUTPUT PROOF

Agent-generated content must include:

| Proof Element | Description |
|-------------|-------------|
| `generated_by` | Agent identifier |
| `generated_at` | ISO 8601 timestamp |
| `confidence_score` | 0.0–1.0 reliability rating |
| `source_citations[]` | All referenced authorities |
| `evidence_links[]` | All referenced evidence items |
| `fact_tags{}` | Per-assertion reliability tags |
| `model_version` | LLM/model version used |
| `escalation_flags` | Any triggered escalation conditions |

---

## VII. SETTLEMENT PROOF

On-chain settlements produce:

| Proof Element | Source |
|-------------|--------|
| `x402TxHash` | Apostle Chain transaction hash |
| `chainId` | 7332 (Apostle Chain) |
| `settledAt` | ISO 8601 settlement timestamp |
| `milestoneId` | Linked milestone gate (if applicable) |
| `verifiedBy` | Human who confirmed milestone |

---

## VIII. FORENSIC PROOF

Blockchain forensic evidence must include:

| Proof Element | Description |
|-------------|-------------|
| `txHash` | On-chain transaction hash |
| `blockNumber` | Block height at time of transaction |
| `chain` | Source blockchain identifier |
| `screenshotHash` | SHA-256 of evidence screenshot |
| `evidenceItemId` | Link to evidence vault entry |
| `riskIndicators[]` | Identified risk patterns |

---

## IX. MINIMUM PROOF STANDARDS BY CONTEXT

| Context | Minimum Standard |
|---------|-----------------|
| Internal research memo | `sourced` citations, `moderate` confidence |
| Client communication | `verified` facts, `high` confidence |
| Court filing | `verified` citations + facts, `high` confidence, attorney approved |
| Demand letter | `verified` citations, `high` confidence, attorney approved |
| Forensic report | Verified `txHash`, confirmed `blockNumber`, evidence screenshots |
| Settlement distribution | `x402TxHash` confirmed, milestone gate `met` |

---

*No output leaves the system without meeting the applicable proof standard. Violations are audit-logged and escalated.*
