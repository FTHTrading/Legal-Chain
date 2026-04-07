import { NextResponse } from "next/server";
import { AGENT_NETWORK } from "@/lib/data/seed";

// GET /api/agents — agent network status
export async function GET() {
  return NextResponse.json({
    network: AGENT_NETWORK,
    timestamp: new Date().toISOString(),
  });
}
