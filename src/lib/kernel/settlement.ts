/**
 * SETTLEMENT LAYER
 *
 * x402 payment hooks, milestone gates, rights tracking, and revenue events.
 * Every dollar, ATP, or USDF that moves through a matter gets recorded here.
 * Milestone gates tie payments to conditions. Rights track ownership shares.
 * Revenue events capture fee income and contingency triggers.
 */

// ─── Types ──────────────────────────────────────────────────────────────────

export type PaymentType =
  | "retainer" | "milestone" | "contingency" | "settlement_distribution"
  | "filing_fee" | "expert_fee" | "court_cost" | "refund"
  | "flat_fee" | "hourly_billing";

export type SettlementAsset = "ATP" | "USDF" | "UNY" | "USD" | "USDT" | "ETH";

export type PaymentStatus =
  | "pending" | "authorized" | "settled" | "failed" | "reversed" | "held";

export interface PaymentEvent {
  id: string;
  matterId: string;
  type: PaymentType;
  amount: string;          // string for precision (matches Apostle Chain pattern)
  asset: SettlementAsset;
  from: string;            // party ID or wallet address
  to: string;
  status: PaymentStatus;
  milestoneId?: string;
  x402TxHash?: string;     // Apostle Chain / x402 transaction hash
  chainId?: number;        // default 7332 (Apostle)
  description: string;
  createdAt: string;
  settledAt?: string;
}

export interface MilestoneGate {
  id: string;
  matterId: string;
  title: string;
  condition: string;       // human-readable condition
  paymentEventId?: string; // payment released when gate is met
  met: boolean;
  metAt?: string;
  verifiedBy?: string;
  createdAt: string;
}

export type RightType =
  | "ownership" | "proceeds" | "lien" | "judgment"
  | "contingency_share" | "retainer_credit" | "escrow";

export interface RightsRecord {
  id: string;
  matterId: string;
  partyId: string;
  partyName: string;
  rightType: RightType;
  share: number;           // 0.0 – 1.0
  effectiveDate: string;
  expiresAt?: string;
  sourceDocumentId?: string;
  notes?: string;
}

export type RevenueType =
  | "fee_earned" | "contingency_trigger" | "settlement_received"
  | "judgment_collected" | "retainer_applied" | "expense_reimbursed"
  | "filing_fee_recovered" | "interest_accrued";

export interface RevenueEvent {
  id: string;
  matterId: string;
  type: RevenueType;
  amount: string;
  asset: SettlementAsset;
  description: string;
  linkedPaymentId?: string;
  createdAt: string;
}

// ─── Storage ────────────────────────────────────────────────────────────────

const KEYS = {
  payments: "unykorn_truth_payments",
  milestones: "unykorn_truth_milestones",
  rights: "unykorn_truth_rights",
  revenue: "unykorn_truth_revenue",
} as const;

function load<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); }
  catch { return fallback; }
}

function save(key: string, data: unknown): void {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(key, JSON.stringify(data)); }
  catch { /* storage full */ }
}

// ─── SettlementLedger ───────────────────────────────────────────────────────

export class SettlementLedger {
  private payments: PaymentEvent[] = [];
  private milestones: MilestoneGate[] = [];
  private rights: RightsRecord[] = [];
  private revenue: RevenueEvent[] = [];
  private loaded = false;

  private ensureLoaded(): void {
    if (this.loaded) return;
    this.payments = load(KEYS.payments, []);
    this.milestones = load(KEYS.milestones, []);
    this.rights = load(KEYS.rights, []);
    this.revenue = load(KEYS.revenue, []);
    this.loaded = true;
  }

  private persist(): void {
    save(KEYS.payments, this.payments);
    save(KEYS.milestones, this.milestones);
    save(KEYS.rights, this.rights);
    save(KEYS.revenue, this.revenue);
  }

  // ─── Payments ─────────────────────────────────────────────────────

  /** Record a new payment event. */
  createPayment(
    matterId: string, type: PaymentType, amount: string,
    asset: SettlementAsset, from: string, to: string,
    description: string, milestoneId?: string
  ): PaymentEvent {
    this.ensureLoaded();
    const payment: PaymentEvent = {
      id: crypto.randomUUID(),
      matterId, type, amount, asset, from, to,
      status: "pending",
      milestoneId, description,
      chainId: 7332,
      createdAt: new Date().toISOString(),
    };
    this.payments.push(payment);
    this.persist();
    return payment;
  }

  /** Mark a payment as settled (optionally with x402 tx hash). */
  settlePayment(paymentId: string, x402TxHash?: string): PaymentEvent | null {
    this.ensureLoaded();
    const p = this.payments.find(x => x.id === paymentId);
    if (!p || p.status === "settled") return p ?? null;
    p.status = "settled";
    p.settledAt = new Date().toISOString();
    if (x402TxHash) p.x402TxHash = x402TxHash;
    this.persist();
    return p;
  }

  /** Update payment status. */
  updatePaymentStatus(paymentId: string, status: PaymentStatus): void {
    this.ensureLoaded();
    const p = this.payments.find(x => x.id === paymentId);
    if (p) { p.status = status; this.persist(); }
  }

