# 26-Agent UNYKORN Legal Network — Audit & Launch Plan
**Date**: April 11, 2026  
**Location**: Legal-Chain + Apostle Chain 7332  
**Status**: Currently planning phase — inventory and verification needed

---

## DECLARED AGENT NETWORK BREAKDOWN

### Total: 26 Sovereign Agents

All agents registered on **Apostle Chain 7332**, operating under **x402 protocol** with **ATP token** settlement.

---

### TIER 1: CONTROL AGENTS (15 agents)
**Purpose**: Governance, treasury, compliance, policy enforcement, risk management

#### Control.Treasury (5 agents)
| Agent | UUID | Current Balance | Role |
|-------|------|-----------------|------|
| kevan-burns-chairman | `87724c76-da93-4b1a-9fa6-271ba856338e` | 500K ATP | Master treasury + board override |
| genesis-treasury | TBD | 1M ATP | Primary operating fund |
| unykorn-operator | TBD | 250K ATP | Daily operational expenses |
| x402-credit-pool | TBD | 500K ATP | Payment metering reserve |
| mesh-pay-reserve | TBD | 200K ATP | Mesh agent contingency fund |
| **TOTAL** | | **2.45M ATP** | |

#### Control.Compliance (3 agents)
| Agent | Purpose |
|-------|---------|
| compliance-monitor | Real-time regulatory audit trail tracking |
| audit-log-keeper | Immutable evidence ledger recording (pallet-evidence) |
| evidence-verifier | Cryptographic proof validation for court filing |

#### Control.Policy (4 agents)
| Agent | Purpose |
|-------|---------|
| policy-engine | Governance rule enforcement (deadlines, escalations) |
| resolution-enforcer | Settlement agreement monitoring |
| deadline-coordinator | Case milestone alerts + auto-escalation |
| escalation-manager | Manual intervention workflow routing |

#### Control.Risk (3 agents)
| Agent | Purpose |
|-------|---------|
| risk-assessment | Case strength scoring, collection likelihood |
| collection-strategy | Post-judgment enforcement planning |
| loss-predictor | Default risk modeling for ATP allocation |

---

### TIER 2: EXECUTION AGENTS (7 agents)
**Purpose**: Transactional work wired to x402 pay-per-request metering

All execution agents connected to **x402 gateway** with ATP balance requirements and fee settlement.

#### Execution.Research (2 agents)
| Agent | x402 Meter | Typical Fee | Purpose |
|-------|-----------|------------|---------|
| public-records-miner | per-request | 0.5-2 ATP | Court records, deed searches, lien checks |
| precedent-analyzer | per-report | 1-5 ATP | Statutes, case law analysis, authority synthesis |

#### Execution.Documents (2 agents)
| Agent | x402 Meter | Typical Fee | Purpose |
|-------|-----------|------------|---------|
| filing-prep-agent | per-complaint | 2-10 ATP | N4 notices, complaints, briefs, motions |
| evidence-organizer | per-packet | 1-3 ATP | Exhibits organization, metadata tagging, Merkle proofs |

#### Execution.Operations (3 agents)
| Agent | x402 Meter | Typical Fee | Purpose |
|-------|-----------|------------|---------|
| intake-processor | per-intake | 0.1-0.5 ATP | Phone/web intake classification |
| client-outreach | per-contact | 0.2-1 ATP | Email, SMS status updates, document requests |
| intake-scorer | per-assessment | 0.5-2 ATP | Conflict check, filing readiness, estimation |

---

### TIER 3: INTELLIGENCE AGENTS (2 agents)
**Purpose**: Deep learning on legal patterns and jurisprudence

| Agent | Data Source | Update Frequency | Purpose |
|-------|-------------|------------------|---------|
| jurisprudence-engine | Federal + State case law | Weekly | Legal precedent deep dives, statutory analysis |
| pattern-analyzer | UNYKORN case history | Daily | Claim success rates, optimal defense strategies |

---

### TIER 4: INTERFACE AGENTS (2 agents)
**Purpose**: Client experience and external-facing operations

| Agent | Integration | Purpose |
|-------|-------------|---------|
| namespace-manager | Portal auth + content isolation | Client portal access, data privacy enforcement |
| advocacy-coordinator | Marketing automation + Stripe | Case status notifications, client onboarding, public advocacy |

