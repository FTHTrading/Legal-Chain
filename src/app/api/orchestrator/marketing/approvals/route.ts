import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/rbac";
import { db } from "@/lib/db";

// POST /api/orchestrator/marketing/approvals
// Approve or reject a marketing asset or campaign.
export async function POST(req: NextRequest) {
  await requirePermission("marketing:approve");

  const body = await req.json();
  const { targetType, targetId, action, reviewerId, reason } = body as {
    targetType: "campaign" | "asset";
    targetId: string;
    action: "approve" | "reject" | "kill";
    reviewerId: string;
    reason?: string;
  };

  if (!targetType || !targetId || !action || !reviewerId) {
    return NextResponse.json({ error: "targetType, targetId, action, and reviewerId are required" }, { status: 400 });
  }

  const now = new Date();

  if (targetType === "campaign") {
    const campaign = await db.campaign.findUnique({ where: { id: targetId } });
    if (!campaign) return NextResponse.json({ error: "Campaign not found" }, { status: 404 });

    if (action === "approve") {
      await db.campaign.update({
        where: { id: targetId },
        data: { status: "approved", approvedById: reviewerId, approvedAt: now },
      });
    } else if (action === "reject") {
      await db.campaign.update({
        where: { id: targetId },
        data: { status: "draft", notes: reason ?? undefined },
      });
    } else if (action === "kill") {
      await db.campaign.update({
        where: { id: targetId },
        data: { status: "killed", killedAt: now, killReason: reason ?? "Killed by reviewer" },
      });
    }

    return NextResponse.json({ ok: true, targetType, targetId, action });
  }

  if (targetType === "asset") {
    const asset = await db.marketingAsset.findUnique({ where: { id: targetId } });
    if (!asset) return NextResponse.json({ error: "Asset not found" }, { status: 404 });

    if (action === "approve") {
      await db.marketingAsset.update({
        where: { id: targetId },
        data: { status: "approved", approvedById: reviewerId, approvedAt: now },
      });
    } else if (action === "reject") {
      await db.marketingAsset.update({
        where: { id: targetId },
        data: { status: "draft" },
      });
    }

    return NextResponse.json({ ok: true, targetType, targetId, action });
  }

  return NextResponse.json({ error: "Invalid targetType" }, { status: 400 });
}

// GET /api/orchestrator/marketing/approvals
// List items pending approval.
export async function GET(req: NextRequest) {
  await requirePermission("marketing:view");

  const { searchParams } = new URL(req.url);
  const targetType = searchParams.get("type"); // "campaign" | "asset" | null (both)

  const results: Record<string, unknown> = {};

  if (!targetType || targetType === "campaign") {
    results.campaigns = await db.campaign.findMany({
      where: { status: "pending_approval" },
      include: {
        marketDefinition: { select: { widgetApp: true } },
      },
      orderBy: { createdAt: "asc" },
    });
  }

  if (!targetType || targetType === "asset") {
    results.assets = await db.marketingAsset.findMany({
      where: { status: "pending_approval" },
      include: {
        campaign: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "asc" },
    });
  }

  return NextResponse.json(results);
}
