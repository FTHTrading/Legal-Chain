import { NextRequest, NextResponse } from "next/server";
import { SEED_APPROVALS } from "@/lib/data/seed-platform";

// GET /api/approvals — list approval queue
export async function GET(request: NextRequest) {
  const status = request.nextUrl.searchParams.get("status");
  const matterId = request.nextUrl.searchParams.get("matterId");

  let items = SEED_APPROVALS;
  if (status) items = items.filter(a => a.status === status);
  if (matterId) items = items.filter(a => a.matterId === matterId);

  return NextResponse.json({
    approvals: items,
    total: items.length,
    pendingCount: SEED_APPROVALS.filter(a =>
      ["in_review", "requires_source_check", "requires_attorney_review"].includes(a.status)
    ).length,
  });
}

// POST /api/approvals — submit item for approval
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { title, category, summary } = body;
  if (!title || !category || !summary) {
    return NextResponse.json({ error: "Missing required fields: title, category, summary" }, { status: 400 });
  }
  const id = crypto.randomUUID();
  return NextResponse.json(
    {
      message: "Item submitted to approval queue",
      id,
      status: "draft",
      timestamp: new Date().toISOString(),
    },
    { status: 201 }
  );
}
