# OPERATOR RUNBOOK — UNYKORN // LAW

*Version: 1.0.0*
*Created: April 7, 2026*
*Authority: Kevan Burns, Chairman*

---

## I. SYSTEM OVERVIEW

| Component | Technology | Port |
|-----------|-----------|------|
| Frontend + API | Next.js 16.2.2 (App Router) | 3003 |
| Runtime | React 19.2.4 + TypeScript 5.x | — |
| Styling | Tailwind CSS v4 | — |
| Validation | Zod 4.3.6 | — |
| Chain Integration | Apostle Chain | 7332 |
| Settlement | x402 Protocol | ATP |

---

## II. STARTUP PROCEDURES

### Development Mode
```bash
cd Legal-Chain
npm install
npm run dev
# → http://localhost:3003
```

### Production Build
```bash
npm run build
npm start
# → http://localhost:3003
```

### Quick Verification
```bash
npx next build
# Expect: ✓ Compiled successfully
# Expect: ✓ Running TypeScript ... passed
# Expect: 36 routes generated
```

---

## III. ROUTE MAP

### Public Pages
| Route | Type | Purpose |
|-------|------|---------|
| `/` | Static | Landing page |
| `/intake` | Static | Case intake form |
| `/media` | Static | Video gallery |

### Case Workspace
| Route | Type | Purpose |
|-------|------|---------|
| `/law` | Static | Active matters listing |
| `/law/matters/[id]` | SSG | Matter overview |
| `/law/matters/[id]/claims` | SSG | Claim matrix |
| `/law/matters/[id]/documents` | Dynamic | Document inventory |
| `/law/matters/[id]/evidence` | Dynamic | Evidence vault |
| `/law/matters/[id]/jurisdiction` | Dynamic | Jurisdiction analysis |
| `/law/matters/[id]/ledger` | Dynamic | Financial ledger |
| `/law/matters/[id]/recovery` | Dynamic | Recovery analysis |
| `/law/matters/[id]/timeline` | Dynamic | Unified timeline |

### Operations Console
| Route | Type | Purpose |
|-------|------|---------|
| `/ops` | Static | Dashboard |
| `/ops/approvals` | Static | Approval queue |
| `/ops/tasks` | Static | Workflow tasks |
| `/ops/research` | Static | Research workbench |
| `/ops/forensics` | Static | Blockchain forensics |
| `/ops/communications` | Static | Draft review |
| `/ops/audit` | Static | Audit timeline |

### Client Portal
| Route | Type | Purpose |
|-------|------|---------|
| `/portal/[namespace]` | Dynamic | Client-facing portal |

### API Endpoints
| Endpoint | Methods | Purpose |
|----------|---------|---------|
| `/api/matters` | GET, POST | Matter CRUD |
| `/api/matters/[id]` | GET, PATCH | Single matter |
| `/api/intake` | GET, POST | Intake queue |
| `/api/intake-scoring` | GET, POST | Civil/criminal scoring |
| `/api/approvals` | GET, POST | Approval items |
| `/api/evidence` | GET | Evidence overview |
| `/api/forensics` | GET, POST | Forensic cases |
| `/api/research` | GET | Research stats |
| `/api/agents` | GET | Agent registry |
| `/api/audit` | GET | Audit reference |
| `/api/documents` | GET | Document listing |
| `/api/kernel` | GET, POST | Kernel layer API |
| `/api/verify` | POST | Bundle verification |

---

## IV. SEED DATA

The system includes demo data for 3 active matters:

| Case ID | Matter | Seed File |
|---------|--------|-----------|
| `a1b2c3d4-...` | 169 Creamer Drive — Post-Closing Proceeds | `seed.ts` |
| `c3d4e5f6-...` | State v. Delcampo — Illegal Sentence Appeal | `seed.ts` |
| `b2c3d4e5-...` | NTI-LEAVITT-2026-001 — Crypto Fraud | `seed.ts` + `seed-platform.ts` |

Additional seed data in `seed-platform.ts`:
- 4 intake records (various statuses)
- 8+ approval items with citations
- 2 workflow pipelines (intake + litigation prep)
- 3 client namespace portals
- 1 forensic case with wallet/transaction data

---

## V. MONITORING

### Health Checks
- **Build health**: `npx next build` — should complete with 0 errors
- **Runtime health**: Visit `http://localhost:3003` — landing page should render
- **API health**: `GET /api/agents` — should return agent network JSON
- **Kernel health**: `GET /api/kernel` — should return layer status

### Audit Integrity
- Audit log entries are hash-chained
- Verify chain: each entry's `previousHash` should match SHA-256 of previous entry
- Chain break = potential tampering — investigate immediately

### Key Metrics to Monitor
- Build compilation time
- API response times
- Number of approval items in queue
- Agent heartbeat status (when chain-connected)
- localStorage usage (browser limitation ~5-10MB)

---

## VI. INCIDENT RESPONSE

### Priority 1 — Data Integrity
**Trigger**: Audit chain break, evidence hash mismatch
**Action**: 
1. Freeze affected matter
2. Preserve current state (screenshot, export)
3. Review audit log for unauthorized access
4. Notify supervising attorney
5. Document in incident report

### Priority 2 — System Availability
**Trigger**: Build failure, runtime crash
**Action**:
1. Check `npm run build` for TypeScript errors
2. Review recent commits for breaking changes
3. Roll back to last known good commit if needed
4. Verify all 36 routes render

### Priority 3 — Agent Malfunction
**Trigger**: Agent outputs with confidence < 0.35, citation validation failures
**Action**:
1. Review flagged outputs in approval queue
2. Reject and mark for re-generation
3. Check agent configuration
4. Log incident in audit trail

---

## VII. DEPLOYMENT

### Vercel (Recommended)
```bash
npx vercel
# Follow prompts — auto-detects Next.js
```

### Docker (Alternative)
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3003
CMD ["npm", "start"]
```

### Environment Variables (Production)
| Variable | Purpose | Required |
|----------|---------|----------|
| `APOSTLE_CHAIN_URL` | Apostle Chain RPC endpoint | For settlement |
| `NEXT_PUBLIC_APP_URL` | Public application URL | For CORS/links |
| `AUTH_SECRET` | Session encryption key | For auth |

---

## VIII. ROLLBACK PROCEDURE

1. Identify target commit: `git log --oneline -10`
2. Create rollback branch: `git checkout -b rollback/<date>`
3. Reset to target: `git reset --hard <commit>`
4. Verify build: `npm run build`
5. Deploy rollback branch
6. Document in incident report

---

*This runbook covers standard operations. For system architecture details, see README.md. For governance rules, see CONSTITUTION.md.*
