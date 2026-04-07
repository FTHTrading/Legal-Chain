import { NextResponse } from "next/server";
import { SEED_FORENSIC_TRON } from "@/lib/data/seed-platform";

// GET /api/evidence — list evidence items across matters
export async function GET() {
  return NextResponse.json({
    evidence: {
      forensic: {
        id: SEED_FORENSIC_TRON.id,
        chains: SEED_FORENSIC_TRON.chains,
        totalTraced: "$36,150",
        suspectWallets: SEED_FORENSIC_TRON.wallets?.length || 0,
        status: "active",
      },
    },
    total: 1,
    endpoint: "/api/matters/[id]/evidence",
  });
}
