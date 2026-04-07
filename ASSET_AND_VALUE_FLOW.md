# ASSET AND VALUE FLOW — UNYKORN // LAW

*Version: 1.0.0*
*Created: April 7, 2026*
*Authority: Kevan Burns, Chairman*

---

## I. ASSET TYPES

| Asset | Type | Chain | Decimals | Purpose |
|-------|------|-------|----------|---------|
| ATP | Native token | Apostle (7332) | 18 | Agent settlement, audit anchoring |
| UNY | Utility token | Apostle (7332) | 18 | Governance, agent incentives |
| USDF | Stablecoin | Apostle (7332) | 7 | Client billing, fee settlement |
| USD | Fiat | Off-chain | 2 | Client payments, court fees, retainers |
| USDT | Stablecoin | TRON / ETH | 6/18 | Forensic tracing (victim/suspect assets) |
| ETH | Native | Ethereum | 18 | Forensic tracing, DeFi dispute analysis |

---

## II. VALUE FLOW DIAGRAM

```
CLIENT                    PLATFORM                          CHAIN
──────                    ────────                          ─────

  ┌─────────────┐
  │ Client pays  │──── Retainer / Flat Fee ────┐
  │ engagement   │                              │
  └─────────────┘                              ▼
                                    ┌──────────────────┐
                                    │  SETTLEMENT       │
                                    │  LEDGER            │
  ┌─────────────┐                  │                    │
  │ Contingency  │──── Trigger ───▶│  PaymentEvent      │──── x402 ────▶ Apostle 7332
  │ event        │    (judgment/   │  MilestoneGate     │              (ATP settlement)
  └─────────────┘     settlement)  │  RightsRecord      │
                                    │  RevenueEvent      │
  ┌─────────────┐                  │                    │
  │ Court filing │──── Fee ───────▶│  filing_fee type   │
  │ fees         │                  │                    │
  └─────────────┘                  └──────┬─────────────┘
                                          │
                                          ▼
                                    ┌──────────────────┐
                                    │  AUDIT TRAIL      │
                                    │  (hash-chained)    │
                                    └──────────────────┘
```

---

## III. PAYMENT TYPES

| Type | Direction | Trigger | Approval Required |
|------|----------|---------|-------------------|
| `retainer` | Client → Firm | Engagement signed | ✅ Attorney |
| `flat_fee` | Client → Firm | Engagement signed | ✅ Attorney |
| `hourly_billing` | Client → Firm | Monthly invoice | ✅ Attorney |
| `contingency` | Settlement → Client + Firm | Judgment/settlement | ✅ Attorney |
| `settlement_distribution` | Opposing → Client | Settlement agreement | ✅ Attorney |
| `filing_fee` | Firm → Court | Filing event | ✅ Attorney |
| `expert_fee` | Firm → Expert | Expert engagement | ✅ Attorney |
| `court_cost` | Firm → Court | Court order | ✅ Attorney |
| `refund` | Firm → Client | Overpayment / withdrawal | ✅ Attorney |
| `milestone` | Held → Released | MilestoneGate met | ✅ Attorney + Verifier |

---

## IV. MILESTONE GATES

Milestone gates prevent payment release until conditions are verified:

```
Payment Created (status: pending)
        │
        ▼
MilestoneGate condition evaluated
        │
    ┌───┴───┐
    │ unmet │
    └───┬───┘
        │ (wait)
        ▼
    ┌───────┐
    │  met  │ ← verifiedBy: human userId
    └───┬───┘
        │
        ▼
Payment authorized (status: authorized)
        │
        ▼
x402 settlement on Apostle Chain 7332
        │
        ▼
Payment settled (status: settled, x402TxHash recorded)
```

---

## V. RIGHTS TRACKING

| Right Type | Description |
|-----------|-------------|
| `ownership` | Property/asset ownership share |
| `proceeds` | Right to receive proceeds from sale/settlement |
| `lien` | Secured interest in asset |
| `judgment` | Court-ordered payment obligation |
| `contingency_share` | Firm's contingency fee percentage |
| `retainer_credit` | Remaining retainer balance |
| `escrow` | Funds held in escrow pending condition |

Each right record tracks:
- Party identification and share (0.0–1.0)
- Effective date and expiration
- Source document reference
- Linked matter

---

## VI. REVENUE EVENTS

| Event Type | Description |
|-----------|-------------|
| `fee_earned` | Fee earned from billable work |
| `contingency_trigger` | Contingency percentage triggered by recovery |
| `settlement_received` | Settlement funds received |
| `judgment_collected` | Judgment amount collected |
| `retainer_applied` | Retainer credit applied to work |
| `expense_reimbursed` | Client reimbursement for advanced costs |
| `filing_fee_recovered` | Court costs recovered in judgment |
| `interest_accrued` | Interest on held funds |

---

## VII. CHAIN SETTLEMENT

All payments optionally anchor to Apostle Chain 7332 via x402 protocol:
- Payment events generate x402 transaction envelopes
- Settled payments receive `x402TxHash` confirmation
- Chain ID: 7332 (default for all legal settlements)
- Audit entries hash-reference the chain transaction
- Settlement failure does not block legal operations (graceful degradation)

---

## VIII. FORENSIC VALUE TRACKING

For forensic cases (crypto fraud, wallet tracing), value flows are tracked separately:

| Metric | Description | Source |
|--------|-------------|--------|
| `totalValueTraced` | Total assets identified in investigation | Wallet analysis |
| `totalValueRecoverable` | Estimated recoverable amount | Forensic assessment |
| Transaction amounts | Individual flow amounts | On-chain data |
| Bridge transfers | Cross-chain movement | Bridge analysis |
| Exchange deposits | Funds reaching exchanges | Exchange identification |

---

*All value flows are logged in the immutable audit trail. No payment moves without a corresponding audit entry.*
