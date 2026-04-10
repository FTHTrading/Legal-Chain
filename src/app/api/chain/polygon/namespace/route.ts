/**
 * Polygon Namespace API
 *
 * GET /api/chain/polygon/namespace?name=acme&tld=law
 *   → { available: bool, owner?, expiresAt?, resolves? }
 *
 * GET /api/chain/polygon/namespace?wallet=0x…
 *   → { names: NamespaceMetadata[] }
 */

import { NextRequest, NextResponse } from "next/server";
import { ethers } from "ethers";
import { getProvider, getPolygonConfig } from "@/lib/polygon/client";
import { POLYGON_NETWORKS } from "@/lib/polygon/types";
import { LegalNameRegistry_ABI } from "@/lib/polygon/abis";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const name   = searchParams.get("name");
  const tld    = searchParams.get("tld") ?? "law";
  const wallet = searchParams.get("wallet");

  const registryAddress = process.env.NEXT_PUBLIC_LEGAL_NAME_REGISTRY_ADDRESS;

  if (!registryAddress) {
    return NextResponse.json({ error: "Contract not deployed yet" }, { status: 503 });
  }

  try {
    const provider = getProvider();
    const registry = new ethers.Contract(registryAddress, LegalNameRegistry_ABI, provider);

    // Single name lookup
    if (name) {
      const fullName = `${name}.${tld}`;
      const [available, resolution]: [boolean, string] = await Promise.all([
        registry.isAvailable(name, tld),
        registry.resolve(fullName).catch(() => ""),
      ]);

      if (available) {
        return NextResponse.json({ available: true, fullName });
      }

      // Get token metadata if taken
      const config   = getPolygonConfig();
      const netInfo  = POLYGON_NETWORKS[config.network];
      const tokenId: bigint = await registry.nameToTokenId(fullName).catch(() => BigInt(0));
      const owner: string   = tokenId ? await registry.ownerOf(tokenId).catch(() => "") : "";
      const expiry: bigint  = tokenId ? await registry.nameExpiry(fullName).catch(() => BigInt(0)) : BigInt(0);

      return NextResponse.json({
        available:  false,
        fullName,
        owner,
        expiresAt:  expiry ? new Date(Number(expiry) * 1000).toISOString() : null,
        resolves:   resolution || null,
        explorerUrl: owner ? `${netInfo.explorer}/address/${owner}` : null,
      });
    }

    // Wallet-owned names (enumerate Transfer events)
    if (wallet) {
      const filter = registry.filters.Transfer(null, wallet, null);
      const events = await registry.queryFilter(filter, -100000);
      const tokenIds = [...new Set(events.map((e) => (e as ethers.EventLog).args?.[2] as bigint))];

      const names: object[] = [];
      for (const tokenId of tokenIds) {
        try {
          const currentOwner: string = await registry.ownerOf(tokenId);
          if (currentOwner.toLowerCase() !== wallet.toLowerCase()) continue;
          const uri: string = await registry.tokenURI(tokenId);
          names.push({ tokenId: tokenId.toString(), uri });
        } catch {
          // burned or transferred
        }
      }

      return NextResponse.json({ wallet, names });
    }

    return NextResponse.json({ error: "Provide ?name= or ?wallet=" }, { status: 400 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
