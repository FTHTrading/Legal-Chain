/**
 * /api/chain/polygon/anchor
 *
 * POST { batchHash, entryCount } ΓÇö anchor an audit batch (requires admin key)
 * GET  ?hash=0x...             ΓÇö verify a batch hash exists on-chain
 * GET                          ΓÇö get total anchors count
 */

import { NextRequest, NextResponse } from "next/server";
import { anchorAuditBatch, verifyAuditBatch, getTotalAnchors } from "@/lib/polygon/ops";
import { getExplorerTxUrl } from "@/lib/polygon/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const hash = req.nextUrl.searchParams.get("hash");

  try {
    if (hash) {
      const result = await verifyAuditBatch(hash);
      return NextResponse.json({ ok: true, data: result });
    }

    const total = await getTotalAnchors();
    return NextResponse.json({ ok: true, data: { totalAnchors: total } });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || authHeader !== `Bearer ${process.env.ADMIN_API_KEY}`) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { batchHash, entryCount } = body as { batchHash?: string; entryCount?: number };

    if (!batchHash) {
      return NextResponse.json({ ok: false, error: "batchHash required" }, { status: 400 });
    }
    if (!entryCount || entryCount < 1) {
      return NextResponse.json({ ok: false, error: "entryCount must be >= 1" }, { status: 400 });
    }

    const anchor = await anchorAuditBatch({ batchHash, entryCount });

    return NextResponse.json({
      ok: true,
      data: anchor,
      txHash: anchor.txHash,
      blockNumber: anchor.blockNumber,
      explorerUrl: getExplorerTxUrl(anchor.txHash),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}