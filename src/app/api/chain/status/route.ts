/**
 * Chain Status — Live Substrate chain health and stats
 * 
 * GET /api/chain/status → chain health, block height, entity counts
 */

import { NextResponse } from "next/server";
import { getChainHealth, getChainStats } from "@/lib/chain-sdk";
import { DEMO_STATS } from "@/lib/chain-demo-data";

export const dynamic = "force-dynamic";

export async function GET() {
  const [health, stats] = await Promise.all([
    getChainHealth(),
    getChainStats(),
  ]);

  return NextResponse.json({
    chain: {
      status: health.explorerOnline ? "online" : "offline",
      explorer: health.explorerOnline,
      proof_service: health.proofOnline,
      rpc: health.substrate,
    },
    stats: stats ?? DEMO_STATS,
    timestamp: new Date().toISOString(),
  });
}
