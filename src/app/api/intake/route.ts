import { NextRequest, NextResponse } from "next/server";
import { SEED_INTAKES } from "@/lib/data/seed-platform";

// GET /api/intake — list intake queue
export async function GET() {
  return NextResponse.json({
    intakes: SEED_INTAKES,
    total: SEED_INTAKES.length,
    byStatus: {
      screening: SEED_INTAKES.filter(i => i.status === "screening").length,
      initial_review: SEED_INTAKES.filter(i => i.status === "initial_review").length,
      conflict_check: SEED_INTAKES.filter(i => i.status === "conflict_check").length,
    },
  });
}

// POST /api/intake — submit new intake
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { clientName, email, matterType, description } = body;
  if (!clientName || !email || !matterType || !description) {
    return NextResponse.json({ error: "Missing required fields: clientName, email, matterType, description" }, { status: 400 });
  }
  const id = crypto.randomUUID();
  const caseReference = `INT-2026-${id.slice(0, 3).toUpperCase()}`;
  return NextResponse.json(
    {
      message: "Intake received — entering screening queue",
      id,
      caseReference,
      status: "new",
      timestamp: new Date().toISOString(),
    },
    { status: 201 }
  );
}
