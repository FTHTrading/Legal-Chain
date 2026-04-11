/**
 * Polygon Operations — High-level contract interactions.
 *
 * Server-side only. Wraps raw ABI calls with typed inputs/outputs.
 * Uses ethers v6 + the deployed contract addresses from client.ts.
 */

import { ethers } from "ethers";
import { getProvider, getIssuerWallet, getPolygonConfig, getExplorerTxUrl } from "./client";
import {
  LegalCaseNFT_ABI,
  AuditAnchor_ABI,
  DocumentRegistry_ABI,
  LegalNameRegistry_ABI,
  ERC6551Registry_ABI,
  LegalCaseAccount_ABI,
} from "./abis";
import type {
  CaseNFTMetadata,
  NamespaceMetadata,
  AuditAnchor,
  DocumentVerification,
  NamespaceAvailability,
  LegalNamespace,
  CaseVault,
} from "./types";

// ─── Case NFT ─────────────────────────────────────────────────────────────── //

export interface MintCaseInput {
  to: string;
  caseRef: string;
  caseType: string;
  jurisdiction: string;
  metadata: CaseNFTMetadata;
  stateHash?: string; // hex bytes32 — computed from matter if omitted
}

export interface MintCaseResult {
  tokenId: string;
  txHash: string;
  blockNumber: number;
  explorerUrl: string;
}

/** Server-side: Issuer mints a case NFT. URI is inline base64 JSON metadata. */
export async function mintCaseNFT(input: MintCaseInput): Promise<MintCaseResult> {
  const config = getPolygonConfig();
  const issuer = getIssuerWallet();
  const contract = new ethers.Contract(config.contracts.legalCaseNFT, LegalCaseNFT_ABI, issuer);

  // Build deterministic stateHash from caseRef if not provided
  const stateHashBytes = input.stateHash
    ? ethers.hexlify(ethers.toBeArray(BigInt(input.stateHash)))
    : ethers.keccak256(ethers.toUtf8Bytes(input.metadata.properties.stateHash || input.caseRef));

  // Encode metadata as base64 URI (no external IPFS dependency for inline mints)
  const metaJson = JSON.stringify(input.metadata);
  const tokenURI = `data:application/json;base64,${Buffer.from(metaJson).toString("base64")}`;

  const tx = await contract.mintCase(
    input.to,
    input.caseRef,
    input.caseType,
    input.jurisdiction,
    tokenURI,
    stateHashBytes
  );
  const receipt = await tx.wait();

  // Parse CaseMinted event for tokenId
  const iface = new ethers.Interface(LegalCaseNFT_ABI as unknown as string[]);
  let tokenId = "0";
  for (const log of receipt.logs) {
    try {
      const parsed = iface.parseLog(log);
      if (parsed?.name === "CaseMinted") {
        tokenId = parsed.args[0].toString();
        break;
      }
    } catch {
      // skip non-matching logs
    }
  }

  return {
    tokenId,
    txHash: receipt.hash,
    blockNumber: receipt.blockNumber,
    explorerUrl: getExplorerTxUrl(receipt.hash),
  };
}

/** Get total case NFTs minted */
export async function getTotalCaseNFTs(): Promise<number> {
  const config = getPolygonConfig();
  const provider = getProvider();
  const contract = new ethers.Contract(config.contracts.legalCaseNFT, LegalCaseNFT_ABI, provider);
  const total = await contract.totalCases();
  return Number(total);
}

/** Get tokenId for a case reference */
export async function getCaseTokenId(caseRef: string): Promise<string | null> {
  const config = getPolygonConfig();
  const provider = getProvider();
  const contract = new ethers.Contract(config.contracts.legalCaseNFT, LegalCaseNFT_ABI, provider);
  try {
    const tokenId = await contract.caseRefToTokenId(caseRef);
    return tokenId.toString() === "0" ? null : tokenId.toString();
  } catch {
    return null;
  }
}

// ─── ERC-6551 Vault ───────────────────────────────────────────────────────── //

