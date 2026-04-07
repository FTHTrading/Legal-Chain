import { NextResponse } from "next/server";
import { AGENT_NETWORK } from "@/lib/data/seed";
import { runtimeStatus, initRuntime } from "@/lib/agents/runtime";

// GET /api/agents — agent network + runtime status
export async function GET() {
  initRuntime();
  const runtime = runtimeStatus();

  return NextResponse.json({
    network: AGENT_NETWORK,
    runtime,
    timestamp: new Date().toISOString(),
  });
}
