import { z } from "zod";

// ── Supported Chains ──

export const ForensicChain = z.enum([
  "tron",
  "ethereum",
  "polygon",
  "solana",
  "xrpl",
  "stellar",
  "bitcoin",
  "bsc",
  "avalanche",
  "arbitrum",
  "optimism",
  "base",
  "apostle",
]);

// ── Transaction Type ──

export const ForensicTxType = z.enum([
  "transfer",
  "contract_call",
  "token_approval",
  "swap",
  "bridge",
  "mint",
  "burn",
  "staking",
  "unstaking",
  "nft_transfer",
  "unknown",
]);

// ── Risk Level ──

export const RiskLevel = z.enum(["low", "medium", "high", "critical"]);

// ── Traced Wallet ──

export const TracedWalletSchema = z.object({
  address: z.string(),
  chain: ForensicChain,
  label: z.string().optional(), // e.g., "Suspect Primary", "Exchange Hot Wallet"
  ownerKnown: z.boolean().default(false),
  ownerName: z.string().optional(),
  riskLevel: RiskLevel,
  riskIndicators: z.array(z.string()).default([]),
  firstSeen: z.string().datetime().optional(),
  lastSeen: z.string().datetime().optional(),
  totalReceived: z.string().optional(),
  totalSent: z.string().optional(),
  currentBalance: z.string().optional(),
  transactionCount: z.number().int().optional(),
  linkedWallets: z.array(z.string()).default([]), // addresses
  notes: z.string().optional(),
});
export type TracedWallet = z.infer<typeof TracedWalletSchema>;

// ── Traced Transaction ──

export const TracedTransactionSchema = z.object({
  id: z.string().uuid(),
  txHash: z.string(),
  chain: ForensicChain,
  txType: ForensicTxType,
  fromAddress: z.string(),
  toAddress: z.string(),
  amount: z.string(),
  asset: z.string(), // token symbol
  timestamp: z.string().datetime(),
  blockNumber: z.number().int().optional(),
  fee: z.string().optional(),

  // Forensic analysis
  riskLevel: RiskLevel,
  riskIndicators: z.array(z.string()).default([]),
  isLayering: z.boolean().default(false), // structured to avoid detection
  isMixing: z.boolean().default(false),
  isExchangeDeposit: z.boolean().default(false),
  exchangeName: z.string().optional(),

  // Evidence
  evidenceItemId: z.string().uuid().optional(),
  screenshotHash: z.string().optional(),
  notes: z.string().optional(),
});
export type TracedTransaction = z.infer<typeof TracedTransactionSchema>;

// ── Forensic Case ──

export const ForensicCaseSchema = z.object({
  id: z.string().uuid(),
  matterId: z.string().uuid(),
  matterTitle: z.string().optional(),

  // Case info
  title: z.string(),
  description: z.string(),
  caseType: z.enum([
    "crypto_fraud",
    "wallet_tracing",
    "smart_contract_exploit",
    "nft_fraud",
    "money_laundering",
    "sanctions_screening",
    "asset_recovery",
    "compliance_audit",
    "rugpull_analysis",
    "custom",
  ]),

  // Chains involved
  chains: z.array(ForensicChain),

  // Wallets and transactions
  wallets: z.array(TracedWalletSchema).default([]),
  transactions: z.array(TracedTransactionSchema).default([]),
  totalValueTraced: z.string().optional(),
  totalValueRecoverable: z.string().optional(),

  // Suspects
  suspects: z.array(z.object({
    name: z.string().optional(),
    alias: z.string().optional(),
    wallets: z.array(z.string()), // addresses
    notes: z.string().optional(),
  })).default([]),

  // Status
  status: z.enum([
    "open",
    "active_tracing",
    "analysis_complete",
    "report_drafted",
    "evidence_packaged",
    "referred_to_law_enforcement",
    "closed",
  ]),

  // Assignment
  leadAnalyst: z.string().uuid().optional(),
  leadAnalystName: z.string().optional(),
  agentIds: z.array(z.string()).default([]),

  // Evidence
  evidenceItemIds: z.array(z.string().uuid()).default([]),
  reportDocumentId: z.string().uuid().optional(),

  // Timestamps
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  closedAt: z.string().datetime().optional(),
});
export type ForensicCase = z.infer<typeof ForensicCaseSchema>;
