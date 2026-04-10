import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { MARKETING_CONSTANTS } from "@/lib/marketing/config";

// POST /api/orchestrator/marketing/followup
// Trigger follow-up actions: score stale leads, auto-qualify, flag campaigns.
export async function POST(req: NextRequest) {
  await requirePermission("marketing:manage");

  const body = await req.json();
  const { action } = body as {
    action: "score_stale_leads" | "auto_qualify" | "flag_zero_conversion";
  };

  if (!action) {
    return NextResponse.json({ error: "action is required" }, { status: 400 });
  }

  const now = new Date();

  if (action === "score_stale_leads") {
    const staleDate = new Date(now.getTime() - MARKETING_CONSTANTS.staleDays * 86_400_000);
    const result = await db.leadRecord.updateMany({
      where: {
        status: { in: ["new", "contacted"] },
        lastTouchAt: { lt: staleDate },
      },
      data: { status: "stale" },
    });
    return NextResponse.json({ ok: true, action, leadsMarkedStale: result.count });
  }

  if (action === "auto_qualify") {
    const result = await db.leadRecord.updateMany({
      where: {
        status: "new",
        score: { gte: MARKETING_CONSTANTS.autoQualifyScore },
      },
      data: { status: "qualified" },
    });
    return NextResponse.json({ ok: true, action, leadsAutoQualified: result.count });
  }

  if (action === "flag_zero_conversion") {
    // Find active campaigns with zero conversions and non-zero spend
    const campaigns = await db.campaign.findMany({
      where: {
        status: "active",
        conversions: 0,
        spentCents: { gt: 0 },
      },
      select: { id: true, name: true, spentCents: true, launchedAt: true },
    });

    return NextResponse.json({
      ok: true,
      action,
      flaggedCampaigns: campaigns,
      count: campaigns.length,
    });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
