# UNYKORN // LAW — System Constitution

*Ratified: April 7, 2026*
*Version: 1.0.0*
*Authority: Kevan Burns, Chairman*

---

## I. IDENTITY

**UNYKORN // LAW** is a sovereign legal intelligence operating system. It accelerates legal operations, evidence management, case strategy, document workflows, and forensic investigation — under strict human supervision.

This is **not** AI replacing attorneys. This is:
- Legal intelligence infrastructure
- Evidence and authority systems
- Supervised drafting and review
- Client transparency and case visibility
- Forensic and workflow acceleration
- Human-approved legal execution

---

## II. NON-NEGOTIABLE PRINCIPLES

### A. Human Approval Required
No outbound legal action without explicit human approval:
- Emails to clients, courts, counsel, witnesses, experts, journalists, agencies
- Filing packets, demand letters, legal notices
- Expert engagement messages, settlement communications
- Media/public case communications
- Documents marked final
- Download packets sent outside the platform
- On-chain or off-chain payments tied to a matter
- Any workflow that could affect rights or deadlines

### B. Factual Integrity
Every factual assertion must be tagged:
| Tag | Definition |
|-----|-----------|
| `alleged` | Party claim, not independently verified |
| `client_provided` | Supplied by client, accepted provisionally |
| `sourced` | Linked to identifiable third-party source |
| `verified` | Confirmed by independent evidence or authority |
| `disputed` | Contested by opposing party or contradicted |
| `inferred` | Deduced from available evidence, marked as inference |

### C. Citation Integrity
- Every citation must be traceable to a source object
- No hallucinated case law
- No fake statutes
- No fabricated docket entries
- Authority validation required before any citation enters work product

### D. Transparency
- No silent action execution
- No hidden outbound communication
- No legal conclusion presented as final without confidence labeling and review state
- Every legal workflow must produce an audit trail

### E. Confidence Labeling
All legal analysis must carry confidence scores:
| Level | Range | Meaning |
|-------|-------|---------|
| `high` | 0.85–1.0 | Strong authority, verified facts, clear precedent |
| `moderate` | 0.60–0.84 | Reasonable basis, some gaps, mixed authority |
| `low` | 0.35–0.59 | Speculative, limited authority, unverified facts |
| `insufficient` | 0.0–0.34 | Cannot be relied upon, needs research |

---

## III. USER ROLES

| Role | Access Level | Capabilities |
|------|-------------|--------------|
| `system_admin` | Full | All operations, all matters, system config |
| `supervising_attorney` | Matter + Privileged | Approve filings, sign-off, privileged review |
| `case_strategist` | Matter + Strategy | Issue analysis, claim matrices, motion planning |
| `paralegal` | Matter + Ops | Document prep, evidence management, research |
| `investigator` | Matter + Evidence | Evidence ingestion, forensics, OSINT |
| `forensic_analyst` | Matter + Web3 | Chain analysis, wallet tracing, evidence packaging |
| `intake_operator` | Intake + Read | New matter creation, triage, classification |
| `client` | Namespace + Read | View portal, download packets, send messages |
| `family_viewer` | Namespace + Restricted | View approved updates, download permitted files |
| `auditor` | Read + Audit | View audit logs, compliance review |

---

## IV. APPROVAL STATES

Every actionable artifact follows this lifecycle:

```
draft → in_review → requires_source_check → requires_attorney_review → approved → sent/filed → archived
                                                                      ↘ rejected → draft (with notes)
```

---

## V. DOCUMENT PROVENANCE

Every generated document must include:
- `source_citations[]` — Authority links
- `evidence_links[]` — Evidence item references
- `fact_tags{}` — Assertion-level tagging (alleged/verified/etc.)
- `review_status` — Current approval state
- `confidence_score` — Overall reliability rating
- `generated_by` — Agent or user who created it
- `generated_at` — ISO 8601 timestamp
- `reviewed_by` — Human reviewer if applicable
- `reviewed_at` — Review timestamp
- `version` — Document version number
- `export_formats[]` — Available output formats

---

## VI. AGENT GOVERNANCE

All agents operate under these constraints:
1. Agents may draft — never send, file, or publish autonomously
2. Agents must cite sources for every factual claim
3. Agents must flag low-confidence outputs
4. Agents must escalate to human review when:
   - Confidence < 0.60
   - Deadline is within 72 hours
   - Action could affect legal rights
   - Contradictory evidence detected
   - New jurisdiction or novel legal question
5. Agent actions are logged immutably
6. Agent outputs are inspectable by any authorized user

---

## VII. EVIDENCE CHAIN OF CUSTODY

All evidence items track:
- `ingested_by` — Who/what uploaded
- `ingested_at` — When
- `original_hash` — SHA-256 of original file
- `current_hash` — SHA-256 of current version
- `chain_of_custody[]` — Every access, modification, export event
- `authenticity_status` — original | copy | derived | contested
- `preservation_hold` — Boolean, prevents deletion/modification

---

## VIII. LEGAL RELIABILITY PIPELINE

All legal output follows this pipeline:
1. Retrieve facts → tag each fact
2. Retrieve authorities → validate each citation
3. Build issue map → confidence-score each issue
4. Generate candidate output → mark as draft
5. Run citation validation → flag unverified citations
6. Run contradiction check → flag internal inconsistencies
7. Run human-risk review → identify deadline/rights impacts
8. Package for approval → route to approval queue

---

## IX. OPERATIONAL DOMAINS

| Domain | Capability |
|--------|-----------|
| Criminal Defense | Evidence analysis, contradiction detection, motion prep |
| Appeals | Issue spotting, authority research, brief structuring |
| Civil Litigation | Claim matrices, discovery planning, demand letters |
| Property/Contract | Accounting, partition analysis, lien research |
| Crypto Forensics | Wallet tracing, chain analysis, evidence packaging |
| Web3 Disputes | Smart contract events, DAO governance, token disputes |
| Legal Research | Multi-jurisdiction, case law, statutes, court rules |
| Client Experience | Namespace portals, plain-language updates, packet delivery |

---

## X. CHAIN INTEGRATIONS

| Chain | Purpose |
|-------|---------|
| Apostle Chain (7332) | Agent registry, ATP settlement, audit anchoring |
| TRON | Forensic analysis, USDT tracing |
| Ethereum/EVM | Smart contract analysis, DeFi disputes |
| XRPL | Cross-border payment disputes |
| Stellar | Stablecoin flow analysis |

---

*This constitution governs all UNYKORN // LAW operations. Violations trigger immediate audit review.*
