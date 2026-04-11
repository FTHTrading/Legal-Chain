# 26 UNYKORN Agents — Live Status Check (April 11, 2026)

**Generated**: 2026-04-11 @ ~15:30 UTC  
**Status**: DEGRADED — Critical services offline, 15 processes running

---

## EXECUTIVE SUMMARY

### Agent Network Claims vs. Reality

| Tier | Declared | Status | Verified |
|------|----------|--------|----------|
| Control (15) | Treasury, compliance, policy, risk | ❌ OFFLINE | ❌ Cannot verify — Apostle Chain unreachable |
| Execution (7) | Research, documents, operations (x402) | ⚠️ PARTIAL | ⚠️ Node processes running, metering unknown |
| Intelligence (2) | Jurisprudence, pattern analysis | ❌ OFFLINE | ❌ No database status visible |
| Interface (2) | Namespace, advocacy | ❌ OFFLINE | ❌ Portal API not responding |
| **TOTAL** | **26** | **DEGRADED** | **0/26 verified online** |

---

## ACTUAL RUNTIME STATUS (April 11, 2026)

### Services Responsive ✅
- **Port 8080**: 1 service responding (inference router / speech router / other)
- **Total Process Count**: 15 (8 Node.js + 7 Python)

### Services NOT Responding ❌
- **Apostle Chain API** (7332): Timeout — cannot enumerate agents, cannot check balances, cannot verify x402 settlement
- **Legal-Chain API** (3003): Timeout — cannot get `/api/agents` status, cannot route intake processing
- **x402 Mesh Gateway** (98.91.89.169:8080): Unknown reachability
- **Finn Runtime** (7700): Unknown reachability

### Running Processes (Identified)

#### Node.js Services (8 processes)
| PID | Status | Service | Port | Known Purpose |
|-----|--------|---------|------|------------------|
| 26244 | ✓ Running | Unknown | ? | ~24MB memory |
| 50196 | ✓ Running | Unknown | ? | ~1.5MB memory |
| 74468 | ✓ Running | Unknown | ? | ~28KB memory |
| 92532 | ✓ Running | Unknown | ? | ~24KB memory |
| 101408 | ✓ Running | Unknown | ? | ~20KB memory |
| 123244 | ✓ Running | Unknown | ? | ~20KB memory |
| 128156 | ✓ Running | ? **PORT 8080** | 8080 | ~1.1MB memory |
| 129484 | ✓ Running | Unknown | ? | ~24KB memory |

#### Python Services (7 processes)
| PID | Status | Service | Port | Known Purpose |
|-----|--------|---------|------|------------------|
| 2484 | ✓ Running | Finn biometrics? | ? | ~51MB memory |
| 30912 | ✓ Running | Inference router? | ? | ~37MB memory |
| 67648 | ✓ Running | Unknown | ? | ~62MB memory |
| 73808 | ✓ Running | Unknown | ? | ~36MB memory |
| 74364 | ✓ Running | Unknown | ? | ~12MB memory |
| 110092 | ✓ Running | Unknown | ? | ~2.3MB memory |
| 148760 | ✓ Running | Unknown | ? | ~60MB memory |

---

## BLOCKER: APOSTLE CHAIN UNREACHABLE

### Problem
```
curl http://localhost:7332/health
→ The operation has timed out (port 7332)
```

### Impact
- **Cannot verify agent registry** — 26 agents declared, 0 confirmed online
- **Cannot check ATP balances** — Unknown if treasury agents have funding
- **Cannot route x402 transactions** — Execution agents cannot settle fees
- **Cannot query agent heartbeat** — Unknown which agents are alive vs. dead
- **Cannot enforce governance** — Policy engine rules cannot be validated

### Root Causes (Likely)
1. **Apostle Chain crashed/stopped** — EC2 service not running, needs restart
2. **Network routing issue** — Localhost 7332 not bound, possible ENV config
3. **EC2 instance down** — Previous deployment may have failed
4. **Port conflict** — Something else listening on 7332 (less likely)

---

## BLOCKER: LEGAL-CHAIN API UNREACHABLE

### Problem
```
curl http://localhost:3003/api/agents
→ The operation has timed out (port 3003)
```

### Impact
- **Cannot get live agent status** — UI shows stale/no data
- **Cannot process intakes** — Intake-processor agent cannot be reached
- **Cannot score cases** — Intake-scorer agent unavailable
- **Cannot route to execution agents** — Cases cannot be assigned to research/document agents

### Root Causes (Likely)
1. **Next.js dev server not running** — `npm run dev` or `npx next dev` not active
2. **Build failure** — Previous `npm run build` didn't complete
3. **Port conflict** — Something else listening on 3003
4. **Dependencies missing** — `npm install` incomplete after seed data creation