/** Compute the deterministic vault address for a case NFT (view-only, no tx) */
export async function getVaultAddress(tokenId: string): Promise<string> {
  const config = getPolygonConfig();
  const provider = getProvider();
  const registry = new ethers.Contract(
    config.contracts.erc6551Registry,
    ERC6551Registry_ABI,
    provider
  );

  return registry.account(
    config.contracts.legalCaseAccount,
    ethers.ZeroHash,
    config.chainId,
    config.contracts.legalCaseNFT,
    BigInt(tokenId)
  );
}

/** Create (deploy) the ERC-6551 vault for a case NFT — issuer pays gas */
export async function createVault(tokenId: string): Promise<{ vaultAddress: string; txHash: string }> {
  const config = getPolygonConfig();
  const issuer = getIssuerWallet();
  const registry = new ethers.Contract(
    config.contracts.erc6551Registry,
    ERC6551Registry_ABI,
    issuer
  );

  const tx = await registry.createAccount(
    config.contracts.legalCaseAccount,
    ethers.ZeroHash,
    config.chainId,
    config.contracts.legalCaseNFT,
    BigInt(tokenId)
  );
  const receipt = await tx.wait();
  const vaultAddress = await getVaultAddress(tokenId);

  return { vaultAddress, txHash: receipt.hash };
}

/** Get vault state (balances, evidence/doc counts, escrows) */
export async function getVaultState(tokenId: string): Promise<Partial<CaseVault>> {
  const vaultAddress = await getVaultAddress(tokenId);
  const provider = getProvider();
  const vault = new ethers.Contract(vaultAddress, LegalCaseAccount_ABI, provider);

  // Check if vault is deployed
  const code = await provider.getCode(vaultAddress);
  if (code === "0x") {
    return {
      address: vaultAddress,
      tokenId,
      maticBalance: "0",
      documentHashes: [],
      evidenceAnchors: [],
      escrows: [],
      transactions: [],
      tokenBalances: [],
    } as Partial<CaseVault>;
  }

  const [maticBal, evidenceCount, documentCount] = await Promise.all([
    provider.getBalance(vaultAddress),
    vault.getEvidenceCount().catch(() => BigInt(0)),
    vault.getDocumentCount().catch(() => BigInt(0)),
  ]);

  return {
    address: vaultAddress,
    tokenId,
    maticBalance: ethers.formatEther(maticBal),
    evidenceAnchors: Array.from({ length: Number(evidenceCount) }, (_, i) => i.toString()),
    documentHashes: Array.from({ length: Number(documentCount) }, (_, i) => i.toString()),
    escrows: [],
    transactions: [],
    tokenBalances: [],
  };
}

// ─── Audit Anchoring ──────────────────────────────────────────────────────── //

export interface AnchorBatchInput {
  batchHash: string; // hex bytes32 (0x prefix ok)
  entryCount: number;
}

/** Issuer anchors an audit batch on-chain */
export async function anchorAuditBatch(input: AnchorBatchInput): Promise<AuditAnchor> {
  const config = getPolygonConfig();
  const issuer = getIssuerWallet();
  const contract = new ethers.Contract(config.contracts.auditAnchor, AuditAnchor_ABI, issuer);

  const hashBytes = input.batchHash.startsWith("0x") ? input.batchHash : `0x${input.batchHash}`;
  const tx = await contract.anchor(hashBytes, BigInt(input.entryCount));
  const receipt = await tx.wait();

  const gasUsed = receipt.gasUsed ?? BigInt(0);
  const effectiveGasPrice = receipt.gasPrice ?? BigInt(0);
  const gasCost = ethers.formatEther(gasUsed * effectiveGasPrice);

  return {
    batchHash: input.batchHash,
    entryCount: input.entryCount,
    timestamp: new Date().toISOString(),
    txHash: receipt.hash,
    blockNumber: receipt.blockNumber,
    gasCost,
  };
}

