/**
 * POST /api/chain/polygon/mint
 *
 * Server-side case NFT minting. Issuer wallet signs and pays gas.
 * Body: { caseRef, caseType, jurisdiction, clientName, owner?, facts?, documents?, stateHash? }
 */

import { NextRequest, NextResponse } from "next/server";
import { mintCaseNFT, createVault, getCaseTokenId, getVaultAddress } from "@/lib/polygon/ops";
import type { CaseNFTMetadata } from "@/lib/polygon/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    // Require admin API key for server-side minting
    const authHeader = req.headers.get("authorization");
    if (!authHeader || authHeader !== `Bearer ${process.env.ADMIN_API_KEY}`) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      caseRef,
      caseType = "ADVISORY",
      jurisdiction = "United States",
      clientName = "Client",
      owner,
      facts = 0,
      documents = 0,
      stateHash,
      withVault = false,
    } = body as {
      caseRef?: string;
      caseType?: string;
      jurisdiction?: string;
      clientName?: string;
      owner?: string;
      facts?: number;
      documents?: number;
      stateHash?: string;
      withVault?: boolean;
    };

    if (!caseRef) {
      return NextResponse.json({ ok: false, error: "caseRef required" }, { status: 400 });
    }

    // Check if already minted
    const existing = await getCaseTokenId(caseRef);
    if (existing) {
      const vaultAddr = withVault ? await getVaultAddress(existing) : undefined;
      return NextResponse.json({
        ok: true,
        data: {
          tokenId: existing,
          alreadyMinted: true,
          vaultAddress: vaultAddr,
        },
      });
    }

    const issuerAddress = process.env.POLYGON_ISSUER_ADDRESS || "";
    const recipientAddress = owner || issuerAddress;

    const metadata: CaseNFTMetadata = {
      name: `${caseRef} — UNYKORN LAW`,
      description: `On-chain legal matter NFT for case ${caseRef}. Issued by UNYKORN LAW on Polygon.`,
      image: `https://unykorn.law/api/og/case/${caseRef}`,
      external_url: `https://unykorn.law/law/matters`,
      attributes: [
        { trait_type: "Case Reference", value: caseRef },
        { trait_type: "Case Type", value: caseType },
        { trait_type: "Jurisdiction", value: jurisdiction },
        { trait_type: "Platform", value: "UNYKORN LAW" },
        { trait_type: "Chain", value: "Polygon" },
      ],
      properties: {
        caseRef,
        caseType,
        jurisdiction,
        clientName,
        createdAt: new Date().toISOString(),
        factCount: facts,
        documentCount: documents,
        stateHash: stateHash || "",
      },
    };

    const mintResult = await mintCaseNFT({
      to: recipientAddress,
      caseRef,
      caseType,
      jurisdiction,
      metadata,
      stateHash,
    });

    let vaultResult: { vaultAddress: string; txHash?: string } | undefined;
    if (withVault) {
      vaultResult = await createVault(mintResult.tokenId);
    }

    return NextResponse.json({
      ok: true,
      data: {
        ...mintResult,
        vaultAddress: vaultResult?.vaultAddress,
        vaultTxHash: vaultResult?.txHash,
      },
      txHash: mintResult.txHash,
      blockNumber: mintResult.blockNumber,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

/**
 * GET /api/chain/polygon/mint?caseRef=UNY-ADV-2026-001
 * Look up an existing case NFT token ID
 */
export async function GET(req: NextRequest) {
  const caseRef = req.nextUrl.searchParams.get("caseRef");
  if (!caseRef) {
    return NextResponse.json({ ok: false, error: "caseRef required" }, { status: 400 });
  }
  try {
    const tokenId = await getCaseTokenId(caseRef);
    if (!tokenId) {
      return NextResponse.json({ ok: false, error: "Case NFT not found", tokenId: null });
    }
    const vaultAddress = await getVaultAddress(tokenId);
    return NextResponse.json({ ok: true, data: { tokenId, vaultAddress } });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