---

## REMEDIATION PLAN (Immediate)

### Step 1: Restart Apostle Chain (15 min)
```bash
# SSH to EC2: 98.91.89.169 (or check local cargo target)
cd C:\Users\Kevan\apostle-chain\

# Stop any existing instance
pkill -f "apostle" || true

# Rebuild + restart
cargo build --release
./target/release/apostle-chain --listen 127.0.0.1:7332

# Verify
curl http://localhost:7332/health
# Expected: { "ok": true } or similar
```

### Step 2: Restart Legal-Chain API (10 min)
```bash
# In terminal at C:\Users\Kevan\Legal-Chain\
npm install  # Ensure dependencies after seed data changes
npm run dev  # Start dev server on port 3003

# Verify
curl http://localhost:3003/api/agents
# Expected: { "network": { "total": 26, ... }, "runtime": { ... } }
```

### Step 3: Enumerate Agents (5 min)
```bash
curl http://localhost:7332/v1/agents/list
# or query genesis ledger if endpoint doesn't exist

# Save output to → agents-7332-registry.json
```

### Step 4: Verify Agent Balances (5 min)
```bash
# Kevan chairman
curl http://localhost:7332/v1/agent/87724c76-da93-4b1a-9fa6-271ba856338e/balance

# Check all 5 treasury agents similarly
```

### Step 5: Check x402 Mesh Status (5 min)
```bash
curl http://98.91.89.169:8080/health
# Verify payment metering is accepting transactions
```

---

## WHAT TO DO NOW

### Immediate Actions (This Hour)
1. [ ] **Restart Apostle Chain**: Check if service is running, restart if needed
2. [ ] **Restart Legal-Chain**: `npm install && npm run dev` in Legal-Chain directory
3. [ ] **Verify ports**: Confirm 7332 and 3003 are responding within 5 minutes
4. [ ] **Enumerate agents**: Query both APIs to populate master registry
5. [ ] **Run status check**: Create `agents-status-2026-04-11.json` with all findings

### By EOD (8 hours)
- [ ] All 26 agents verified with ATP balances
- [ ] Agent audit document updated with live inventory
- [ ] Week 1 launch plan ready to execute

### By April 16 (1 week)
- [ ] Week 1 checklist 100% complete (all 26 agents + funding confirmed)
- [ ] Week 2 (control tier activation) starting

---

## PROCESS VISIBILITY

### Question: Which Node/Python process is which agent?

To identify the processes, check environment or command-line args:

```bash
# For each Node PID
Get-Process -Id 26244 | Select-Object -ExpandProperty ProcessName
# Then inspect its command line or logs

# For each Python PID  
Get-Process -Id 2484 | Select-Object -ExpandProperty ProcessName
# Check if it's Finn, inference router, or other service
```

### Likely Service Map (Educated Guesses)
- **Python 2484** (51MB) → Finn biometrics (GPU-intensive)
- **Python 30912** (37MB) → Inference router (LLM)
- **Node 26244/50196** (24MB, 1.5MB) → Could be Legal-Chain or x402 services
- **Port 8080** → Inference/speech router (may be Python or Node bridge)

**Need to verify with port scan or log files.**

---

## ATP Treasury Status

### Last Known (Pre-April-11)
- kevan-burns-chairman: 500K ATP ✅ Confirmed balance on-chain
- genesis-treasury: 1M ATP ❓ Needs verification
- unykorn-operator: 250K ATP ❓ Needs verification
- x402-credit-pool: 500K ATP ❓ Needs verification
- mesh-pay-reserve: 200K ATP ❓ Needs verification
- **Total**: 2.45M ATP ❓ Needs re-confirmation

### Required
Cannot re-confirm until Apostle Chain API is responding on port 7332.

---

## Success Criteria (24 Hours)

When this document is updated, should show:

```
APOSTLE CHAIN API (7332): ✅ ONLINE
  - /health: responding
  - /status: height advancing
  - /v1/agents/list: returning 26+ agents

LEGAL-CHAIN API (3003): ✅ ONLINE
  - /api/agents: returning live network status

ATP TREASURY: ✅ ALL CONFIRMED
  - kevan-burns-chairman: 500K ATP ✓
  - genesis-treasury: 1M ATP ✓
  - (4 more verified)
  
AGENTS ENUMERATED: ✅ 26/26 CONFIRMED
  - All UUIDs recorded
  - All signing keys verified
  - All on-chain registrations confirmed

EXECUTION AGENTS: ⚠️ TESTING
  - x402 metering responding
  - Fee settlement working
  - First test intake processing in progress
```

---

**Owner**: Kevan Burns  
**Escalation**: Restart services, then re-run discovery  
**Next Update**: After port 7332 + 3003 are online again
