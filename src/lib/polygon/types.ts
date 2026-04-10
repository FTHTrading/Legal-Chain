/**
 * Polygon Legal Chain ΓÇö Type Definitions
 *
 * Core types for audit anchoring, document integrity,
 * case NFTs, ERC-6551 vaults, and escrow on Polygon.
 */

/* ΓöÇΓöÇΓöÇ Network Config ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ */

export type PolygonNetwork = "polygon-mainnet" | "polygon-amoy";

export interface PolygonConfig {
  network: PolygonNetwork;
  rpcUrl: string;
  chainId: number;
  deployerAddress?: string;
  contracts: ContractAddresses;
}

export interface ContractAddresses {
  legalCaseNFT: string;
  legalCaseAccount: string;
  auditAnchor: string;
  documentRegistry: string;
  legalNameRegistry: string;
  erc6551Registry: string;
}

export const POLYGON_NETWORKS: Record<PolygonNetwork, { rpcUrl: string; chainId: number; explorer: string }> = {
  "polygon-mainnet": {
    rpcUrl: "https://polygon-bor-rpc.publicnode.com",
    chainId: 137,
    explorer: "https://polygonscan.com",
  },
  "polygon-amoy": {
    rpcUrl: "https://rpc-amoy.polygon.technology",
    chainId: 80002,
    explorer: "https://amoy.polygonscan.com",
  },
};

/* ΓöÇΓöÇΓöÇ Audit Anchoring ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ */

export interface AuditAnchor {
  /** SHA-256 hash of the audit batch */
  batchHash: string;
  /** Number of audit entries in this batch */
  entryCount: number;
  /** ISO timestamp of anchor */
  timestamp: string;
  /** Polygon transaction hash */
  txHash: string;
  /** Block number where tx was included */
  blockNumber: number;
  /** MATIC gas cost */
  gasCost: string;
}

export interface AuditBatch {
  batchId: number;
  batchHash: string;
  entryHashes: string[];
  createdAt: string;
  anchored: boolean;
  txHash?: string;
}

/* ΓöÇΓöÇΓöÇ Document Integrity ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ */

export interface DocumentHash {
  documentId: string;
  contentHash: string;
  title: string;
  caseRef: string;
  timestamp: string;
  txHash: string;
  blockNumber: number;
}

export interface DocumentVerification {
  documentId: string;
  contentHash: string;
  verified: boolean;
  onChainHash?: string;
  onChainTimestamp?: string;
  blockNumber?: number;
}

/* ΓöÇΓöÇΓöÇ Case NFTs (ERC-721) ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ */

export interface CaseNFT {
  /** ERC-721 token ID */
  tokenId: string;
  /** Case reference (e.g., UNY-ADV-2026-001) */
  caseRef: string;
  title: string;
  /** Current owner address */
  owner: string;
  /** Token URI pointing to metadata */
  tokenURI: string;
  /** Mint transaction hash */
  mintTxHash: string;
  blockNumber: number;
  mintedAt: string;
  /** ERC-6551 vault address (token-bound account) */
  vaultAddress?: string;
  transfers: CaseNFTTransfer[];
}

export interface CaseNFTTransfer {
  from: string;
  to: string;
  txHash: string;
  timestamp: string;
  reason: string;
}

export interface CaseNFTMetadata {
  name: string;
  description: string;
  image: string;
  external_url: string;
  attributes: {
    trait_type: string;
    value: string;
  }[];
  properties: {
    caseRef: string;
    caseType: string;
    jurisdiction: string;
    clientName: string;
    createdAt: string;
    factCount: number;
    documentCount: number;
    stateHash: string;
  };
}

/* ΓöÇΓöÇΓöÇ ERC-6551 Token Bound Accounts (Vaults) ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ */

