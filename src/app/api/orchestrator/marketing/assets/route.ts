import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import type { Prisma, AssetType, WidgetAppId, ChannelType } from "@prisma/client";

// POST /api/orchestrator/marketing/assets
// Create a marketing asset (ad copy, landing page, email sequence, etc.)
export async function POST(req: NextRequest) {
  await requirePermission("marketing:manage");

  const body = await req.json();
  const { campaignId, marketDefinitionId, assetType, title, content, widgetApp, channel, generatedByAgent, confidenceScore, metadata } = body as {
    campaignId?: string;
    marketDefinitionId?: string;
    assetType: AssetType;
    title: string;
    content: string;
    widgetApp?: WidgetAppId;
    channel?: ChannelType;
    generatedByAgent?: string;
    confidenceScore?: number;
    metadata?: Record<string, unknown>;
  };

  if (!assetType || !title || !content) {
    return NextResponse.json({ error: "assetType, title, and content are required" }, { status: 400 });
  }

  const asset = await db.marketingAsset.create({
    data: {
      campaignId,
      marketDefinitionId,
      assetType,
      title,
      content,
      widgetApp,
      channel,
      generatedByAgent,
      confidenceScore,
      metadata: (metadata ?? undefined) as Prisma.InputJsonValue | undefined,
      status: "draft",
    },
  });

  return NextResponse.json({ ok: true, asset }, { status: 201 });
}

// GET /api/orchestrator/marketing/assets
// List marketing assets with optional filters.
export async function GET(req: NextRequest) {
  await requirePermission("marketing:view");

  const { searchParams } = new URL(req.url);
  const widgetApp = searchParams.get("widgetApp") as WidgetAppId | null;
  const assetType = searchParams.get("assetType") as AssetType | null;
  const status = searchParams.get("status") as import("@prisma/client").CampaignStatus | null;
  const campaignId = searchParams.get("campaignId");

  const where: Record<string, unknown> = {};
  if (widgetApp) where.widgetApp = widgetApp;
  if (assetType) where.assetType = assetType;
  if (status) where.status = status;
  if (campaignId) where.campaignId = campaignId;

  const assets = await db.marketingAsset.findMany({
    where,
    include: {
      campaign: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ assets, count: assets.length });
}
