# DATA MODEL — UNYKORN LAW

> Prisma/PostgreSQL relational schema. Source of truth: `prisma/schema.prisma`

## Schema Overview

| Domain | Models | Primary Key | Key Indexes |
|--------|--------|-------------|-------------|
| **Auth** | User, Account, Session, VerificationToken | cuid | email (unique), sessionToken (unique) |
| **Matters** | Matter, MatterAssignment, Party, Claim, ClaimElement | cuid | caseReference (unique), status, matterType |
| **Intakes** | Intake, ConflictCheck, AdverseParty, IntakeDocument | cuid | status, matterId |
| **Documents** | Document, DocumentVersion, DocumentExport, SourceCitation | cuid | matterId, status, documentType, (docId+version unique) |
| **Evidence** | EvidenceItem, EvidenceHash | cuid | matterId, status, hash |
| **Timeline** | TimelineEvent | cuid | (matterId, eventDate) composite |
| **Approvals** | Approval, ApprovalReview, RedlineChange | cuid | matterId, status |
| **Forensics** | ForensicCase, TracedWallet, TracedTransaction, ForensicSuspect | cuid | matterId, (address+chain), (txHash+chain) |
| **Research** | ResearchSession, LegalAuthority | cuid | matterId, citation |
| **Communications** | Communication | cuid | matterId, status |
| **Workflows** | Workflow, Task | cuid | matterId, workflowId, status |
| **Audit** | AuditEvent | cuid | matterId, actorId, action, timestamp, (resourceType+resourceId) |
| **Notifications** | Notification | cuid | (userId, read) |
| **Namespace** | Namespace, NamespaceAccess | cuid | slug (unique), matterId (unique 1:1), (nsId+userId unique) |
| **Agents** | Agent | cuid | name (unique) |

**Total: 34 models, 12 enums**

## Relationship Map

```
User ─┬─< Account (OAuth providers)
      ├─< Session (JWT sessions)
      ├─< MatterAssignment >── Matter
      ├─< Intake (created/assigned/reviewed)
      ├─< Document (creator)
      ├─< Approval (creator/assignee)
      ├─< ApprovalReview
      ├─< Communication (sender)
      ├─< ResearchSession
      ├─< Task (assignee)
      ├─< ForensicCase (lead analyst)
      ├─< Notification
      └─< NamespaceAccess >── Namespace

Matter ─┬─< Party
        ├─< Claim ──< ClaimElement
        ├─< MatterAssignment
        ├─< Intake
        ├─< Document ──< DocumentVersion
        │              ├─< DocumentExport
        │              └─< SourceCitation
        ├─< EvidenceItem ──< EvidenceHash
        ├─< TimelineEvent
        ├─< Approval ──< ApprovalReview
        │             ├─< RedlineChange
        │             └─< SourceCitation
        ├─< Workflow ──< Task
        ├─< Communication
        ├─< ResearchSession ──< LegalAuthority
        ├─< ForensicCase ──< TracedWallet
        │                ├─< TracedTransaction
        │                └─< ForensicSuspect
        ├─< AuditEvent
        ├─< Notification
        └── Namespace (1:1)
```

## Enum Reference

| Enum | Values |
|------|--------|
| UserRole | system_admin, supervising_attorney, case_strategist, paralegal, investigator, forensic_analyst, intake_operator, client, family_viewer, auditor |
| MatterType | civil_joint_property_accounting, civil_sale_proceeds_dispute, civil_partition_accounting, criminal_defense, criminal_appeal, crypto_fraud_recovery |
| MatterStatus | intake, investigation, pre_litigation, litigation, appeal, enforcement, closed |
| IntakeStatus | new_intake, screening, conflict_check, initial_review, consultation_scheduled, accepted, declined, referred_out, withdrawn |
| DocumentType | 26 types (demand_letter through custom) |
| DocumentStatus | generating, draft, in_review, approved, filed, served, superseded, withdrawn, archived |
| ApprovalStatus | draft, in_review, requires_source_check, requires_attorney_review, approved, rejected, sent, filed, archived |
| ApprovalCategory | 15 categories (outbound_email through research_citation) |
| EvidenceStatus | alleged, supported, disputed, verified |
| ForensicChain | 13 chains (tron through apostle) |
| RiskLevel | low, medium, high, critical |
| AgentTeam | 9 teams |
| AgentStatus | agent_active, idle, busy, degraded, offline, disabled |
| CommChannel | email, secure_message, sms, letter, phone_note, internal_note |
| CommDirection | outbound, inbound, internal |
| CommStatus | 10 statuses |
| WorkflowStatus | wf_draft, active, paused, wf_completed, wf_failed, wf_cancelled |
| TaskStatus | 9 statuses (pending through skipped) |
| TaskPriority | low, normal, high, urgent, court_deadline |

## Cascade Delete Rules

All child records cascade on parent delete:
- Matter → Party, Claim, MatterAssignment, Document, Evidence, Timeline, Approval, Workflow, Namespace
- Document → DocumentVersion, DocumentExport, SourceCitation
- Approval → ApprovalReview, RedlineChange, SourceCitation
- ForensicCase → TracedWallet, TracedTransaction, ForensicSuspect
- User → Account, Session, Notification, NamespaceAccess

Non-cascading (nullable FK):
- Intake.matterId → Matter (intake exists before matter acceptance)
- Communication.matterId → Matter (may be general)
- ResearchSession.matterId → Matter (may be standalone research)

## Migration Strategy

1. Run `npx prisma migrate dev --name init` against local PostgreSQL
2. Seed with `prisma/seed.ts` (admin user + test matter)
3. Production: `npx prisma migrate deploy` in CI/CD