  /** Get all payments for a matter. */
  getPayments(matterId: string): PaymentEvent[] {
    this.ensureLoaded();
    return this.payments.filter(p => p.matterId === matterId);
  }

  // ─── Milestone Gates ──────────────────────────────────────────────

  /** Create a milestone gate that must be met before payment release. */
  createMilestoneGate(
    matterId: string, title: string, condition: string,
    paymentEventId?: string
  ): MilestoneGate {
    this.ensureLoaded();
    const gate: MilestoneGate = {
      id: crypto.randomUUID(),
      matterId, title, condition,
      paymentEventId, met: false,
      createdAt: new Date().toISOString(),
    };
    this.milestones.push(gate);
    this.persist();
    return gate;
  }

  /** Mark a milestone gate as met. If linked to a payment, authorizes it. */
  meetMilestoneGate(gateId: string, verifiedBy: string): MilestoneGate | null {
    this.ensureLoaded();
    const gate = this.milestones.find(g => g.id === gateId);
    if (!gate || gate.met) return gate ?? null;
    gate.met = true;
    gate.metAt = new Date().toISOString();
    gate.verifiedBy = verifiedBy;

    // Auto-authorize linked payment
    if (gate.paymentEventId) {
      const p = this.payments.find(x => x.id === gate.paymentEventId);
      if (p && p.status === "pending") p.status = "authorized";
    }

    this.persist();
    return gate;
  }

  /** Get all milestones for a matter. */
  getMilestones(matterId: string): MilestoneGate[] {
    this.ensureLoaded();
    return this.milestones.filter(m => m.matterId === matterId);
  }

  // ─── Rights ───────────────────────────────────────────────────────

  /** Record a rights allocation for a party. */
  recordRight(
    matterId: string, partyId: string, partyName: string,
    rightType: RightType, share: number,
    sourceDocumentId?: string, notes?: string
  ): RightsRecord {
    this.ensureLoaded();
    const right: RightsRecord = {
      id: crypto.randomUUID(),
      matterId, partyId, partyName, rightType,
      share: Math.max(0, Math.min(1, share)), // clamp 0–1
      effectiveDate: new Date().toISOString(),
      sourceDocumentId, notes,
    };
    this.rights.push(right);
    this.persist();
    return right;
  }

  /** Get all active rights for a matter. */
  getRights(matterId: string): RightsRecord[] {
    this.ensureLoaded();
    const now = new Date().toISOString();
    return this.rights.filter(r =>
      r.matterId === matterId && (!r.expiresAt || r.expiresAt > now)
    );
  }

  // ─── Revenue ──────────────────────────────────────────────────────

  /** Record a revenue event. */
  recordRevenue(
    matterId: string, type: RevenueType, amount: string,
    asset: SettlementAsset, description: string,
    linkedPaymentId?: string
  ): RevenueEvent {
    this.ensureLoaded();
    const event: RevenueEvent = {
      id: crypto.randomUUID(),
      matterId, type, amount, asset,
      description, linkedPaymentId,
      createdAt: new Date().toISOString(),
    };
    this.revenue.push(event);
    this.persist();
    return event;
  }

  /** Get all revenue for a matter. */
  getRevenue(matterId: string): RevenueEvent[] {
    this.ensureLoaded();
    return this.revenue.filter(r => r.matterId === matterId);
  }

  // ─── Ledger Balance ───────────────────────────────────────────────

  /** Compute net settled balance for a matter, optionally filtered by asset. */
  getLedgerBalance(matterId: string, asset?: SettlementAsset): Record<string, number> {
    this.ensureLoaded();
    const settled = this.payments.filter(
      p => p.matterId === matterId && p.status === "settled" && (!asset || p.asset === asset)
    );
    const balances: Record<string, number> = {};
    for (const p of settled) {
      const amt = parseFloat(p.amount) || 0;
      const sign = p.type === "refund" || p.type === "settlement_distribution" ? -1 : 1;
      balances[p.asset] = (balances[p.asset] || 0) + amt * sign;
    }
    return balances;
  }

  // ─── Stats ────────────────────────────────────────────────────────

  get allPayments(): PaymentEvent[] { this.ensureLoaded(); return [...this.payments]; }
  get allMilestones(): MilestoneGate[] { this.ensureLoaded(); return [...this.milestones]; }
  get allRights(): RightsRecord[] { this.ensureLoaded(); return [...this.rights]; }
  get allRevenue(): RevenueEvent[] { this.ensureLoaded(); return [...this.revenue]; }

  get paymentCount(): number { this.ensureLoaded(); return this.payments.length; }
  get pendingPayments(): number {
    this.ensureLoaded();
    return this.payments.filter(p => p.status === "pending" || p.status === "authorized").length;
  }
  get settledTotal(): Record<string, number> {
    this.ensureLoaded();
    const totals: Record<string, number> = {};
    for (const p of this.payments.filter(x => x.status === "settled")) {
      totals[p.asset] = (totals[p.asset] || 0) + (parseFloat(p.amount) || 0);
    }
    return totals;
  }

  /** Purge all settlement data. */
  reset(): void {
    this.payments = []; this.milestones = []; this.rights = []; this.revenue = [];
    this.loaded = true;
    if (typeof window === "undefined") return;
    Object.values(KEYS).forEach(k => localStorage.removeItem(k));
  }
}
