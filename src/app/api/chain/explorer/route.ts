/**
 * Chain Explorer API — proxy to the Substrate explorer service
 * 
 * GET /api/chain/explorer?tab=blocks|matters|evidence|documents|approvals|identities|audit
 */

import { NextResponse } from "next/server";
import {
  getLatestBlocks,
  getMatters,
  getEvidence,
  getDocuments,
  getApprovals,
  getIdentities,
  getAuditLog,
  isChainOnline,
} from "@/lib/chain-sdk";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const tab = searchParams.get("tab") || "blocks";
  const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 200);

  const online = await isChainOnline();
  if (!online) {
    return NextResponse.json(
      { error: "Chain explorer offline", online: false, data: [] },
      { status: 503 }
    );
  }

  let data: unknown[] = [];

  switch (tab) {
    case "blocks":
      data = await getLatestBlocks(limit);
      break;
    case "matters":
      data = await getMatters(limit);
      break;
    case "evidence":
      data = await getEvidence(undefined, limit);
      break;
    case "documents":
      data = await getDocuments(undefined, limit);
      break;
    case "approvals":
      data = await getApprovals(limit);
      break;
    case "identities":
      data = await getIdentities(limit);
      break;
    case "audit":
      data = await getAuditLog(limit);
      break;
    default:
      return NextResponse.json({ error: `Unknown tab: ${tab}` }, { status: 400 });
  }

  return NextResponse.json({ online: true, tab, count: data.length, data });
}
