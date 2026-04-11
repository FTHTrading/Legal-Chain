import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/rbac";
import { getCampaigns, createCampaign } from "@/lib/marketing/orchestrator";
import type { WidgetAppId, ChannelType } from "@prisma/client";

// POST /api/orchestrator/marketing/launch
// Create a campaign for a widget app market launch.
export async function POST(req: NextRequest) {
  await requirePermission("marketing:manage");

  const body = await req.json();
  const { widgetApp, name, channel, offerHeadline, offerDescription, ctaText, ctaUrl, targetAudience, budgetCents } = body as {
    widgetApp: WidgetAppId;
    name: string;
    channel: ChannelType;
    offerHeadline?: string;
    offerDescription?: string;
    ctaText?: string;
    ctaUrl?: string;
    targetAudience?: string;
    budgetCents?: number;
  };

  if (!widgetApp || !name || !channel) {
    return NextResponse.json({ error: "widgetApp, name, and channel are required" }, { status: 400 });
  }

  try {
    const campaign = await createCampaign({
      widgetApp,
      name,
      channel,
      offerHeadline,
      offerDescription,
      ctaText,
      ctaUrl,
      targetAudience,
      budgetCents,
    });

    return NextResponse.json({ ok: true, campaign }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Campaign creation failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

// GET /api/orchestrator/marketing/launch
// List campaigns with optional filters.
export async function GET(req: NextRequest) {
  await requirePermission("marketing:view");

  const { searchParams } = new URL(req.url);
  const widgetApp = searchParams.get("widgetApp") as WidgetAppId | null;
  const status = searchParams.get("status") as import("@prisma/client").CampaignStatus | null;
  const channel = searchParams.get("channel") as ChannelType | null;

  const campaigns = await getCampaigns({
    ...(widgetApp ? { widgetApp } : {}),
    ...(status ? { status } : {}),
    ...(channel ? { channel } : {}),
  });

  return NextResponse.json({ campaigns, count: campaigns.length });
}
