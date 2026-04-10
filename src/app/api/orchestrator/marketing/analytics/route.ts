import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/rbac";
import { getMarketingAnalytics } from "@/lib/marketing/orchestrator";
import type { WidgetAppId } from "@prisma/client";

// GET /api/orchestrator/marketing/analytics
// Campaign analytics dashboard data — KPIs, lead breakdown, revenue priority.
export async function GET(req: NextRequest) {
  await requirePermission("marketing:analytics");

  const { searchParams } = new URL(req.url);
  const widgetApp = searchParams.get("widgetApp") as WidgetAppId | null;

  const analytics = await getMarketingAnalytics(widgetApp ?? undefined);

  return NextResponse.json({
    ...analytics,
    timestamp: new Date().toISOString(),
  });
}
