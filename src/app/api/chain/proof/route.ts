/**
 * Chain Proof — Retrieve and verify Merkle state proofs from the Substrate chain
 * 
 * GET /api/chain/proof?key=STORAGE_KEY&block=BLOCK_HASH
 */

import { NextRequest, NextResponse } from "next/server";
import { getProof, verifyProof } from "@/lib/chain-sdk";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("key");
  const block = req.nextUrl.searchParams.get("block") || undefined;

  if (!key) {
    return NextResponse.json(
      { error: "Missing required parameter: key (storage key)" },
      { status: 400 }
    );
  }

  const proof = await getProof(key, block);

  if (!proof) {
    return NextResponse.json(
      {
        error: "Proof not found or proof service offline",
        key,
        block: block || "latest",
        hint: "Ensure the Substrate node and proof service are running",
      },
      { status: 404 }
    );
  }

  // Auto-verify
  const verification = await verifyProof(proof);

  return NextResponse.json({
    proof,
    verification: verification ?? { valid: false, details: "Verification service unavailable" },
    timestamp: new Date().toISOString(),
  });
}