---

## CURRENT STATUS REPORT

### What We Know ✅
- **Apostle Chain**: EC2 redeployed (commit 185a537), port 7332 active
- **Height**: 15 blocks (at last status check)
- **Registered Agents on Chain**: 35 total (per memory notes)
- **x402 Mesh Agents**: 15 registered + funded on EC2
- **ATP Accounts Confirmed**: Kevan chairman (500K), genesis treasury (1M), others TBD

### What We DON'T Know ❓
1. **Exact inventory**: Which of the 26 are actually instantiated vs. planned?
2. **Runtime status**: Are agents actively responding to heartbeat?
3. **x402 Metering**: Is the payment gateway routing ATP charges correctly?
4. **Policy enforcement**: Are governance rules being actively applied?
5. **Precedent database**: Is jurisprudence-engine seeded with legal case law?

---

## AGENT READINESS ASSESSMENT

### Pre-Launch Verification (This Week)
- [ ] **Agent Discovery**: Query Apostle Chain to list all registered agent UUIDs
- [ ] **Balance Check**: Verify ATP balances for treasury + execution agents
- [ ] **Heartbeat Test**: Ping each agent on its expected port/endpoint
- [ ] **Signing Verification**: Confirm all agents have Ed25519 keypairs in SovereignKeyring

### Infrastructure Readiness
- [ ] **Apostle Chain**: Port 7332 responding, height advancing
- [ ] **x402 Gateway**: Payment metering active, fee collection working
- [ ] **Legal-Chain API**: `/api/agents` endpoint returning live status
- [ ] **Finn Runtime** (7700): Biometric auth available for client portal
- [ ] **Evidence Ledger**: pallet-evidence accepting proofs

---

## LAUNCH PLAN (Phased, 4 Weeks)

### WEEK 1: Foundation & Inventory
**Goal**: Confirm all 26 agents exist and have ATP funding

**Tasks**:
1. Query `GET /v1/agents/list` (if available) or enumerate from ledger
2. Create master agent registry file (`agents-7332-registry.json`)
3. Check ATP balance for each treasury agent
4. Verify Ed25519 signing keys loadable from SovereignKeyring
5. Document any missing agents + remediation plan

**Success Metric**: 26/26 agents confirmed with ATP balances > 0

---

### WEEK 2: Control Tier Activation
**Goal**: Start governance infrastructure

**Weekly Phases**:
1. **Day 1-2: Start Treasury Agents**
   - Initialize fund pools (2.45M ATP allocated)
   - Test ATP transfer between wallets on x402 protocol
   - Load treasury reconciliation rules

2. **Day 2-3: Start Compliance Agents**
   - Connect to pallet-evidence for immutable logging
   - Load compliance rule engine (audit trigger points)
   - Set up evidence chain for court filings

3. **Day 4-5: Start Policy Agents**
   - Load governance rules (deadlines, escalation triggers)
   - Test deadline calculation (case creation → N4 due date)
   - Set up escalation routing (missed deadline → compliance alert)

4. **Day 5-7: Risk Assessment**
   - Load risk models (claim strength scoring)
   - Test case assessment on seeded intakes (Cases 006-008)
   - Calibrate ATP allocation based on case risk level

**Success Metric**: All 15 control agents passing health checks, governance rules enforced

---

### WEEK 3: Execution Tier Activation
**Goal**: Start case processing at x402 pay-per-request scale

**Tasks**:
1. **Connect x402 Metering**
   - Confirm execution agents can submit transactions to /v1/tx
   - Verify ATP charges deducted from agent balances
   - Test fee settlement back to treasury agents

2. **Load Research Data**
   - Seed public-records-miner with court API credentials (Pacer, Westlaw, county recorders)
   - Load precedent-analyzer with case law database
   - Test: Query case 006 facts → return matching precedents

3. **Load Document Templates**
   - N4 notice templates (Indiana standardized)
   - Unlawful detainer complaints
   - Quiet title actions, TRO templates
   - Test: Generate N4 for Case 007 → verify legal formatting

4. **Operations Integration**
   - Intake-processor: load conflict checker + intake classifier
   - Client-outreach: integrate with Stripe for fee collection
   - Intake-scorer: test on Cases 001-003 seeded intakes

