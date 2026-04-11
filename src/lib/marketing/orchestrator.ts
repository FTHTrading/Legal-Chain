/**
 * Marketing Orchestrator — Core Operations
 *
 * Shared logic for marketing API routes: inventory, campaign CRUD,
 * asset management, lead tracking, and analytics aggregation.
 */

import { db } from "@/lib/db";
import { WIDGET_APPS, REVENUE_PRIORITY, MARKETING_CONSTANTS, type WidgetAppProfile } from "@/lib/marketing/config";
import { MARKETING_AGENTS } from "@/lib/agents/marketing-roster";
import type { WidgetAppId, CampaignStatus, ChannelType } from "@prisma/client";

// ── Init: Seed market definitions for all widget apps ────────────────

export async function initMarketDefinitions() {
  const results: Array<{ widgetApp: string; status: string }> = [];

  for (const app of WIDGET_APPS) {
    const existing = await db.marketDefinition.findUnique({
      where: { widgetApp: app.id },
    });

    if (existing) {
      results.push({ widgetApp: app.id, status: "exists" });
      continue;
    }

    await db.marketDefinition.create({
      data: {
        widgetApp: app.id,
        marketCategory: app.targetBuyer,
        targetBuyer: app.targetBuyer,
        urgencyLevel: app.urgencyLevel,
        avgLeadValue: app.avgLeadValueCents / 100,
        trustBarriers: app.trustBarriers,
        shortestPath: app.shortestPath,
        icp: app.targetBuyer,
        painPoints: [app.painPoint],
        competitorMap: {},
      },
    });

    results.push({ widgetApp: app.id, status: "created" });
  }

  return results;
}

// ── Campaign Operations ──────────────────────────────────────────────

export async function getCampaigns(filters?: {
  widgetApp?: WidgetAppId;
  status?: CampaignStatus;
  channel?: ChannelType;
}) {
  const where: Record<string, unknown> = {};

  if (filters?.status) where.status = filters.status;
  if (filters?.channel) where.channel = filters.channel;
  if (filters?.widgetApp) {
    where.marketDefinition = { widgetApp: filters.widgetApp };
  }

  return db.campaign.findMany({
    where,
    include: {
      marketDefinition: { select: { widgetApp: true, marketCategory: true } },
      _count: { select: { assets: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function createCampaign(data: {
  widgetApp: WidgetAppId;
  name: string;
  channel: ChannelType;
  offerHeadline?: string;
  offerDescription?: string;
  ctaText?: string;
  ctaUrl?: string;
  targetAudience?: string;
  budgetCents?: number;
}) {
  const market = await db.marketDefinition.findUnique({
    where: { widgetApp: data.widgetApp },
  });

  if (!market) {
    throw new Error(`No market definition found for widget app: ${data.widgetApp}. Run /init first.`);
  }

  return db.campaign.create({
    data: {
      marketDefinitionId: market.id,
      name: data.name,
      channel: data.channel,
      offerHeadline: data.offerHeadline,
      offerDescription: data.offerDescription,
      ctaText: data.ctaText,
      ctaUrl: data.ctaUrl,
      targetAudience: data.targetAudience,
      budgetCents: data.budgetCents,
      status: "draft",
    },
  });
}

// ── Analytics Aggregation ────────────────────────────────────────────

export async function getMarketingAnalytics(widgetApp?: WidgetAppId) {
  const where = widgetApp
    ? { marketDefinition: { widgetApp } }
    : {};

  const campaigns = await db.campaign.findMany({
    where,
    include: {
      marketDefinition: { select: { widgetApp: true, avgLeadValue: true } },
    },
  });

  const leads = await db.leadRecord.groupBy({
    by: ["widgetApp", "status"],
    _count: true,
    ...(widgetApp ? { where: { widgetApp } } : {}),
  });

  const totals = campaigns.reduce(
    (acc, c) => ({
      impressions: acc.impressions + c.impressions,
      clicks: acc.clicks + c.clicks,
      leads: acc.leads + c.leads,
      bookings: acc.bookings + c.bookings,
      conversions: acc.conversions + c.conversions,
      spentCents: acc.spentCents + c.spentCents,
      revenueCents: acc.revenueCents + c.revenueCents,
    }),
    { impressions: 0, clicks: 0, leads: 0, bookings: 0, conversions: 0, spentCents: 0, revenueCents: 0 },
  );

  const ctr = totals.impressions > 0 ? totals.clicks / totals.impressions : 0;
  const cpl = totals.leads > 0 ? totals.spentCents / totals.leads : 0;
  const roas = totals.spentCents > 0 ? totals.revenueCents / totals.spentCents : 0;

  return {
    campaigns: {
      total: campaigns.length,
      active: campaigns.filter((c) => c.status === "active").length,
      draft: campaigns.filter((c) => c.status === "draft").length,
      paused: campaigns.filter((c) => c.status === "paused").length,
    },
    kpis: {
      ...totals,
      ctr: Math.round(ctr * 10000) / 100, // percentage with 2 decimals
      cplCents: Math.round(cpl),
      roas: Math.round(roas * 100) / 100,
    },
    leads: leads.map((l) => ({
      widgetApp: l.widgetApp,
      status: l.status,
      count: l._count,
    })),
    revenuePriority: REVENUE_PRIORITY,
  };
}

// ── Widget App Inventory ─────────────────────────────────────────────

export function getWidgetInventory(): WidgetAppProfile[] {
  return WIDGET_APPS;
}

export function getAgentRoster() {
  return MARKETING_AGENTS.map((a) => ({
    id: a.id,
    name: a.name,
    team: a.team,
    mission: a.mission,
    status: a.status,
    capabilities: a.capabilities.map((c) => c.name),
  }));
}
