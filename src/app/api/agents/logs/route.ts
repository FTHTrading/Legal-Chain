import { NextResponse } from "next/server";
import { getActionLog } from "@/lib/agents/runtime";

// GET /api/agents/logs — Agent action log
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const agentId = searchParams.get("agentId") || undefined;
  const matterId = searchParams.get("matterId") || undefined;
  const escalatedOnly = searchParams.get("escalated") === "true";
  const limit = parseInt(searchParams.get("limit") || "50", 10);

  const logs = getActionLog({ agentId, matterId, escalatedOnly, limit });

  return NextResponse.json({
    count: logs.length,
    logs,
    timestamp: new Date().toISOString(),
  });
}
