import { NextResponse } from "next/server";
import { SEED_APPROVALS } from "@/lib/data/seed-platform";

// GET /api/documents — document index
export async function GET() {
  const docs = SEED_APPROVALS.filter(a =>
    ["demand_letter", "motion", "legal_brief", "court_filing"].includes(a.category)
  );
  return NextResponse.json({
    documents: docs.map(d => ({
      id: d.id,
      title: d.title,
      category: d.category,
      status: d.status,
      matterId: d.matterId,
      createdAt: d.createdAt,
    })),
    total: docs.length,
    endpoint: "/api/matters/[id]/documents",
  });
}