/** Verify a batch hash exists on-chain */
export async function verifyAuditBatch(
  batchHash: string
): Promise<{ exists: boolean; timestamp?: string; blockNumber?: number }> {
  const config = getPolygonConfig();
  const provider = getProvider();
  const contract = new ethers.Contract(config.contracts.auditAnchor, AuditAnchor_ABI, provider);

  const hashBytes = batchHash.startsWith("0x") ? batchHash : `0x${batchHash}`;
  const [exists, timestamp, blockNumber] = await contract.verify(hashBytes);
  return {
    exists,
    timestamp: exists ? new Date(Number(timestamp) * 1000).toISOString() : undefined,
    blockNumber: exists ? Number(blockNumber) : undefined,
  };
}

/** Get total anchors on the contract */
export async function getTotalAnchors(): Promise<number> {
  const config = getPolygonConfig();
  const provider = getProvider();
  const contract = new ethers.Contract(config.contracts.auditAnchor, AuditAnchor_ABI, provider);
  return Number(await contract.totalAnchors());
}

// ─── Document Registry ────────────────────────────────────────────────────── //

export interface RegisterDocumentInput {
  contentHash: string; // hex bytes32
  caseRef: string;
  docType: string;
  ipfsCid: string;
}

/** Register a document hash on-chain */
export async function registerDocument(
  input: RegisterDocumentInput
): Promise<{ docId: string; txHash: string; blockNumber: number }> {
  const config = getPolygonConfig();
  const issuer = getIssuerWallet();
  const contract = new ethers.Contract(
    config.contracts.documentRegistry,
    DocumentRegistry_ABI,
    issuer
  );

  const hashBytes = input.contentHash.startsWith("0x")
    ? input.contentHash
    : `0x${input.contentHash}`;
  const tx = await contract.register(hashBytes, input.caseRef, input.docType, input.ipfsCid);
  const receipt = await tx.wait();

  // Parse DocumentRegistered event for docId
  const iface = new ethers.Interface(DocumentRegistry_ABI as unknown as string[]);
  let docId = "0";
  for (const log of receipt.logs) {
    try {
      const parsed = iface.parseLog(log);
      if (parsed?.name === "DocumentRegistered") {
        docId = parsed.args[0].toString();
        break;
      }
    } catch {
      // skip
    }
  }

  return { docId, txHash: receipt.hash, blockNumber: receipt.blockNumber };
}

/** Verify a document by its content hash */
export async function verifyDocument(contentHash: string): Promise<DocumentVerification> {
  const config = getPolygonConfig();
  const provider = getProvider();
  const contract = new ethers.Contract(
    config.contracts.documentRegistry,
    DocumentRegistry_ABI,
    provider
  );

  const hashBytes = contentHash.startsWith("0x") ? contentHash : `0x${contentHash}`;
  const [exists, , , , timestamp, blockNumber] = await contract.verify(hashBytes);
  return {
    documentId: contentHash,
    contentHash,
    verified: exists,
    onChainTimestamp: exists ? new Date(Number(timestamp) * 1000).toISOString() : undefined,
    blockNumber: exists ? Number(blockNumber) : undefined,
  };
}

/** Get total documents registered */
export async function getTotalDocuments(): Promise<number> {
  const config = getPolygonConfig();
  const provider = getProvider();
  const contract = new ethers.Contract(
    config.contracts.documentRegistry,
    DocumentRegistry_ABI,
    provider
  );
  return Number(await contract.totalDocuments());
}

// ─── Legal Namespace ──────────────────────────────────────────────────────── //

/** Check namespace availability — view only, no gas */
export async function checkNamespaceAvailability(
  name: string,
  tld: string
): Promise<NamespaceAvailability> {
  const config = getPolygonConfig();
  const provider = getProvider();
  const contract = new ethers.Contract(
    config.contracts.legalNameRegistry,
    LegalNameRegistry_ABI,
    provider
  );

  const available = await contract.isAvailable(name.toLowerCase(), tld.toLowerCase());

  if (!available) {
    const [exists, owner, , expiry] = await contract.resolve(
      `${name.toLowerCase()}.${tld.toLowerCase()}`
    );
    return {
      name: name.toLowerCase(),
      tld: tld.toLowerCase() as "law" | "legal",
      fullName: `${name.toLowerCase()}.${tld.toLowerCase()}`,
      available: false,
      currentOwner: exists ? owner : undefined,
      expiry: exists ? new Date(Number(expiry) * 1000).toISOString() : undefined,
    };
  }

  return {
    name: name.toLowerCase(),
    tld: tld.toLowerCase() as "law" | "legal",
    fullName: `${name.toLowerCase()}.${tld.toLowerCase()}`,
    available: true,
  };
}

