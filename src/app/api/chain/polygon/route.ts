/**
 * Polygon Chain Status — contract deployments, balances, IPFS health
 *
 * GET /api/chain/polygon
 */

import { NextResponse } from "next/server";
import { getContractStatuses, getDeployerBalance, getAddressBalance, getCurrentBlock, getGasPrice, getPolygonConfig } from "@/lib/polygon/client";
import { POLYGON_NETWORKS } from "@/lib/polygon/types";
import { isIPFSOnline, getIPFSId, getRepoStats } from "@/lib/polygon/ipfs";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const config  = getPolygonConfig();
    const netInfo = POLYGON_NETWORKS[config.network];

    const [contractStatuses, deployerBalance, issuerBalance, block, gasPrice, ipfsOnline] =
      await Promise.allSettled([
        getContractStatuses(),
        getDeployerBalance(),
        getAddressBalance(process.env.POLYGON_ISSUER_ADDRESS ?? ""),
        getCurrentBlock(),
        getGasPrice(),
        isIPFSOnline(),
      ]);

    const ipfsUp = ipfsOnline.status === "fulfilled" && ipfsOnline.value;

    const ipfsDetails = ipfsUp
      ? await Promise.allSettled([getIPFSId(), getRepoStats()])
      : null;

    return NextResponse.json({
      network: {
        name:     config.network,
        chainId:  netInfo.chainId,
        rpc:      netInfo.rpcUrl,
        explorer: netInfo.explorer,
      },
      block:    block.status === "fulfilled"    ? block.value    : null,
      gasPrice: gasPrice.status === "fulfilled" ? gasPrice.value : null,
      wallets: {
        deployer: {
          address: process.env.POLYGON_DEPLOYER_ADDRESS ?? "",
          balance: deployerBalance.status === "fulfilled" ? deployerBalance.value : "0.0",
        },
        issuer: {
          address: process.env.POLYGON_ISSUER_ADDRESS ?? "",
          balance: issuerBalance.status === "fulfilled"  ? issuerBalance.value  : "0.0",
        },
      },
      contracts: contractStatuses.status === "fulfilled" ? contractStatuses.value : {},
      ipfs: {
        online: ipfsUp,
        id:     ipfsDetails?.[0].status === "fulfilled" ? ipfsDetails[0].value : null,
        repo:   ipfsDetails?.[1].status === "fulfilled" ? ipfsDetails[1].value : null,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
