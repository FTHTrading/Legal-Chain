/**
 * GET /api/chain/polygon/status
 *
 * Returns live Polygon network status, contract deployment health,
 * and aggregate stats for the chain dashboard.
 */

import { NextResponse } from "next/server";
import {
  getPolygonConfig,
  getContractStatuses,
  getIssuerBalance,
  getDeployerBalance,
  getCurrentBlock,
  getGasPrice,
} from "@/lib/polygon/client";
import {
  getTotalAnchors,
  getTotalDocuments,
  getTotalCaseNFTs,
  getTotalNamespaces,
} from "@/lib/polygon/ops";
import { POLYGON_NETWORKS } from "@/lib/polygon/types";
import type { ChainStats } from "@/lib/polygon/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const config = getPolygonConfig();
    const explorerUrl = POLYGON_NETWORKS[config.network].explorer;

    // Fan out all reads in parallel
    const [contracts, issuerBalance, deployerBalance, currentBlock, gasPrice, ...counts] =
      await Promise.allSettled([
        getContractStatuses(),
        getIssuerBalance(),
        getDeployerBalance(),
        getCurrentBlock(),
        getGasPrice(),
        getTotalAnchors(),
        getTotalDocuments(),
        getTotalCaseNFTs(),
        getTotalNamespaces(),
      ]);

    const connected = currentBlock.status === "fulfilled";

    const stats: ChainStats = {
      network: config.network,
      explorerUrl,
      deployerAddress: config.deployerAddress || "",
      deployerBalance: deployerBalance.status === "fulfilled" ? deployerBalance.value : "0",
      issuerAddress: process.env.POLYGON_ISSUER_ADDRESS || "",
      issuerBalance: issuerBalance.status === "fulfilled" ? issuerBalance.value : "0",
      contracts: contracts.status === "fulfilled" ? contracts.value : [],
      totalAnchors: counts[0].status === "fulfilled" ? (counts[0].value as number) : 0,
      totalDocumentHashes: counts[1].status === "fulfilled" ? (counts[1].value as number) : 0,
      totalCaseNFTs: counts[2].status === "fulfilled" ? (counts[2].value as number) : 0,
      totalVaults: 0, // derived from NFTs — not separately counted on-chain
      totalNamespaces: counts[3].status === "fulfilled" ? (counts[3].value as number) : 0,
      activeEscrows: 0,
      totalEscrowValue: "0",
      totalGasSpent: "0",
      connected,
    };

    return NextResponse.json({
      ok: true,
      data: stats,
      meta: {
        blockNumber: currentBlock.status === "fulfilled" ? currentBlock.value : null,
        gasPrice: gasPrice.status === "fulfilled" ? gasPrice.value : null,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
