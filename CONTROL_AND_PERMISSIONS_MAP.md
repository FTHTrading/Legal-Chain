# CONTROL AND PERMISSIONS MAP — UNYKORN // LAW

*Version: 1.0.0*
*Created: April 7, 2026*
*Authority: Kevan Burns, Chairman*
*Source Schema: `src/lib/schemas/user.ts`*

---

## I. ROLE DEFINITIONS

| Role | Access Scope | Description |
|------|-------------|-------------|
| `system_admin` | Full system | All operations, all matters, system configuration |
| `supervising_attorney` | Matter + Privileged | Approve filings, sign-off, privileged review, send comms |
| `case_strategist` | Matter + Strategy | Issue analysis, claim matrices, motion planning |
| `paralegal` | Matter + Ops | Document prep, evidence management, research |
| `investigator` | Matter + Evidence | Evidence ingestion, forensics, OSINT |
| `forensic_analyst` | Matter + Web3 | Chain analysis, wallet tracing, evidence packaging |
| `intake_operator` | Intake + Read | New matter creation, triage, classification |
| `client` | Namespace + Read | View portal, download packets, send messages |
| `family_viewer` | Namespace + Restricted | View approved updates, download permitted files |
| `auditor` | Read + Audit | View audit logs, compliance review |

---

## II. PERMISSION DOMAINS (34 Permissions)

### Matter Operations
| Permission | Description |
|-----------|-------------|
| `matter:create` | Create new legal matters |
| `matter:read` | View matter details |
| `matter:write` | Modify matter fields |
| `matter:delete` | Delete matters (admin only) |
| `matter:assign` | Assign agents/users to matters |

### Evidence Management
| Permission | Description |
|-----------|-------------|
| `evidence:ingest` | Upload/import evidence items |
| `evidence:read` | View evidence |
| `evidence:classify` | Tag, categorize, set authenticity status |
| `evidence:export` | Export evidence packages |

### Document Lifecycle
| Permission | Description |
|-----------|-------------|
| `document:draft` | Create document drafts |
| `document:read` | View documents |
| `document:review` | Mark documents reviewed |
| `document:approve` | Approve documents for filing/sending |
| `document:finalize` | Lock document as final version |
| `document:export` | Export/download documents |

### Approval Workflow
| Permission | Description |
|-----------|-------------|
| `approval:submit` | Submit items to approval queue |
| `approval:review` | Review and comment on approval items |
| `approval:approve` | Grant final approval |
| `approval:reject` | Reject approval items |

### Communications
| Permission | Description |
|-----------|-------------|
| `comms:draft` | Draft communications |
| `comms:review` | Review communications |
| `comms:send` | Send approved communications (requires human click) |

### Legal Research
| Permission | Description |
|-----------|-------------|
| `research:query` | Submit research queries |
| `research:read` | View research results |
| `research:export` | Export research memos |

### Blockchain Forensics
| Permission | Description |
|-----------|-------------|
| `forensics:ingest` | Import wallet/transaction data |
| `forensics:analyze` | Run forensic analysis |
| `forensics:export` | Export forensic reports |

### Administration
| Permission | Description |
|-----------|-------------|
| `admin:users` | Manage user accounts |
| `admin:roles` | Assign roles |
| `admin:audit` | View full audit log |
| `admin:system` | System configuration |

### Namespace (Client Portal)
| Permission | Description |
|-----------|-------------|
| `namespace:read` | View portal content |
| `namespace:download` | Download case packets |
| `namespace:message` | Send messages to legal team |

---

## III. ROLE → PERMISSION MATRIX

