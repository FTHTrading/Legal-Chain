/**
 * x402 Runner Engine
 *
 * Autonomous payment runners on Apostle Chain 7332.
 * Handles ATP-funded legal operations: court filing fees, research
 * subscriptions, expert witness deposits, forensic analysis, and
 * document service fees — all settled at machine speed.
 */

import type {
  X402Action,
  X402ActionType,
  X402Receipt,
  RunnerDef,
} from "./types";

// ── Runner Registry ──

const runners = new Map<string, RunnerDef>();

const DEFAULT_RUNNERS: RunnerDef[] = [
  {
    id: "runner-filing",
    name: "Filing Fee Runner",
    team: "execution",
    agentId: "a1b2c3d4-0001-4000-a000-000000000001",
    atpBalance: "50000000000000000000000",
    capabilities: ["court_filing_fee", "document_service", "case_registration"],
    x402Enabled: true,
    maxConcurrentTasks: 5,
    status: "active",
    lastHeartbeat: new Date().toISOString(),
  },
  {
    id: "runner-research",
    name: "Research Subscription Runner",
    team: "execution",
    agentId: "a1b2c3d4-0002-4000-a000-000000000002",
    atpBalance: "25000000000000000000000",
    capabilities: ["research_subscription", "agent_operation"],
    x402Enabled: true,
    maxConcurrentTasks: 10,
    status: "active",
    lastHeartbeat: new Date().toISOString(),
  },
  {
    id: "runner-forensics",
    name: "Forensic Analysis Runner",
    team: "execution",
    agentId: "a1b2c3d4-0003-4000-a000-000000000003",
    atpBalance: "75000000000000000000000",
    capabilities: ["forensic_analysis", "evidence_preservation", "chain_anchor"],
    x402Enabled: true,
    maxConcurrentTasks: 3,
    status: "active",
    lastHeartbeat: new Date().toISOString(),
  },
  {
    id: "runner-expert",
    name: "Expert Witness Runner",
    team: "execution",
    agentId: "a1b2c3d4-0004-4000-a000-000000000004",
    atpBalance: "100000000000000000000000",
    capabilities: ["expert_witness_deposit"],
    x402Enabled: true,
    maxConcurrentTasks: 2,
    status: "active",
    lastHeartbeat: new Date().toISOString(),
  },
];

// ── Initialize Runners ──

export function initRunners(): void {
  for (const runner of DEFAULT_RUNNERS) {
    runners.set(runner.id, runner);
  }
}

// ── Runner Selection ──

function selectRunner(actionType: X402ActionType): RunnerDef | null {
  for (const runner of runners.values()) {
    if (
      runner.status === "active" &&
      runner.x402Enabled &&
      runner.capabilities.includes(actionType)
    ) {
      return runner;
    }
  }
  return null;
}

// ── Payment Execution ──

/**
 * Execute an x402 payment action.
 * Selects the appropriate runner, validates the action,
 * and settles the payment on Apostle Chain 7332.
 */
export async function executeX402Action(
  action: X402Action,
  stepId?: string
): Promise<X402Receipt> {
  const runner = selectRunner(action.type);
  if (!runner) {
    throw new Error(`No active runner for action type: ${action.type}`);
  }

  // Validate balance
  const balance = BigInt(runner.atpBalance);
  const amount = BigInt(action.amount);
  if (balance < amount) {
    throw new Error(
      `Runner ${runner.id} insufficient balance: ${runner.atpBalance} < ${action.amount}`
    );
  }

  const rpcUrl = process.env.APOSTLE_CHAIN_RPC || "http://localhost:7332";

  // Build transaction envelope
  const txHash = generateTxHash();
  const receipt: X402Receipt = {
    txHash,
    from: runner.agentId,
    to: action.recipient || "treasury",
    asset: action.asset,
    amount: action.amount,
    action: action.type,
    matterId: action.matterId,
    stepId,
    timestamp: new Date().toISOString(),
    settled: false,
  };

  // Attempt Apostle Chain settlement
  try {
    const response = await fetch(`${rpcUrl}/v1/tx`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        hash: txHash,
        from: runner.agentId,
        nonce: Date.now(),
        chain_id: 7332,
        payload: {
          type: "transfer",
          to: action.recipient || runner.agentId,
          asset: action.asset,
          amount: action.amount,
        },
        signature: "0".repeat(128),
        timestamp: new Date().toISOString(),
      }),
    });

    if (response.ok) {
      const result = await response.json();
      receipt.settled = true;
      receipt.blockHeight = result.height;
    }
  } catch {
    // Chain unavailable — receipt recorded but unsettled
    // Will be reconciled by settlement engine
  }

  // Debit runner balance
  runner.atpBalance = (balance - amount).toString();

  return receipt;
}

// ── Runner Status ──

export function getRunnerStatus(): {
  runners: RunnerDef[];
  activeCount: number;
  totalBalance: string;
} {
  const all = Array.from(runners.values());
  let totalBalance = BigInt(0);
  for (const r of all) {
    totalBalance += BigInt(r.atpBalance);
  }
  return {
    runners: all,
    activeCount: all.filter((r) => r.status === "active").length,
    totalBalance: totalBalance.toString(),
  };
}

export function getRunner(id: string): RunnerDef | undefined {
  return runners.get(id);
}

// ── Helpers ──

function generateTxHash(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Initialize on import
initRunners();
