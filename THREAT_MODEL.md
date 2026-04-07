# THREAT MODEL — UNYKORN // LAW

*Version: 1.0.0*
*Created: April 7, 2026*
*Author: Kevan Burns, Chairman*

---

## I. SYSTEM BOUNDARY

UNYKORN // LAW operates as a Next.js application serving legal intelligence operations with:
- Client-facing pages (landing, intake, media, client portal)
- Internal operations pages (matter workspace, ops console)
- REST API endpoints (12 routes)
- Client-side persistence (localStorage)
- Apostle Chain integration (agent registry, ATP settlement, audit anchoring)

---

## II. THREAT CATEGORIES

### A. Authentication & Authorization

| Threat | Severity | Mitigation |
|--------|----------|------------|
| Unauthorized access to matter data | CRITICAL | Role-based access control (10 roles, 34 permissions) enforced at API layer |
| Privilege escalation (paralegal → supervising_attorney) | HIGH | Permission matrix validated server-side; role changes require system_admin |
| Client portal namespace leakage | HIGH | Namespace isolation — each portal scoped to single matterId with explicit access grants |
| Session hijacking | MEDIUM | Secure session management; HttpOnly cookies in production |

### B. Data Integrity

| Threat | Severity | Mitigation |
|--------|----------|------------|
| Evidence tampering | CRITICAL | SHA-256 hashing on ingestion; chain-of-custody tracking; preservation holds |
| Audit log manipulation | CRITICAL | Hash-chained audit entries — each entry references previous hash |
| Citation hallucination by agents | HIGH | Citation validation pipeline; all citations tagged with source and verification status |
| Unauthorized document modification | HIGH | Version tracking; every edit produces audit entry |

### C. Agent Risks

| Threat | Severity | Mitigation |
|--------|----------|------------|
| Agent autonomous outbound action | CRITICAL | Constitution §II.A — all outbound actions require human approval |
| Agent fabricating case law | CRITICAL | Citation integrity rules; Shepardization validation; confidence labeling |
| Agent confidence inflation | HIGH | Mandatory confidence scoring (0.0–1.0); escalation below 0.60 threshold |
| Rogue agent modifying evidence | HIGH | Agents can draft only — never modify evidence or send communications |
| Agent exceeding scope | MEDIUM | AgentCapabilitySchema enforces permitted actions per agent team |

### D. External Exposure

| Threat | Severity | Mitigation |
|--------|----------|------------|
| API abuse / rate limiting | MEDIUM | Rate limiting at reverse proxy level |
| XSS via user-submitted intake data | HIGH | React auto-escaping; Zod validation on all inputs |
| CSRF on state-mutating endpoints | MEDIUM | SameSite cookie policy; CSRF tokens on forms |
| Information disclosure via error messages | LOW | Custom error boundaries; generic error messages in production |

### E. Blockchain / Chain Risks

| Threat | Severity | Mitigation |
|--------|----------|------------|
| ATP settlement failure | MEDIUM | Graceful degradation — legal operations continue without chain settlement |
| Agent registry desync | LOW | Heartbeat monitoring; stale agents flagged |
| Audit anchor reorg | LOW | Apostle Chain finality on block confirmation |

---

## III. TRUST BOUNDARIES

```
UNTRUSTED                    TRUST BOUNDARY                    TRUSTED
─────────────             ──────────────────              ──────────────
Client browser    →    Zod validation + RBAC    →    Internal state
Intake form data  →    Schema validation        →    Matter records
Agent outputs     →    Approval pipeline        →    Filed documents
External APIs     →    Citation validation      →    Research authorities
Chain data        →    Forensic verification    →    Evidence items
```

---

## IV. RESIDUAL RISKS

1. **localStorage persistence**: Client-side storage is vulnerable to browser-level attacks. Mitigated by treating localStorage as cache, not source of truth.
2. **Seed data in production**: Current implementation uses static seed data. Production requires database backend.
3. **No E2E encryption**: Client portal messages transit unencrypted within the application boundary. Production requires TLS termination and encrypted storage.

---

## V. REVIEW SCHEDULE

- Threat model reviewed quarterly or on any architecture change
- Agent governance rules reviewed monthly
- Access control matrix reviewed on every role addition

---

*This threat model is a living document. All identified threats must have documented mitigations before launch.*
