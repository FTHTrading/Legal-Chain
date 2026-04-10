/**
 * GET /api/chain/polygon/events
 *
 * Returns recent on-chain events from all Legal-Chain contracts.
 * Queries the last N blocks for AuditAnchored, DocumentRegistered,
 * CaseMinted, NameRegistered events.
 *
 * ?limit=20      — number of events to return (default 20, max 100)
 * ?type=anchor   — filter by event type
 * ?blocks=1000   — how many blocks back to scan (default 500)
 */

import { NextRequest, NextResponse } from "next/server";
import { ethers } from "ethers";
import { getProvider, getPolygonConfig } from "@/lib/polygon/client";
import {
  AuditAnchor_ABI,
  DocumentRegistry_ABI,
  LegalCaseNFT_ABI,
  LegalNameRegistry_ABI,
} from "@/lib/polygon/abis";
import type { ChainEvent } from "@/lib/polygon/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);
  const typeFilter = searchParams.get("type");
  const blocksBack = Math.min(parseInt(searchParams.get("blocks") || "500"), 5000);

  try {
    const provider = getProvider();
    const config = getPolygonConfig();
    const currentBlock = await provider.getBlockNumber();
    const fromBlock = Math.max(0, currentBlock - blocksBack);

    const events: ChainEvent[] = [];

    // Query all contracts in parallel
    const [anchorLogs, documentLogs, nftLogs, namespaceLogs] = await Promise.allSettled([
      provider.getLogs({
        address: config.contracts.auditAnchor,
        topics: [ethers.id("AuditAnchored(uint256,bytes32,uint256,uint256,uint256)")],
        fromBlock,
        toBlock: currentBlock,
      }),
      provider.getLogs({
        address: config.contracts.documentRegistry,
        topics: [ethers.id("DocumentRegistered(uint256,bytes32,string,string,string,uint256)")],
        fromBlock,
        toBlock: currentBlock,
      }),
      provider.getLogs({
        address: config.contracts.legalCaseNFT,
        topics: [ethers.id("CaseMinted(uint256,string,string,string,address,uint256)")],
        fromBlock,
        toBlock: currentBlock,
      }),
      provider.getLogs({
        address: config.contracts.legalNameRegistry,
        topics: [ethers.id("NameRegistered(uint256,string,string,string,address,uint256,uint256)")],
        fromBlock,
        toBlock: currentBlock,
      }),
    ]);

    // Parse AuditAnchored events
    if (anchorLogs.status === "fulfilled") {
      const iface = new ethers.Interface(AuditAnchor_ABI as unknown as string[]);
      for (const log of anchorLogs.value) {
        try {
          const parsed = iface.parseLog(log);
          if (!parsed) continue;
          const [anchorId, batchHash, entryCount] = parsed.args;
          events.push({
            id: `anchor-${log.transactionHash}-${log.index}`,
            type: "anchor",
            txHash: log.transactionHash,
            blockNumber: log.blockNumber,
            timestamp: new Date().toISOString(),
            details: {
              anchorId: anchorId.toString(),
              batchHash,
              entryCount: entryCount.toString(),
            },
          });
        } catch {
          // skip unparseable logs
        }
      }
    }

    // Parse DocumentRegistered events
    if (documentLogs.status === "fulfilled") {
      const iface = new ethers.Interface(DocumentRegistry_ABI as unknown as string[]);
      for (const log of documentLogs.value) {
        try {
          const parsed = iface.parseLog(log);
          if (!parsed) continue;
          const [docId, , caseRef, docType] = parsed.args;
          events.push({
            id: `doc-${log.transactionHash}-${log.index}`,
            type: "document_hash",
            txHash: log.transactionHash,
            blockNumber: log.blockNumber,
            timestamp: new Date().toISOString(),
            details: {
              docId: docId.toString(),
              caseRef,
              docType,
            },
          });
        } catch {
          // skip
        }
      }
    }

    // Parse CaseMinted events
    if (nftLogs.status === "fulfilled") {
      const iface = new ethers.Interface(LegalCaseNFT_ABI as unknown as string[]);
      for (const log of nftLogs.value) {
        try {
          const parsed = iface.parseLog(log);
          if (!parsed) continue;
          const [tokenId, caseRef, caseType, jurisdiction, owner] = parsed.args;
          events.push({
            id: `nft-${log.transactionHash}-${log.index}`,
            type: "nft_mint",
            txHash: log.transactionHash,
            blockNumber: log.blockNumber,
            timestamp: new Date().toISOString(),
            details: {
              tokenId: tokenId.toString(),
              caseRef,
              caseType,
              jurisdiction,
              owner,
            },
          });
        } catch {
          // skip
        }
      }
    }

    // Parse NameRegistered events
    if (namespaceLogs.status === "fulfilled") {
      const iface = new ethers.Interface(LegalNameRegistry_ABI as unknown as string[]);
      for (const log of namespaceLogs.value) {
        try {
          const parsed = iface.parseLog(log);
          if (!parsed) continue;
          const [tokenId, , name, fullName, owner] = parsed.args;
          events.push({
            id: `ns-${log.transactionHash}-${log.index}`,
            type: "namespace_registered",
            txHash: log.transactionHash,
            blockNumber: log.blockNumber,
            timestamp: new Date().toISOString(),
            details: {
              tokenId: tokenId.toString(),
              name,
              fullName,
              owner,
            },
          });
        } catch {
          // skip
        }
      }
    }

    // Sort by block number descending, filter, limit
    const sorted = events
      .sort((a, b) => b.blockNumber - a.blockNumber)
      .filter((e) => !typeFilter || e.type === typeFilter)
      .slice(0, limit);

    return NextResponse.json({
      ok: true,
      data: sorted,
      meta: {
        total: sorted.length,
        fromBlock,
        toBlock: currentBlock,
        blocksScanned: currentBlock - fromBlock,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