/** Get total registered names */
export async function getTotalNamespaces(): Promise<number> {
  const config = getPolygonConfig();
  const provider = getProvider();
  const contract = new ethers.Contract(
    config.contracts.legalNameRegistry,
    LegalNameRegistry_ABI,
    provider
  );
  return Number(await contract.totalNames());
}

/** Get registration fee in MATIC */
export async function getRegistrationFee(): Promise<string> {
  const config = getPolygonConfig();
  const provider = getProvider();
  const contract = new ethers.Contract(
    config.contracts.legalNameRegistry,
    LegalNameRegistry_ABI,
    provider
  );
  const fee = await contract.registrationFee();
  return ethers.formatEther(fee);
}

/** Resolve a namespace to owner + metadata */
export async function resolveNamespace(fullName: string): Promise<LegalNamespace | null> {
  const config = getPolygonConfig();
  const provider = getProvider();
  const contract = new ethers.Contract(
    config.contracts.legalNameRegistry,
    LegalNameRegistry_ABI,
    provider
  );

  const [exists, owner, resolution, expiry, tokenId] = await contract.resolve(fullName);
  if (!exists) return null;

  const [name, tld] = fullName.split(".");
  return {
    fullName,
    name,
    tld: tld as "law" | "legal",
    tokenId: tokenId.toString(),
    owner,
    resolution,
    expiry: new Date(Number(expiry) * 1000).toISOString(),
    tokenURI: "",
    mintTxHash: "",
    mintedAt: "",
  };
}

/** Server-side: Issuer registers a namespace (for internal provisioning) */
export async function issuerRegisterNamespace(
  name: string,
  tld: string,
  ownerAddress: string,
  resolution: string = "{}"
): Promise<{ tokenId: string; txHash: string; blockNumber: number }> {
  const config = getPolygonConfig();
  const issuer = getIssuerWallet();
  const contract = new ethers.Contract(
    config.contracts.legalNameRegistry,
    LegalNameRegistry_ABI,
    issuer
  );

  const metadata: NamespaceMetadata = {
    name,
    description: `${name}.${tld} — UNYKORN LAW legal namespace on Polygon`,
    image: `https://unykorn.law/api/og/namespace/${name}.${tld}`,
    external_url: `https://unykorn.law/portal/${name}`,
    attributes: [
      { trait_type: "TLD", value: tld },
      { trait_type: "Platform", value: "UNYKORN LAW" },
      { trait_type: "Chain", value: "Polygon" },
    ],
    properties: {
      name,
      tld,
      fullName: `${name}.${tld}`,
      registeredAt: new Date().toISOString(),
      expiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000 * 2).toISOString(), // 2 years
      resolution,
    },
  };

  const tokenURI = `data:application/json;base64,${Buffer.from(JSON.stringify(metadata)).toString("base64")}`;

  // Get registration fee
  const fee = await contract.registrationFee();
  const tx = await contract.registerName(name.toLowerCase(), tld.toLowerCase(), tokenURI, resolution, {
    value: fee,
  });
  const receipt = await tx.wait();

  const iface = new ethers.Interface(LegalNameRegistry_ABI as unknown as string[]);
  let tokenId = "0";
  for (const log of receipt.logs) {
    try {
      const parsed = iface.parseLog(log);
      if (parsed?.name === "NameRegistered") {
        tokenId = parsed.args[0].toString();
        break;
      }
    } catch {
      // skip
    }
  }

  return { tokenId, txHash: receipt.hash, blockNumber: receipt.blockNumber };
}