export interface CaseVault {
  /** The TBA address (deterministic from NFT) */
  address: string;
  /** Token ID of the parent NFT */
  tokenId: string;
  caseRef: string;
  /** MATIC balance in the vault */
  maticBalance: string;
  /** ERC-20 token balances held by the vault */
  tokenBalances: VaultTokenBalance[];
  /** Document hashes anchored in the vault */
  documentHashes: string[];
  /** Evidence anchors stored */
  evidenceAnchors: string[];
  /** Escrow entries */
  escrows: VaultEscrow[];
  /** Transaction history */
  transactions: VaultTransaction[];
  createdAt: string;
  createTxHash: string;
}

export interface VaultTokenBalance {
  tokenAddress: string;
  symbol: string;
  balance: string;
  decimals: number;
}

export interface VaultEscrow {
  id: string;
  amount: string;
  token: string; // "MATIC" or ERC-20 address
  depositor: string;
  purpose: "retainer" | "fee" | "settlement" | "bond";
  status: "held" | "released" | "refunded";
  depositTxHash: string;
  releaseTxHash?: string;
  createdAt: string;
  resolvedAt?: string;
}

export interface VaultTransaction {
  txHash: string;
  type: "deposit" | "withdrawal" | "anchor" | "escrow_deposit" | "escrow_release";
  amount?: string;
  token?: string;
  timestamp: string;
  description: string;
}

/* ΓöÇΓöÇΓöÇ Chain Dashboard State ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ */

export interface ChainStats {
  network: PolygonNetwork;
  explorerUrl: string;
  deployerAddress: string;
  deployerBalance: string;
  issuerAddress: string;
  issuerBalance: string;
  contracts: {
    name: string;
    address: string;
    deployed: boolean;
  }[];
  totalAnchors: number;
  totalDocumentHashes: number;
  totalCaseNFTs: number;
  totalVaults: number;
  totalNamespaces: number;
  activeEscrows: number;
  totalEscrowValue: string;
  totalGasSpent: string;
  lastAnchorTimestamp?: string;
  connected: boolean;
}

/* ΓöÇΓöÇΓöÇ On-Chain Events (parsed from contract logs) ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ */

export interface ChainEvent {
  id: string;
  type:
    | "anchor"
    | "document_hash"
    | "nft_mint"
    | "nft_transfer"
    | "vault_created"
    | "escrow_deposit"
    | "escrow_release"
    | "namespace_registered";
  txHash: string;
  blockNumber: number;
  timestamp: string;
  details: Record<string, string>;
}

/* ΓöÇΓöÇΓöÇ Legal Namespace (.law / .legal) ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ */

export type NamespaceTLD = "law" | "legal";

export interface LegalNamespace {
  /** Full name (e.g., "kevan.law") */
  fullName: string;
  /** Name portion (e.g., "kevan") */
  name: string;
  /** TLD ("law" or "legal") */
  tld: NamespaceTLD;
  /** NFT token ID */
  tokenId: string;
  /** Owner wallet address */
  owner: string;
  /** Resolution metadata */
  resolution: string;
  /** Expiry date */
  expiry: string;
  /** Token URI */
  tokenURI: string;
  /** Mint transaction hash */
  mintTxHash: string;
  mintedAt: string;
}

export interface NamespaceAvailability {
  name: string;
  tld: NamespaceTLD;
  fullName: string;
  available: boolean;
  currentOwner?: string;
  expiry?: string;
}

export interface NamespaceMetadata {
  name: string;
  description: string;
  image: string;
  external_url: string;
  attributes: {
    trait_type: string;
    value: string;
  }[];
  properties: {
    name: string;
    tld: string;
    fullName: string;
    registeredAt: string;
    expiry: string;
    resolution: string;
  };
}

/* ΓöÇΓöÇΓöÇ IPFS Document Types ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ */

export interface IPFSPinResult {
  cid: string;
  size: number;
  name: string;
  timestamp: string;
}

export interface IPFSDocument {
  cid: string;
  name: string;
  caseRef: string;
  docType: string;
  contentHash: string;
  size: number;
  pinnedAt: string;
  gatewayUrl: string;
}

/* ΓöÇΓöÇΓöÇ API Response Wrapper ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ */

export interface PolygonApiResponse<T> {
  ok: boolean;
  data?: T;
  error?: string;
  txHash?: string;
  blockNumber?: number;
  gasUsed?: string;
}