5. **Execution Wiring**
   - Each agent endpoint registered at /api/agents
   - All 7 agents reachable via Legal-Chain UI
   - Task queue connected (queue → agent → ATP charge → settlement)

**Success Metric**: 50+ intakes/day processed, <$1 ATP cost per transaction, 0 metering errors

---

### WEEK 4: Intelligence & Interface Tiers + Full Integration
**Goal**: Complete agent network with learning and client-facing features

**Tasks**:
1. **Intelligence Tier**
   - Load Federal + State case law into jurisprudence-engine
   - Train pattern-analyzer on UNYKORN case history
   - Test: Pattern-analyzer scores Case 006 vs. known tenant defense precedents

2. **Interface Tier**
   - Activate namespace-manager (client data isolation)
   - Connect advocacy-coordinator to marketing automation
   - Test: Client intake submissions → namespace created → agent assigned

3. **Legal-Chain UI Integration**
   - Agent status dashboard (all 26 agents, live heartbeat)
   - Agent task workflow (intake → assignment → execution → settlement)
   - Real-time ATP balance tracking per agent tier

4. **Monitoring & Observability**
   - Command Center integration (agent discovery + health)
   - 30s heartbeat polling from each agent
   - Alert rules: agent offline >5min, ATP balance low, policy violation

5. **Load Testing**
   - 100+ simultaneous intakes
   - 1000+ x402 transactions/hour
   - 10+ parallel litigation cases in execution

**Success Metric**: All 26 agents operational, 99%+ uptime, <500ms API response time

---

## AGENT PORTFOLIO INVENTORY (To Be Populated)

**Template for each agent:**

### [AGENT_NAME]
- **UUID**: `[TBD - from Apostle Chain]`
- **Tier**: [Control/Execution/Intelligence/Interface]
- **Port/Endpoint**: [TBD]
- **ATP Balance**: `[TBD - fetch from /v1/agent/{id}/balance]`
- **Status**: [Offline/Running/Testing]
- **Last Heartbeat**: [TBD]
- **Policy Enforced**: [Yes/No]
- **x402 Meter**: [TBD for execution agents]

---

## Resources & Commands

### Apostle Chain Queries
```bash
# Health check
curl http://localhost:7332/health

# Status (height, block time, consensus)
curl http://localhost:7332/status

# List agents (may not exist yet)
curl http://localhost:7332/v1/agents/list

# Get specific agent balance
curl http://localhost:7332/v1/agent/87724c76-da93-4b1a-9fa6-271ba856338e/balance

# Submit transaction (test x402 metering)
curl -X POST http://localhost:7332/v1/tx \
  -H "Content-Type: application/json" \
  -d '{"...payload...": "..."}'
```

### Legal-Chain API
```bash
# Get current agent network status
curl http://localhost:3003/api/agents

# Check intake scoring (risk assessment)
curl -X POST http://localhost:3003/api/intake-scoring \
  -H "Content-Type: application/json" \
  -d '{"intake_id": "..."}'
```

### x402 Mesh Agents (EC2: 98.91.89.169)
```bash
# Check mesh-pulse neural state machine  
curl http://98.91.89.169:8080/health

# List mesh agents
curl http://98.91.89.169:8080/agents
```

---

## Risk Mitigation

| Risk | Mitigation |
|------|-----------|
| Agent registry incomplete | Weekly sync with Apostle Chain ledger, manual registration fallback |
| ATP balance depletion | Treasury agents monitor daily spend, auto-top-up from secondary wallets |
| x402 metering failures | Fallback to fixed-fee model, manual reconciliation audit trail |
| Policy enforcement lag | Real-time event loop, escalation to compliance agents |
| Precedent data stale | Weekly case law scraping (Federal Reporter, state reporters) |
| Client auth failure (Finn) | Fallback to email-based verification, manual identity confirmation |

---

## Next Steps

1. **This Week**: Run Apostle Chain agent discovery script, populate agents-7332-registry.json
2. **By April 14**: Verify all 26 agents have positive ATP balances
3. **By April 18**: Control tier agents passing health checks
4. **By April 25**: Execution agents processing 50+ intakes/day
5. **By May 2**: Full 26-agent network at 99%+ uptime

**Owner**: Kevan Burns (kevan-burns-chairman agent)  
**Stakeholders**: UNYKORN Legal ops, x402 payment team, Apostle Chain validators
