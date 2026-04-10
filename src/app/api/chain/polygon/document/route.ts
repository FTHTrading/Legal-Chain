/**
 * /api/chain/polygon/document
 *
 * POST { contentHash, caseRef, docType, ipfsCid } — register document hash on-chain
 * GET  ?hash=0x...                                — verify a document hash
 * GET  ?caseRef=UNY-ADV-2026-001                  — count docs for a case
 */

import { NextRequest, NextResponse } from "next/server";
import { registerDocument, verifyDocument, getTotalDocuments } from "@/lib/polygon/ops";
import { getExplorerTxUrl, getPolygonConfig } from "@/lib/polygon/client";
import { ethers } from "ethers";
import { DocumentRegistry_ABI } from "@/lib/polygon/abis";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const hash = searchParams.get("hash");
  const caseRef = searchParams.get("caseRef");

  try {
    if (hash) {
      const result = await verifyDocument(hash);
      return NextResponse.json({ ok: true, data: result });
    }

    if (caseRef) {
      const config = getPolygonConfig();
      const { getProvider } = await import("@/lib/polygon/client");
      const provider = getProvider();
      const contract = new ethers.Contract(
        config.contracts.documentRegistry,
        DocumentRegistry_ABI,
        provider
      );
      const count = await contract.getCaseDocumentCount(caseRef);
      return NextResponse.json({ ok: true, data: { caseRef, documentCount: Number(count) } });
    }

    const total = await getTotalDocuments();
    return NextResponse.json({ ok: true, data: { totalDocuments: total } });
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
    const { contentHash, caseRef, docType, ipfsCid } = body as {
      contentHash?: string;
      caseRef?: string;
      docType?: string;
      ipfsCid?: string;
    };

    if (!contentHash || !caseRef || !docType) {
      return NextResponse.json(
        { ok: false, error: "contentHash, caseRef, and docType are required" },
        { status: 400 }
      );
    }

    const result = await registerDocument({
      contentHash,
      caseRef,
      docType,
      ipfsCid: ipfsCid || "",
    });

    return NextResponse.json({
      ok: true,
      data: result,
      txHash: result.txHash,
      blockNumber: result.blockNumber,
      explorerUrl: getExplorerTxUrl(result.txHash),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