| Permission | admin | atty | strat | para | inv | forensic | intake | client | family | auditor |
|-----------|:-----:|:----:|:-----:|:----:|:---:|:--------:|:------:|:------:|:------:|:-------:|
| matter:create | ✅ | | | | | | ✅ | | | |
| matter:read | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | | | ✅ |
| matter:write | ✅ | ✅ | ✅ | ✅ | | | | | | |
| matter:delete | ✅ | | | | | | | | | |
| matter:assign | ✅ | ✅ | | | | | | | | |
| evidence:ingest | ✅ | | | ✅ | ✅ | | ✅ | | | |
| evidence:read | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | | | ✅ |
| evidence:classify | ✅ | ✅ | ✅ | ✅ | ✅ | | | | | |
| evidence:export | ✅ | ✅ | | | ✅ | ✅ | | | | |
| document:draft | ✅ | ✅ | ✅ | ✅ | | | | | | |
| document:read | ✅ | ✅ | ✅ | ✅ | | | | | | ✅ |
| document:review | ✅ | ✅ | ✅ | | | | | | | |
| document:approve | ✅ | ✅ | | | | | | | | |
| document:finalize | ✅ | ✅ | | | | | | | | |
| document:export | ✅ | ✅ | | | | | | | | |
| approval:submit | ✅ | ✅ | ✅ | ✅ | | | ✅ | | | |
| approval:review | ✅ | ✅ | | | | | | | | |
| approval:approve | ✅ | ✅ | | | | | | | | |
| approval:reject | ✅ | ✅ | | | | | | | | |
| comms:draft | ✅ | ✅ | | | | | | | | |
| comms:review | ✅ | ✅ | | | | | | | | |
| comms:send | ✅ | ✅ | | | | | | | | |
| research:query | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | | | | |
| research:read | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | | | | |
| research:export | ✅ | ✅ | ✅ | | | | | | | |
| forensics:ingest | ✅ | | | | ✅ | ✅ | | | | |
| forensics:analyze | ✅ | ✅ | ✅ | | ✅ | ✅ | | | | |
| forensics:export | ✅ | ✅ | | | | ✅ | | | | |
| admin:users | ✅ | | | | | | | | | |
| admin:roles | ✅ | | | | | | | | | |
| admin:audit | ✅ | | | | | | | | | ✅ |
| admin:system | ✅ | | | | | | | | | |
| namespace:read | ✅ | ✅ | | | | | | ✅ | ✅ | |
| namespace:download | ✅ | ✅ | | | | | | ✅ | ✅ | |
| namespace:message | ✅ | | | | | | | ✅ | | |

---

## IV. CRITICAL CONTROL GATES

### Outbound Action Gates (Constitution §II.A)
These actions ALWAYS require `supervising_attorney` or `system_admin` approval:
1. Sending emails to clients, courts, counsel, witnesses, experts
2. Filing packets, demand letters, legal notices
3. Documents marked as final
4. Download packets sent outside the platform
5. On-chain or off-chain payments tied to a matter
6. Any workflow that could affect rights or deadlines

### Agent Permission Boundaries
Agents operate under the most restrictive applicable role:
- **Draft agents**: `document:draft`, `approval:submit` — cannot approve or send
- **Research agents**: `research:query`, `research:read` — cannot modify matters
- **Forensic agents**: `forensics:analyze` — cannot export without human approval
- **Communication agents**: `comms:draft` — cannot send (requires `comms:send` from attorney)

### Escalation Triggers
| Condition | Required Escalation |
|-----------|-------------------|
| Confidence < 0.60 | Escalate to supervising_attorney |
| Deadline within 72 hours | Escalate to supervising_attorney |
| Action affects legal rights | Escalate to supervising_attorney |
| Contradictory evidence | Escalate to case_strategist + supervising_attorney |
| Novel legal question | Escalate to supervising_attorney |
| Cross-jurisdiction issue | Escalate to case_strategist |

---

## V. NAMESPACE ACCESS CONTROL

Client portals use namespace-level access with granular permissions:

| Namespace Role | Permissions |
|---------------|-------------|
| `counsel` | Full matter access including privileged content |
| `cocounsel` | Matter access excluding privileged strategy notes |
| `client` | Overview, timeline, status, milestones, messaging |
| `family` | Overview, status, milestones only |
| `expert` | Specific evidence and document access |
| `mediator` | Settlement-related content only |
| `auditor` | Read-only audit trail access |

Each namespace access grant is:
- Tied to a specific userId
- Granted by an authorized user (tracked in `grantedBy`)
- Time-stamped (`grantedAt`)
- Individually permissioned (array of specific capabilities)

---

*This map is the authoritative source for all access control decisions. Any permission not explicitly granted is denied.*
