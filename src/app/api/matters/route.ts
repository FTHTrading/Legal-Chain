import { NextRequest, NextResponse } from "next/server";
import { SEED_MATTER_CREAMER, ACTIVE_CASES } from "@/lib/data/seed";

// GET /api/matters — list all matters
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const namespace = searchParams.get("namespace");

  let filtered = ACTIVE_CASES;
  if (status) filtered = filtered.filter((m: { status?: string }) => m.status === status);
  if (namespace) filtered = filtered.filter((m: { namespace?: string }) => m.namespace === namespace);

  return NextResponse.json({
    matters: filtered,
    total: filtered.length,
    allCount: ACTIVE_CASES.length,
  });
}

// POST /api/matters — create a new matter
export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const required = ["clientName", "matterType", "description"] as const;
  const missing = required.filter((f) => !body[f] || String(body[f]).trim() === "");
  if (missing.length > 0) {
    return NextResponse.json(
      { error: "Missing required fields", missing },
      { status: 400 }
    );
  }

  const validTypes = ["property_dispute", "cryptocurrency_fraud", "civil_rights", "family_law", "criminal_defense", "estate_planning", "other"];
  if (!validTypes.includes(String(body.matterType))) {
    return NextResponse.json(
      { error: "Invalid matterType", validTypes },
      { status: 400 }
    );
  }

  const matterRef = `MTR-2026-${Date.now().toString(36).toUpperCase().slice(-6)}`;
  return NextResponse.json(
    {
      matterReference: matterRef,
      status: "pending_attorney_review",
      clientName: body.clientName,
      matterType: body.matterType,
      message: "Matter created — pending supervising attorney approval before case activation",
      createdAt: new Date().toISOString(),
    },
    { status: 201 }
  );
}
