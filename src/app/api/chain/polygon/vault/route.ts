/**
 * /api/chain/polygon/vault
 *
 * GET  ?tokenId=1              — get vault state for a case NFT
 * GET  ?tokenId=1&address=true — just get vault address (no contract call)
 * POST { tokenId }             — deploy vault (ERC-6551 createAccount, issuer pays gas)
 */

import { NextRequest, NextResponse } from "next/server";
import { getVaultAddress, createVault, getVaultState } from "@/lib/polygon/ops";
import { getExplorerAddressUrl, getExplorerTxUrl } from "@/lib/polygon/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const tokenId = searchParams.get("tokenId");
  const addressOnly = searchParams.get("address") === "true";

  if (!tokenId) {
    return NextResponse.json({ ok: false, error: "tokenId required" }, { status: 400 });
  }

  try {
    const vaultAddress = await getVaultAddress(tokenId);

    if (addressOnly) {
      return NextResponse.json({
        ok: true,
        data: {
          tokenId,
          vaultAddress,
          explorerUrl: getExplorerAddressUrl(vaultAddress),
        },
      });
    }

    const state = await getVaultState(tokenId);
    return NextResponse.json({
      ok: true,
      data: {
        ...state,
        explorerUrl: getExplorerAddressUrl(vaultAddress),
      },
    });
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
    const { tokenId } = body as { tokenId?: string };

    if (!tokenId) {
      return NextResponse.json({ ok: false, error: "tokenId required" }, { status: 400 });
    }

    const result = await createVault(tokenId);
    return NextResponse.json({
      ok: true,
      data: result,
      txHash: result.txHash,
      explorerUrl: getExplorerTxUrl(result.txHash),
      vaultExplorerUrl: getExplorerAddressUrl(result.vaultAddress),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
