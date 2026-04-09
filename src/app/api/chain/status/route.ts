/**
 * Chain Status — Live Substrate chain health and stats
 * 
 * GET /api/chain/status → chain health, block height, entity counts
 */

import { NextResponse } from "next/server";
import { getChainHealth, getChainStats } from "@/lib/chain-sdk";

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
    stats: stats ?? {
      latest_block: 0,
      total_matters: 0,
      total_evidence: 0,
      total_documents: 0,
      total_approvals: 0,
      total_identities: 0,
      total_audit_entries: 0,
      chain_healthy: false,
    },
    timestamp: new Date().toISOString(),
  });
}
