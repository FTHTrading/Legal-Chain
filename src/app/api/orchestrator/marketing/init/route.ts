import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/rbac";
import {
  initMarketDefinitions,
  getWidgetInventory,
  getAgentRoster,
} from "@/lib/marketing/orchestrator";

// POST /api/orchestrator/marketing/init
// Initialize all marketing agents and seed market definitions for each widget app.
export async function POST() {
  await requirePermission("marketing:manage");

  const marketResults = await initMarketDefinitions();
  const agents = getAgentRoster();
  const apps = getWidgetInventory();

  return NextResponse.json({
    ok: true,
    widgetApps: apps.length,
    agentsOnline: agents.length,
    marketDefinitions: marketResults,
    agents,
    timestamp: new Date().toISOString(),
  });
}
